import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/products - Public product listing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '12')
    const category = searchParams.get('category') ?? ''
    const search = searchParams.get('search') ?? ''
    const sort = searchParams.get('sort') ?? 'createdAt_desc'
    const featured = searchParams.get('featured') === 'true'

    const where: Record<string, unknown> = {
      isPublished: true,
      isArchived: false,
    }

    if (category) {
      where.category = { slug: category }
    }

    if (featured) {
      where.isFeatured = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ]
    }

    const [sortField, sortDir] = sort.split('_')
    const orderBy: Record<string, string> = {}
    if (sortField === 'price') orderBy.price = sortDir === 'asc' ? 'asc' : 'desc'
    else if (sortField === 'name') orderBy.name = sortDir === 'asc' ? 'asc' : 'desc'
    else orderBy.createdAt = 'desc'

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          category: { select: { id: true, name: true, slug: true } },
          inventory: { select: { quantity: true, trackStock: true } },
          variants: true,
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({ products, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('Products fetch error:', err)
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 })
  }
}
