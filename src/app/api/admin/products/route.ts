import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireOwner, slugify } from '@/lib/utils'
import { productSchema } from '@/lib/validations'

// GET /api/admin/products — List all products (admin)
export async function GET(request: NextRequest) {
  const { error } = await requireOwner()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '50')
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const status = searchParams.get('status') ?? ''

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (category) {
    where.categoryId = category
  }

  if (status === 'published') {
    where.isPublished = true
    where.isArchived = false
  } else if (status === 'draft') {
    where.isPublished = false
    where.isArchived = false
  } else if (status === 'archived') {
    where.isArchived = true
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        images: { where: { isMain: true }, take: 1 },
        category: true,
        inventory: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.product.count({ where }),
  ])

  return NextResponse.json({ products, total, page, limit })
}

// POST /api/admin/products — Create product with image support
export async function POST(request: NextRequest) {
  const { error } = await requireOwner()
  if (error) return error

  try {
    const body = await request.json()
    const data = productSchema.parse(body)

    // Generate unique slug
    let slug = slugify(data.name)
    const existing = await db.product.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    const product = await db.product.create({
      data: {
        ...data,
        slug,
        images: body.imageUrl ? {
          create: {
            url: body.imageUrl,
            altText: data.name,
            isMain: true,
          }
        } : undefined,
        inventory: {
          create: {
            quantity: body.stock ?? 50,
            trackStock: body.trackStock ?? true,
            lowStockThreshold: body.lowStockThreshold ?? 5,
          },
        },
      },
      include: {
        inventory: true,
        images: true,
        category: true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'errors' in err) {
      return NextResponse.json({ error: 'Validation failed', details: (err as { errors: unknown }).errors }, { status: 400 })
    }
    console.error('Create product error:', err)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
