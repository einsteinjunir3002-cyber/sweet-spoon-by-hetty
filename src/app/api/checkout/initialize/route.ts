import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { checkoutSchemaObject } from '@/lib/validations'
import { generateOrderNumber, calculateDiscount } from '@/lib/utils'
import { buildWhatsAppOrderMessage, buildWhatsAppUrl, WhatsAppOrderParams } from '@/lib/whatsapp'
import { z } from 'zod'

const checkoutBodySchema = checkoutSchemaObject.extend({
  cartItems: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().positive(),
    notes: z.string().optional(),
  })).min(1, 'Cart cannot be empty'),
}).refine((data) => {
  if (data.deliveryType === 'DELIVERY') {
    return !!data.deliveryAddress && !!data.deliveryZoneId
  }
  return true
}, {
  message: 'Delivery address and zone are required for delivery orders',
  path: ['deliveryAddress'],
})

/**
 * POST /api/checkout/initialize
 * 
 * Creates a pending order and initializes Paystack payment.
 * Returns the Paystack authorization URL.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = checkoutBodySchema.parse(body)

    // Validate products exist and are in stock
    const productIds = data.cartItems.map((item) => item.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds }, isPublished: true, isArchived: false },
      include: { inventory: true, variants: true },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'One or more products are no longer available' }, { status: 400 })
    }

    // Check stock
    for (const item of data.cartItems) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) continue

      if (product.inventory?.trackStock && (product.inventory.quantity < item.quantity)) {
        return NextResponse.json({
          error: `Sorry, "${product.name}" only has ${product.inventory.quantity} left in stock.`,
        }, { status: 400 })
      }
    }

    // Calculate subtotal
    let subtotal = 0
    const orderItemsData = data.cartItems.map((item) => {
      const product = products.find((p) => p.id === item.productId)!
      const variant = item.variantId
        ? product.variants.find((v) => v.id === item.variantId)
        : null
      const price = variant?.price ?? product.price
      subtotal += price * item.quantity

      return {
        productId: product.id,
        variantId: item.variantId,
        name: product.name + (variant ? ` (${variant.value})` : ''),
        price,
        quantity: item.quantity,
        notes: item.notes,
      }
    })

    // Validate coupon if provided
    let discountAmount = 0
    let couponId: string | undefined
    if (data.couponCode) {
      const coupon = await db.coupon.findFirst({
        where: {
          code: data.couponCode.toUpperCase(),
          isActive: true,
          OR: [
            { startDate: null },
            { startDate: { lte: new Date() } },
          ],
          AND: [
            { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
          ],
        },
      })

      if (!coupon) {
        return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 400 })
      }

      if (coupon.minimumOrder && subtotal < coupon.minimumOrder) {
        return NextResponse.json({
          error: `Minimum order of GH₵${coupon.minimumOrder.toFixed(2)} required for this coupon`,
        }, { status: 400 })
      }

      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 })
      }

      discountAmount = calculateDiscount(coupon, subtotal)
      couponId = coupon.id
    }

    // Get delivery fee
    let deliveryFee = 0
    if (data.deliveryType === 'DELIVERY' && data.deliveryZoneId) {
      const zone = await db.deliveryZone.findUnique({ where: { id: data.deliveryZoneId } })
      if (!zone || !zone.isActive) {
        return NextResponse.json({ error: 'Selected delivery zone is not available' }, { status: 400 })
      }

      if (zone.minimumOrder && subtotal < zone.minimumOrder) {
        return NextResponse.json({
          error: `Minimum order of GH₵${zone.minimumOrder.toFixed(2)} required for delivery to ${zone.name}`,
        }, { status: 400 })
      }

      deliveryFee = zone.fee
    }

    const total = Math.max(0, subtotal - discountAmount + deliveryFee)

    // Generate order number (idempotent key)
    const orderNumber = generateOrderNumber()

    // Create PENDING order
    const order = await db.order.create({
      data: {
        orderNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail || undefined,
        customerPhone: data.customerPhone,
        deliveryType: data.deliveryType,
        deliveryAddress: data.deliveryAddress,
        deliveryArea: data.deliveryArea,
        deliveryZoneId: data.deliveryZoneId,
        deliveryFee,
        deliveryNotes: data.deliveryNotes,
        orderNotes: data.orderNotes,
        subtotal,
        discountAmount,
        couponId,
        couponCode: data.couponCode,
        total,
        status: 'PENDING',
        items: { create: orderItemsData },
        statusHistory: {
          create: { status: 'PENDING', note: 'Order created via WhatsApp checkout' },
        },
      },
    })

    // Construct WhatsApp message
    const waParams: WhatsAppOrderParams = {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      orderNumber: order.orderNumber,
      items: orderItemsData.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      deliveryType: data.deliveryType,
      deliveryAddress: data.deliveryAddress || undefined,
      deliveryArea: data.deliveryArea || undefined,
      subtotal,
      deliveryFee,
      discountAmount,
      total,
      notes: data.orderNotes || undefined,
    }

    const message = buildWhatsAppOrderMessage(waParams)
    // The shop owner's number
    const whatsappNumber = process.env.WHATSAPP_NUMBER || '233535372613'
    const whatsappUrl = buildWhatsAppUrl(whatsappNumber, message)

    return NextResponse.json({
      orderId: order.id,
      orderNumber,
      authorizationUrl: whatsappUrl, // Keep this key for frontend compatibility
    })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'errors' in err) {
      return NextResponse.json({ error: 'Invalid order data', details: (err as { errors: unknown }).errors }, { status: 400 })
    }
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Failed to process checkout. Please try again.' }, { status: 500 })
  }
}
