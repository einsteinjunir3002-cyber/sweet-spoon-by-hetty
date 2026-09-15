import { Header } from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { WhatsAppFloat } from '@/components/store/WhatsAppFloat'
import { AnnouncementBar } from '@/components/store/AnnouncementBar'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

async function getLayoutData() {
  try {
    const [settings, socialLinks] = await Promise.all([
      db.siteSettings.findFirst(),
      db.socialLinks.findFirst(),
    ])
    return { settings, socialLinks }
  } catch {
    return { settings: null, socialLinks: null }
  }
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { settings, socialLinks } = await getLayoutData()

  return (
    <>
      {settings?.announcementEnabled && settings?.announcementText && (
        <AnnouncementBar text={settings.announcementText} />
      )}
      <Header
        logoUrl={settings?.logoUrl ?? undefined}
        businessName={settings?.businessName ?? 'Sweet Spoon by Hetty'}
      />
      <main id="main-content">
        {children}
      </main>
      <Footer settings={settings} socialLinks={socialLinks} />
      <WhatsAppFloat whatsappNumber={settings?.whatsappNumber ?? '0535372613'} />
    </>
  )
}
