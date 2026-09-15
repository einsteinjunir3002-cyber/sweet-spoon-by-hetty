import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/delivery-zones - Public delivery zones listing
export async function GET(_request: NextRequest) {
  try {
    const zones = await db.deliveryZone.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ zones })
  } catch (err) {
    console.error('Delivery zones fetch error:', err)
    return NextResponse.json({ error: 'Failed to load delivery zones' }, { status: 500 })
  }
}
