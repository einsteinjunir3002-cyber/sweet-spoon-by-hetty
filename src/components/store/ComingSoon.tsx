'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './ComingSoon.module.css'

interface ComingSoonProps {
  settings?: {
    businessName?: string | null
    launchDate?: Date | null
    comingSoonMessage?: string | null
    phone1?: string | null
    phone2?: string | null
    whatsappNumber?: string | null
    heroTitle?: string | null
  } | null
  socialLinks?: {
    tiktok?: string | null
    instagram?: string | null
  } | null
}

function useCountdown(targetDate: Date | null) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    if (!targetDate) return

    const calc = () => {
      const now = new Date().getTime()
      const target = new Date(targetDate).getTime()
      const diff = target - now

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }

    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return timeLeft
}

export function ComingSoon({ settings, socialLinks }: ComingSoonProps) {
  const timeLeft = useCountdown(settings?.launchDate ?? null)
  const rawWhatsapp = (settings?.whatsappNumber && typeof settings.whatsappNumber === 'string') ? settings.whatsappNumber : '0535372613'
  const cleanedWhatsapp = rawWhatsapp.replace(/[^0-9]/g, '').replace(/^0/, '')
  const whatsappUrl = `https://wa.me/233${cleanedWhatsapp || '535372613'}?text=${encodeURIComponent('Hello! I\'d like to know when you\'ll be ready to take orders.')}`
  const hasLaunchDate = !!settings?.launchDate

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoMain}>Sweet Spoon</span>
          <span className={styles.logoSub}>by Hetty</span>
        </div>

        {/* Tagline */}
        <p className={styles.tagline}>🥛 Freshly Made. Naturally Delicious.</p>

        {/* Heading */}
        <h1 className={styles.heading}>Launching Soon!</h1>

        {/* Message */}
        <p className={styles.message}>
          {settings?.comingSoonMessage ?? "We're getting everything ready to serve you the freshest yogurt and Brukina. Stay tuned!"}
        </p>

        {/* Countdown */}
        {hasLaunchDate && (
          <div className={styles.countdown}>
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.minutes },
              { label: 'Seconds', value: timeLeft.seconds },
            ].map(({ label, value }) => (
              <div key={label} className={styles.countdownItem}>
                <span className={styles.countdownValue}>{String(value).padStart(2, '0')}</span>
                <span className={styles.countdownLabel}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className={styles.ctas}>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Order on WhatsApp Now
          </a>
          <a href={`tel:${settings?.phone1 ?? '0535372613'}`} className="btn btn-secondary btn-lg">
            📞 {settings?.phone1 ?? '0535372613'}
          </a>
        </div>

        {/* Social */}
        <div className={styles.social}>
          <p>Follow us for updates:</p>
          <div className={styles.socialLinks}>
            <a
              href={`https://www.tiktok.com/${socialLinks?.tiktok ?? '@sweetspoonbyherty'}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="TikTok"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.83 1.55V6.79a4.85 4.85 0 01-1.06-.1z"/>
              </svg>
              TikTok
            </a>
            {socialLinks?.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                </svg>
                Instagram
              </a>
            )}
          </div>
        </div>

        {/* Admin link - hidden */}
        <Link href="/admin" className={styles.adminLink}>Admin</Link>
      </div>

      {/* Decorative background */}
      <div className={styles.bgDecor} aria-hidden="true">
        <div className={styles.bgCircle1} />
        <div className={styles.bgCircle2} />
        <div className={styles.bgCircle3} />
      </div>
    </div>
  )
}
