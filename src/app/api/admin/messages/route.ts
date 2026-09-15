import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireOwner } from '@/lib/utils'

// GET /api/admin/messages — Contact messages
export async function GET(request: NextRequest) {
  const { error } = await requireOwner()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const unreadOnly = searchParams.get('unread') === 'true'

  const where = unreadOnly ? { isRead: false } : {}

  const [messages, total] = await Promise.all([
    db.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.contactMessage.count({ where }),
  ])

  return NextResponse.json({ messages, total, page, limit })
}

// PATCH /api/admin/messages/[id] — Mark as read
export async function PATCH(request: NextRequest) {
  const { error } = await requireOwner()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Message ID required' }, { status: 400 })
  }

  const message = await db.contactMessage.update({
    where: { id },
    data: { isRead: true },
  })

  return NextResponse.json({ message })
}
