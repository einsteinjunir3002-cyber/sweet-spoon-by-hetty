import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { calculateDiscount } from '@/lib/utils'
import { z } from 'zod'

const couponCheckSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().positive(),
})

// POST /api/checkout/coupon — validate and preview coupon discount
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, subtotal } = couponCheckSchema.parse(body)

    const coupon = await db.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
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
      return NextResponse.json({ error: 'Coupon code is invalid or has expired' }, { status: 400 })
    }

    if (coupon.minimumOrder && subtotal < coupon.minimumOrder) {
      return NextResponse.json({
        error: `Minimum order of GH₵${coupon.minimumOrder.toFixed(2)} required for this coupon`,
      }, { status: 400 })
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 })
    }

    const discountAmount = calculateDiscount(coupon, subtotal)

    return NextResponse.json({
      valid: true,
      discountAmount,
      type: coupon.type,
      value: coupon.value,
      description: coupon.type === 'PERCENTAGE'
        ? `${coupon.value}% off`
        : `GH₵${coupon.value.toFixed(2)} off`,
    })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'errors' in err) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    console.error('Coupon check error:', err)
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}
