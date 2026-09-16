import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    const type = searchParams.get('type') // 'product' or 'profile'

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
    }

    // Role check: Only OWNER can upload product images
    if (type === 'product' && session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Forbidden. Only owners can upload product images.' }, { status: 403 })
    }

    if (!request.body) {
      return NextResponse.json({ error: 'No request body' }, { status: 400 })
    }

    const blob = await put(filename, request.body, {
      access: 'public',
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Upload Error:', error)
    return NextResponse.json(
      { error: 'An error occurred during upload.' },
      { status: 500 }
    )
  }
}
