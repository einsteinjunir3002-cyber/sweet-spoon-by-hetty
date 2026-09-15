import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

// POST /api/contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = contactSchema.parse(body)

    await db.contactMessage.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        isRead: false,
      },
    })

    return NextResponse.json({ success: true, message: 'Message sent successfully! We will get back to you soon.' })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'errors' in err) {
      return NextResponse.json({ error: 'Invalid data', details: (err as { errors: unknown }).errors }, { status: 400 })
    }
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}
