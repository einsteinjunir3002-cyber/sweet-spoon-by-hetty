import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/settings/public - Public site settings (no auth required)
export async function GET(_request: NextRequest) {
  try {
    const settings = await db.siteSettings.findFirst()
    const socialLinks = await db.socialLinks.findFirst()

    return NextResponse.json({
      settings: settings ?? null,
      socialLinks: socialLinks ?? null,
    })
  } catch (err) {
    console.error('Settings fetch error:', err)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}
