import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// POST /api/auth/register
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        password: hashedPassword,
        role: 'CUSTOMER',
        isActive: true,
        mustChangePassword: false,
      },
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json({ user, message: 'Account created successfully!' }, { status: 201 })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'errors' in err) {
      return NextResponse.json({ error: 'Invalid data', details: (err as { errors: unknown }).errors }, { status: 400 })
    }
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 })
  }
}
