import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireOwner } from '@/lib/utils'
import { siteSettingsSchema } from '@/lib/validations'

// GET /api/admin/settings
export async function GET(request: NextRequest) {
  const { error } = await requireOwner()
  if (error) return error

  const settings = await db.siteSettings.findFirst()
  const socialLinks = await db.socialLinks.findFirst()

  return NextResponse.json({ settings, socialLinks })
}

// PATCH /api/admin/settings
export async function PATCH(request: NextRequest) {
  const { error } = await requireOwner()
  if (error) return error

  try {
    const body = await request.json()

    // Handle site settings update
    if (body.type === 'social') {
      const social = await db.socialLinks.findFirst()
      if (social) {
        const updated = await db.socialLinks.update({
          where: { id: social.id },
          data: {
            tiktok: body.tiktok,
            instagram: body.instagram,
            facebook: body.facebook,
            whatsapp: body.whatsapp,
            youtube: body.youtube,
            twitter: body.twitter,
          },
        })
        return NextResponse.json(updated)
      } else {
        const created = await db.socialLinks.create({ data: body })
        return NextResponse.json(created)
      }
    }

    // Site settings
    const data = siteSettingsSchema.partial().parse(body)
    const existing = await db.siteSettings.findFirst()

    let settings
    if (existing) {
      settings = await db.siteSettings.update({
        where: { id: existing.id },
        data,
      })
    } else {
      settings = await db.siteSettings.create({ data: data as Parameters<typeof db.siteSettings.create>[0]['data'] })
    }

    return NextResponse.json(settings)
  } catch (err) {
    console.error('Settings update error:', err)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
