import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/orders/[orderNumber] - Customer order tracking (public with order number)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params

    const order = await db.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isMain: true }, take: 1 } },
            },
          },
        },
        payment: { select: { status: true, method: true } },
        deliveryZone: { select: { name: true, estimatedTime: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Return safe customer-facing fields only (no internal IDs etc)
    return NextResponse.json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        customerName: order.customerName,
        deliveryType: order.deliveryType,
        deliveryAddress: order.deliveryAddress,
        deliveryArea: order.deliveryArea,
        deliveryNotes: order.deliveryNotes,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        deliveryFee: order.deliveryFee,
        total: order.total,
        createdAt: order.createdAt,
        items: order.items,
        payment: order.payment,
        deliveryZone: order.deliveryZone,
        statusHistory: order.statusHistory,
      },
    })
  } catch (err) {
    console.error('Order tracking error:', err)
    return NextResponse.json({ error: 'Failed to load order' }, { status: 500 })
  }
}
