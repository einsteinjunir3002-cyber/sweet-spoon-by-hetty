import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireOwner, slugify } from '@/lib/utils'
import { productSchema } from '@/lib/validations'
import { z } from 'zod'

// GET /api/admin/products/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireOwner()
  if (error) return error

  const { id } = await params
  const product = await db.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      category: true,
      inventory: true,
      variants: true,
    },
  })

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json({ product })
}

// PATCH /api/admin/products/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireOwner()
  if (error) return error

  const { id } = await params

  try {
    const body = await request.json()
    const data = productSchema.partial().parse(body)

    // Regenerate slug if name changed
    let slug: string | undefined
    if (data.name) {
      slug = slugify(data.name)
      const existing = await db.product.findFirst({
        where: { slug, NOT: { id } },
      })
      if (existing) {
        slug = `${slug}-${Date.now()}`
      }
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...data,
        ...(slug ? { slug } : {}),
      },
      include: { images: true, category: true, inventory: true, variants: true },
    })

    // Update inventory if provided
    if (body.stock !== undefined) {
      await db.inventory.upsert({
        where: { productId: id },
        create: {
          productId: id,
          quantity: body.stock,
          trackStock: body.trackStock ?? true,
          lowStockThreshold: body.lowStockThreshold ?? 5,
        },
        update: {
          quantity: body.stock,
          ...(body.trackStock !== undefined ? { trackStock: body.trackStock } : {}),
          ...(body.lowStockThreshold !== undefined ? { lowStockThreshold: body.lowStockThreshold } : {}),
        },
      })
    }

    return NextResponse.json({ product })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'errors' in err) {
      return NextResponse.json({ error: 'Validation failed', details: (err as { errors: unknown }).errors }, { status: 400 })
    }
    console.error('Update product error:', err)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireOwner()
  if (error) return error

  const { id } = await params

  try {
    // Soft delete — archive instead of hard delete if product has orders
    const orderCount = await db.orderItem.count({ where: { productId: id } })

    if (orderCount > 0) {
      await db.product.update({ where: { id }, data: { isArchived: true, isPublished: false } })
      return NextResponse.json({ message: 'Product archived (it has existing orders)' })
    }

    await db.product.delete({ where: { id } })
    return NextResponse.json({ message: 'Product deleted' })
  } catch (err) {
    console.error('Delete product error:', err)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
