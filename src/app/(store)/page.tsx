import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { db } from '@/lib/db'
import { ProductCard } from '@/components/store/ProductCard'
import { ComingSoon } from '@/components/store/ComingSoon'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sweet Spoon by Hetty — Freshly Made Yogurt & Brukina',
  description: 'Premium freshly made Greek Yogurt, Probiotic Yogurt and Brukina from Ho, Volta Region, Ghana. 100% natural, no preservatives.',
}

async function getHomeData() {
  try {
    const [settings, socialLinks, featuredProducts, categories] = await Promise.all([
      db.siteSettings.findFirst(),
      db.socialLinks.findFirst(),
      db.product.findMany({
        where: { isFeatured: true, isPublished: true, isArchived: false },
        include: {
          images: { where: { isMain: true }, take: 1 },
          inventory: true,
          category: true,
        },
        orderBy: { sortOrder: 'asc' },
        take: 6,
      }),
      db.category.findMany({
        where: { isVisible: true },
        orderBy: { sortOrder: 'asc' },
      }),
    ])
    return { settings, socialLinks, featuredProducts, categories }
  } catch {
    return {
      settings: null,
      socialLinks: null,
      featuredProducts: [],
      categories: [],
    }
  }
}

export default async function HomePage() {
  const { settings, socialLinks, featuredProducts, categories } = await getHomeData()

  // Show coming soon page if enabled
  if (settings?.comingSoonEnabled) {
    return (
      <ComingSoon
        settings={settings}
        socialLinks={socialLinks}
      />
    )
  }

  const heroTitle = settings?.heroTitle ?? 'Freshly Made. Naturally Delicious.'
  const heroSubtitle = settings?.heroSubtitle ?? 'Premium Greek Yogurt, Probiotic Yogurt and Brukina — made fresh daily in Ho, Volta Region, Ghana.'
  const rawWhatsapp = (settings?.whatsappNumber && typeof settings.whatsappNumber === 'string') ? settings.whatsappNumber : '0535372613'
  const cleanedWhatsapp = rawWhatsapp.replace(/[^0-9]/g, '').replace(/^0/, '')
  const whatsappUrl = `https://wa.me/233${cleanedWhatsapp || '535372613'}?text=${encodeURIComponent('Hello! I\'d like to place an order.')}`

  const features = (settings?.featuresJson as Array<{ icon: string; title: string; description: string }> | null) ?? [
    { icon: '🌿', title: 'Freshly Made Daily', description: 'Every batch is made fresh daily — no stockpiling, no compromise.' },
    { icon: '🦠', title: 'Probiotic Goodness', description: 'Packed with beneficial live cultures to support your gut health.' },
    { icon: '✨', title: '100% Natural', description: 'No preservatives, no artificial additives — just real ingredients.' },
    { icon: '🥛', title: 'Unsweetened Option', description: 'Clean, pure yogurt with no added sugar for the health-conscious.' },
  ]

  return (
    <div className={styles.page}>
      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className={styles.hero} aria-label="Hero">
        <div className={styles.heroImage}>
          <Image
            src="/images/hero-banner.jpg"
            alt="Sweet Spoon by Hetty — Freshly Made Yogurt"
            fill
            style={{ objectFit: 'cover' }}
            priority
            quality={85}
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <span className="label-sm">Sweet Spoon by Hetty</span>
            <h1 className={`display-1 ${styles.heroTitle}`}>
              {heroTitle}
            </h1>
            <p className={styles.heroSubtitle}>{heroSubtitle}</p>

            <div className={styles.heroCtas}>
              <Link href="/shop" className="btn btn-primary btn-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                Shop Now
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Order on WhatsApp
              </a>
            </div>

            {/* Trust badges */}
            <div className={styles.trustBadges}>
              <span className={styles.trustBadge}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Freshly Made Daily
              </span>
              <span className={styles.trustBadge}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                100% Natural
              </span>
              <span className={styles.trustBadge}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                No Preservatives
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURES / WHY CHOOSE US
          ============================================================ */}
      <section className={`section ${styles.featuresSection}`} aria-labelledby="features-heading">
        <div className="container">
          <div className="section-header">
            <span className="label-sm">Why Choose Us</span>
            <h2 id="features-heading">Made with Love & Care</h2>
            <p>Every product is crafted with the finest natural ingredients and delivered fresh to you.</p>
          </div>

          <div className={`grid-4 ${styles.featuresGrid}`}>
            {features.map((feature, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon} aria-hidden="true">{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURED PRODUCTS
          ============================================================ */}
      <section className={`section ${styles.productsSection}`} aria-labelledby="products-heading">
        <div className="container">
          <div className="section-header">
            <span className="label-sm">Our Products</span>
            <h2 id="products-heading">Fresh from Our Kitchen</h2>
            <p>Explore our range of fresh, natural yogurt and traditional Ghanaian Brukina.</p>
          </div>

          {featuredProducts.length > 0 ? (
            <>
              <div className="grid-3">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    currencySymbol={settings?.currencySymbol ?? 'GH₵'}
                  />
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: 'var(--spacing-10)' }}>
                <Link href="/shop" className="btn btn-secondary btn-lg">
                  View All Products
                </Link>
              </div>
            </>
          ) : (
            <div className={styles.noProducts}>
              <div className="empty-state">
                <div className="empty-state__icon">🥛</div>
                <h3 className="empty-state__title">Products Coming Soon!</h3>
                <p className="empty-state__description">
                  Our fresh products will be available shortly. In the meantime, order directly on WhatsApp!
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-lg"
                >
                  Order on WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          ABOUT SECTION
          ============================================================ */}
      <section className={`section ${styles.aboutSection}`} aria-labelledby="about-heading">
        <div className="container">
          <div className={styles.aboutGrid}>
            <div className={styles.aboutImage}>
              <Image
                src="/images/about-kitchen.jpg"
                alt="Sweet Spoon by Hetty kitchen — freshly made yogurt"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className={styles.aboutContent}>
              <span className="label-sm">Our Story</span>
              <h2 id="about-heading">
                {settings?.aboutTitle ?? 'Crafted Fresh, Every Single Day'}
              </h2>
              <div className={styles.aboutText}>
                {settings?.aboutText ? (
                  <p>{settings.aboutText}</p>
                ) : (
                  <>
                    <p>
                      Sweet Spoon by Hetty is a premium Ghanaian food brand based in Ho, Volta Region. 
                      We specialize in freshly made Greek Yogurt, Probiotic Yogurt and the beloved traditional 
                      Ghanaian Brukina.
                    </p>
                    <p>
                      Every batch is made fresh daily using only the finest natural ingredients — 
                      no preservatives, no artificial flavours, no shortcuts.
                    </p>
                  </>
                )}
              </div>

              <ul className={styles.aboutHighlights}>
                <li>
                  <span className={styles.highlightCheck}>✓</span>
                  Freshly made every day
                </li>
                <li>
                  <span className={styles.highlightCheck}>✓</span>
                  100% natural ingredients
                </li>
                <li>
                  <span className={styles.highlightCheck}>✓</span>
                  No preservatives
                </li>
                <li>
                  <span className={styles.highlightCheck}>✓</span>
                  Probiotic yogurt available
                </li>
              </ul>

              <div className={styles.aboutCtas}>
                <Link href="/about" className="btn btn-primary">
                  Learn More About Us
                </Link>
                <Link href="/contact" className="btn btn-secondary">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CALL TO ACTION BAND
          ============================================================ */}
      <section className={styles.ctaBand} aria-label="Order now">
        <div className="container">
          <div className={styles.ctaBandInner}>
            <div>
              <h2 className={styles.ctaTitle}>Ready to taste the difference?</h2>
              <p className={styles.ctaSubtitle}>
                Order now and experience freshly made yogurt delivered to you in Ho, Volta Region.
              </p>
            </div>
            <div className={styles.ctaButtons}>
              <Link href="/shop" className="btn btn-primary btn-lg">
                Shop Now
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Order on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CONTACT / SOCIAL SECTION
          ============================================================ */}
      <section className={`section-sm ${styles.socialSection}`} aria-labelledby="social-heading">
        <div className="container">
          <div className="section-header">
            <span className="label-sm">Follow Us</span>
            <h2 id="social-heading">Find Us on Social Media</h2>
          </div>
          <div className={styles.socialCards}>
            <a
              href={`https://www.tiktok.com/${socialLinks?.tiktok ?? '@sweetspoonbyherty'}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCard}
            >
              <div className={styles.socialCardIcon} style={{ background: '#000' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.83 1.55V6.79a4.85 4.85 0 01-1.06-.1z"/>
                </svg>
              </div>
              <span className={styles.socialCardHandle}>{socialLinks?.tiktok ?? '@sweetspoonbyherty'}</span>
              <span className={styles.socialCardLabel}>Follow on TikTok</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCard}
            >
              <div className={styles.socialCardIcon} style={{ background: '#25D366' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <span className={styles.socialCardHandle}>Sweet Spoon by Hetty</span>
              <span className={styles.socialCardLabel}>Order on WhatsApp</span>
            </a>

            {socialLinks?.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialCard}
              >
                <div className={styles.socialCardIcon} style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </div>
                <span className={styles.socialCardHandle}>Instagram</span>
                <span className={styles.socialCardLabel}>Follow on Instagram</span>
              </a>
            )}

            <div className={styles.socialCard} style={{ cursor: 'default' }}>
              <div className={styles.socialCardIcon} style={{ background: 'var(--color-pink-500)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.52 4.52 19.79 19.79 0 011.47 2.2 2 2 0 013.17 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/>
                </svg>
              </div>
              <span className={styles.socialCardHandle}>{settings?.phone1 ?? '0535372613'}</span>
              <span className={styles.socialCardLabel}>
                <a href={`tel:${settings?.phone1 ?? '0535372613'}`}>Call to Order</a>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
