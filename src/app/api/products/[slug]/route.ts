import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/products/[slug]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const product = await db.product.findFirst({
      where: { slug, isPublished: true, isArchived: false },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
        inventory: true,
        variants: true,
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (err) {
    console.error('Product fetch error:', err)
    return NextResponse.json({ error: 'Failed to load product' }, { status: 500 })
  }
}
