import type { Metadata, Viewport } from 'next'
import './globals.css'
import { db } from '@/lib/db'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/lib/auth'
import { CartProvider } from '@/context/CartContext'
import { ThemeProvider } from '@/components/ThemeProvider'

async function getSiteSettings() {
  try {
    return await db.siteSettings.findFirst()
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  const siteName = settings?.businessName ?? 'Sweet Spoon by Hetty'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sweet-spoon-by-hetty.vercel.app'

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings?.seoTitle ?? `${siteName} — Freshly Made Yogurt & Brukina`,
      template: `%s | ${siteName}`,
    },
    description: settings?.seoDescription ?? 'Freshly made Greek Yogurt, Probiotic Yogurt and Brukina. 100% natural, no preservatives. Delivered in Kumasi & Ho, Ghana.',
    keywords: settings?.seoKeywords ?? 'greek yogurt, probiotic yogurt, brukina, Ghana, Kumasi, Ho, Volta, fresh yogurt, Sweet Spoon',
    openGraph: {
      type: 'website',
      siteName,
      title: settings?.seoTitle ?? siteName,
      description: settings?.seoDescription ?? 'Premium freshly made yogurt and Brukina from Kumasi & Ho, Ghana.',
      images: settings?.ogImageUrl ? [{ url: settings.ogImageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: settings?.seoTitle ?? siteName,
      description: settings?.seoDescription ?? 'Premium freshly made yogurt and Brukina.',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#EC4899',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = null
  try {
    session = await auth()
  } catch {
    session = null
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <SessionProvider session={session}>
          <CartProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
