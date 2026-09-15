import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireOwner } from '@/lib/utils'

// PATCH /api/admin/orders/[id] — Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireOwner()
  if (error) return error

  try {
    const { status, note } = await request.json()

    const validStatuses = [
      'PENDING', 'PAYMENT_PENDING', 'PAID', 'CONFIRMED',
      'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED',
      'CANCELLED', 'REFUNDED',
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const order = await db.order.update({
      where: { id: params.id },
      data: {
        status,
        statusHistory: {
          create: {
            status,
            note: note ?? `Status updated to ${status}`,
          },
        },
      },
      include: {
        items: true,
        payment: true,
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    })

    return NextResponse.json(order)
  } catch (err) {
    console.error('Update order error:', err)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

// GET /api/admin/orders/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireOwner()
  if (error) return error

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          product: { include: { images: { where: { isMain: true }, take: 1 } } },
          variant: true,
        },
      },
      payment: true,
      deliveryZone: true,
      coupon: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json(order)
}
