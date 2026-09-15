import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireOwner } from '@/lib/utils'
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns'

// GET /api/admin/dashboard — Dashboard summary statistics
export async function GET(_request: NextRequest) {
  const { error } = await requireOwner()
  if (error) return error

  const now = new Date()
  const todayStart = startOfDay(now)
  const weekStart = startOfWeek(now)
  const monthStart = startOfMonth(now)

  const [
    todayOrders,
    pendingOrders,
    todaySalesResult,
    weekSalesResult,
    monthSalesResult,
    totalOrders,
    recentOrders,
    lowStockProducts,
    newMessages,
    productCount,
  ] = await Promise.all([
    db.order.count({ where: { createdAt: { gte: todayStart } } }),
    db.order.count({ where: { status: { in: ['PAID', 'CONFIRMED', 'PREPARING'] } } }),
    db.order.aggregate({
      where: { status: { in: ['PAID', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'] }, createdAt: { gte: todayStart } },
      _sum: { total: true },
    }),
    db.order.aggregate({
      where: { status: { in: ['PAID', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'] }, createdAt: { gte: weekStart } },
      _sum: { total: true },
    }),
    db.order.aggregate({
      where: { status: { in: ['PAID', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'] }, createdAt: { gte: monthStart } },
      _sum: { total: true },
    }),
    db.order.count(),
    db.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: { include: { images: { where: { isMain: true }, take: 1 } } } } },
        payment: { select: { status: true } },
      },
    }),
    db.inventory.findMany({
      where: {
        trackStock: true,
        quantity: { lte: db.inventory.fields.lowStockThreshold },
      },
      include: { product: { include: { images: { where: { isMain: true }, take: 1 } } } },
      take: 10,
    }),
    db.contactMessage.count({ where: { isRead: false } }),
    db.product.count({ where: { isArchived: false } }),
  ])

  return NextResponse.json({
    todayOrders,
    pendingOrders,
    todaySales: todaySalesResult._sum.total ?? 0,
    weekSales: weekSalesResult._sum.total ?? 0,
    monthSales: monthSalesResult._sum.total ?? 0,
    totalOrders,
    recentOrders,
    lowStockProducts,
    newMessages,
    productCount,
  })
}
