import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyWebhookSignature, verifyPayment } from '@/lib/paystack'
import { PaymentMethod } from '@prisma/client'

/**
 * POST /api/checkout/webhook
 * Paystack webhook handler - receives payment status updates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature') ?? ''

    // Verify webhook authenticity
    if (!verifyWebhookSignature(body, signature)) {
      console.warn('Paystack webhook: invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body) as {
      event: string
      data: {
        reference: string
        status: string
        amount: number
        channel: string
        metadata: {
          orderId: string
          orderNumber: string
          customerName: string
          customerPhone: string
        }
      }
    }

    if (event.event === 'charge.success') {
      const { reference } = event.data

      // Check idempotency — already processed?
      const payment = await db.payment.findUnique({ where: { reference } })
      if (!payment) {
        console.warn(`Paystack webhook: payment reference ${reference} not found`)
        return NextResponse.json({ received: true })
      }

      if (payment.status === 'SUCCESS') {
        // Already processed — return 200 to prevent Paystack retrying
        return NextResponse.json({ received: true })
      }

      // Server-side verify with Paystack API
      const verification = await verifyPayment(reference)
      if (!verification.status || verification.data.status !== 'success') {
        console.error(`Paystack webhook: verification failed for ${reference}`)
        await db.payment.update({
          where: { reference },
          data: {
            status: 'FAILED',
            paystackData: verification.data as object,
          },
        })
        return NextResponse.json({ received: true })
      }

      // Mark payment as successful and update order
      await db.$transaction(async (tx) => {
        // Update payment
        await tx.payment.update({
          where: { reference },
          data: {
            status: 'SUCCESS',
            method: mapPaystackChannel(verification.data.channel),
            paystackData: verification.data as object,
            verifiedAt: verification.data.paid_at ? new Date(verification.data.paid_at) : new Date(),
          },
        })

        // Update order status
        const order = await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'PAID' },
          include: {
            items: true,
          },
        })

        // Add status history
        await tx.orderStatusHistory.create({
          data: {
            orderId: payment.orderId,
            status: 'PAID',
            note: `Payment confirmed via ${verification.data.channel}`,
          },
        })

        // Deduct inventory (prevent overselling)
        for (const item of order.items) {
          const inventory = await tx.inventory.findUnique({
            where: { productId: item.productId },
          })

          if (inventory && inventory.trackStock) {
            await tx.inventory.update({
              where: { productId: item.productId },
              data: {
                quantity: { decrement: item.quantity },
              },
            })
          }
        }

        // Mark coupon as used if applicable
        if (order.couponId) {
          await tx.coupon.update({
            where: { id: order.couponId },
            data: { usageCount: { increment: 1 } },
          })
        }
      })

      console.log(`Payment confirmed for order ${payment.orderId}`)
    }

    if (event.event === 'charge.failed') {
      const { reference } = event.data
      const payment = await db.payment.findUnique({ where: { reference } })
      if (payment && payment.status === 'PENDING') {
        await db.payment.update({
          where: { reference },
          data: {
            status: 'FAILED',
            paystackData: event.data as object,
          },
        })
        await db.order.update({
          where: { id: payment.orderId },
          data: { status: 'PAYMENT_PENDING' },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook processing error:', err)
    // Return 200 to prevent Paystack from retrying for server errors
    return NextResponse.json({ received: true })
  }
}

function mapPaystackChannel(channel?: string): PaymentMethod {
  if (channel === 'card') return PaymentMethod.CARD
  return PaymentMethod.MOBILE_MONEY
}
