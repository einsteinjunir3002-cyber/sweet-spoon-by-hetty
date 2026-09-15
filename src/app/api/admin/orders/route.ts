import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireOwner } from '@/lib/utils'

// GET /api/admin/orders
export async function GET(request: NextRequest) {
  const { error } = await requireOwner()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const status = searchParams.get('status') ?? ''
  const search = searchParams.get('search') ?? ''

  const where: Record<string, unknown> = {}

  if (status) {
    where.status = status
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerPhone: { contains: search } },
    ]
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        items: { include: { product: { include: { images: { where: { isMain: true }, take: 1 } } } } },
        payment: true,
        deliveryZone: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.order.count({ where }),
  ])

  return NextResponse.json({ orders, total, page, limit })
}
