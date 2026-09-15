import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPayment } from '@/lib/paystack'
import { PaymentMethod } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/checkout/verify?ref=REFERENCE
 * Called after customer returns from Paystack
 * Server-side verifies payment status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('ref')

    if (!reference) {
      return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 })
    }

    const payment = await db.payment.findUnique({
      where: { reference },
      include: { order: true },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    // If webhook already marked it as success, return immediately
    if (payment.status === 'SUCCESS') {
      return NextResponse.json({
        status: 'success',
        orderNumber: payment.order.orderNumber,
        orderId: payment.orderId,
      })
    }

    // Otherwise verify with Paystack API
    const verification = await verifyPayment(reference)

    if (!verification.status || verification.data.status !== 'success') {
      return NextResponse.json({
        status: 'failed',
        orderNumber: payment.order.orderNumber,
        message: verification.data?.gateway_response ?? 'Payment was not successful',
      })
    }

    // Process payment success inside transaction
    await db.$transaction(async (tx) => {
      await tx.payment.update({
        where: { reference },
        data: {
          status: 'SUCCESS',
          method: mapPaystackChannel(verification.data.channel),
          paystackData: verification.data as object,
          verifiedAt: new Date(),
        },
      })

      const order = await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAID' },
        include: { items: true },
      })

      await tx.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          status: 'PAID',
          note: `Payment confirmed via ${verification.data.channel}`,
        },
      })

      for (const item of order.items) {
        const inventory = await tx.inventory.findUnique({
          where: { productId: item.productId },
        })
        if (inventory?.trackStock) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: { quantity: { decrement: item.quantity } },
          })
        }
      }

      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: { usageCount: { increment: 1 } },
        })
      }
    })

    return NextResponse.json({
      status: 'success',
      orderNumber: payment.order.orderNumber,
      orderId: payment.orderId,
    })
  } catch (err) {
    console.error('Payment verification error:', err)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}

function mapPaystackChannel(channel?: string): PaymentMethod {
  if (channel === 'card') return PaymentMethod.CARD
  return PaymentMethod.MOBILE_MONEY
}
