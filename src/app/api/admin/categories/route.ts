import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireOwner, slugify } from '@/lib/utils'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  image: z.string().optional(),
  isVisible: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
})

// GET /api/admin/categories
export async function GET(_request: NextRequest) {
  const { error } = await requireOwner()
  if (error) return error

  const categories = await db.category.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json({ categories })
}

// POST /api/admin/categories
export async function POST(request: NextRequest) {
  const { error } = await requireOwner()
  if (error) return error

  try {
    const body = await request.json()
    const data = categorySchema.parse(body)

    let slug = slugify(data.name)
    const existing = await db.category.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const category = await db.category.create({
      data: { ...data, slug },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'errors' in err) {
      return NextResponse.json({ error: 'Validation failed', details: (err as { errors: unknown }).errors }, { status: 400 })
    }
    console.error('Create category error:', err)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
