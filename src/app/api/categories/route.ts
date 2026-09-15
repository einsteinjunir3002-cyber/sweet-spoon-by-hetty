import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/categories - Public categories
export async function GET(_request: NextRequest) {
  try {
    const categories = await db.category.findMany({
      where: { isVisible: true },
      include: {
        _count: { select: { products: { where: { isPublished: true, isArchived: false } } } },
      },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ categories })
  } catch (err) {
    console.error('Categories fetch error:', err)
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 })
  }
}
