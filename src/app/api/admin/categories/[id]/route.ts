import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireOwner, slugify } from '@/lib/utils'
import { z } from 'zod'

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  isVisible: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

// PATCH /api/admin/categories/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireOwner()
  if (error) return error

  const { id } = await params

  try {
    const body = await request.json()
    const data = updateCategorySchema.parse(body)

    let slug: string | undefined
    if (data.name) {
      slug = slugify(data.name)
      const existing = await db.category.findFirst({ where: { slug, NOT: { id } } })
      if (existing) slug = `${slug}-${Date.now()}`
    }

    const category = await db.category.update({
      where: { id },
      data: { ...data, ...(slug ? { slug } : {}) },
    })

    return NextResponse.json({ category })
  } catch (err) {
    console.error('Update category error:', err)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireOwner()
  if (error) return error

  const { id } = await params

  try {
    const productCount = await db.product.count({ where: { categoryId: id } })
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${productCount} products. Move products first.` },
        { status: 400 }
      )
    }

    await db.category.delete({ where: { id } })
    return NextResponse.json({ message: 'Category deleted' })
  } catch (err) {
    console.error('Delete category error:', err)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
