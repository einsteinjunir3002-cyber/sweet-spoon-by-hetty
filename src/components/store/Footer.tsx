import Link from 'next/link'
import styles from './Footer.module.css'

interface FooterProps {
  settings?: {
    businessName?: string | null
    phone1?: string | null
    phone2?: string | null
    whatsappNumber?: string | null
    address?: string | null
    city?: string | null
    region?: string | null
    email?: string | null
    businessHoursJson?: unknown
  } | null
  socialLinks?: {
    tiktok?: string | null
    instagram?: string | null
    facebook?: string | null
  } | null
}

export function Footer({ settings, socialLinks }: FooterProps) {
  const businessName = settings?.businessName ?? 'Sweet Spoon by Hetty'
  const phone1 = settings?.phone1 ?? '0535372613'
  const phone2 = settings?.phone2 ?? '0508168299'
  const whatsapp = settings?.whatsappNumber ?? '0535372613'
  const city = settings?.city ?? 'Ho'
  const region = settings?.region ?? 'Volta Region, Ghana'

  const whatsappUrl = `https://wa.me/233${whatsapp.replace(/^0/, '')}?text=${encodeURIComponent("Hello! I'd like to place an order.")}`

  return (
    <footer className={styles.footer}>
      {/* WhatsApp CTA Band */}
      <div className={styles.whatsappBand}>
        <div className="container">
          <div className={styles.whatsappBandInner}>
            <div>
              <h3 className={styles.whatsappTitle}>Ready to Order?</h3>
              <p className={styles.whatsappSubtitle}>Order directly on WhatsApp for quick service</p>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-lg"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Order on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className={styles.mainFooter}>
        <div className="container">
          <div className={styles.footerGrid}>
            {/* Brand */}
            <div className={styles.footerBrand}>
              <span className={styles.footerLogo}>
                <span className={styles.footerLogoMain}>Sweet Spoon</span>
                <span className={styles.footerLogoSub}>by Hetty</span>
              </span>
              <p className={styles.brandTagline}>
                Freshly Made. Naturally Delicious.
              </p>
              <p className={styles.brandDescription}>
                Premium Greek Yogurt, Probiotic Yogurt and Brukina — made fresh daily in {city}, {region}.
              </p>

              {/* Social Links */}
              <div className={styles.socialLinks}>
                {socialLinks?.tiktok && (
                  <a
                    href={`https://tiktok.com/${socialLinks.tiktok}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label="TikTok"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.83 1.55V6.79a4.85 4.85 0 01-1.06-.1z"/>
                    </svg>
                  </a>
                )}
                {socialLinks?.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label="Instagram"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </a>
                )}
                {socialLinks?.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label="Facebook"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  </a>
                )}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="WhatsApp"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className={styles.footerCol}>
              <h4 className={styles.footerColTitle}>Quick Links</h4>
              <ul className={styles.footerLinks}>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/shop">Shop</Link></li>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>

            {/* Policies */}
            <div className={styles.footerCol}>
              <h4 className={styles.footerColTitle}>Policies</h4>
              <ul className={styles.footerLinks}>
                <li><Link href="/policies/privacy">Privacy Policy</Link></li>
                <li><Link href="/policies/terms">Terms & Conditions</Link></li>
                <li><Link href="/policies/delivery">Delivery Policy</Link></li>
                <li><Link href="/policies/refund">Refund Policy</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className={styles.footerCol}>
              <h4 className={styles.footerColTitle}>Contact Us</h4>
              <ul className={styles.contactList}>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.52 4.52 19.79 19.79 0 011.47 2.2 2 2 0 013.17 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/>
                  </svg>
                  <a href={`tel:${phone1}`}>{phone1}</a>
                </li>
                {phone2 && (
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.52 4.52 19.79 19.79 0 011.47 2.2 2 2 0 013.17 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/>
                    </svg>
                    <a href={`tel:${phone2}`}>{phone2}</a>
                  </li>
                )}
                {settings?.address && (
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{settings.address}</span>
                  </li>
                )}
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{city}, {region}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className="container">
          <div className={styles.bottomInner}>
            <p className={styles.copyright}>
              © {new Date().getFullYear()} {businessName}. All rights reserved.
            </p>
            <div className={styles.bottomLinks}>
              <Link href="/account">My Account</Link>
              <Link href="/cart">Cart</Link>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp Order</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
