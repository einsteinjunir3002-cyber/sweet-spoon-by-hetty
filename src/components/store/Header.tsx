'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/context/CartContext'
import styles from './Header.module.css'

interface HeaderProps {
  logoUrl?: string
  businessName?: string
}

export function Header({ logoUrl, businessName = 'Sweet Spoon by Hetty' }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const { data: session } = useSession()
  const { itemCount } = useCart()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const isOwnerOrAdmin = (session?.user as { role?: string })?.role === 'OWNER' || (session?.user as { role?: string })?.role === 'ADMIN'

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    ...(isOwnerOrAdmin ? [{ href: '/admin', label: '👑 Owner Panel' }] : []),
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.headerBg} aria-hidden="true" />
      <div className={`container ${styles.headerInner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo} aria-label={businessName} onClick={() => setIsMenuOpen(false)}>
          {logoUrl ? (
            <Image src={logoUrl} alt={businessName} width={140} height={50} priority />
          ) : (
            <span className={styles.logoText}>
              <span className={styles.logoMain}>Sweet Spoon</span>
              <span className={styles.logoSub}>by Hetty</span>
            </span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Search */}
          <button
            className={styles.iconBtn}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Search products"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Cart */}
          <Link href="/cart" className={styles.cartBtn} aria-label={`Cart (${itemCount} items)`} onClick={() => setIsMenuOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {itemCount > 0 && (
              <span className={styles.cartBadge}>{itemCount > 99 ? '99+' : itemCount}</span>
            )}
          </Link>

          {/* Account */}
          {session?.user ? (
            <div className={styles.accountMenu}>
              <Link href={(session.user as { role?: string })?.role === 'OWNER' ? '/admin' : '/account'} className={styles.iconBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            </div>
          ) : (
            <Link href="/login" className={`btn btn-primary btn-sm ${styles.loginBtn}`}>
              Login
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className={`${styles.menuToggle} hide-desktop`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className={styles.searchBar}>
          <div className="container">
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                type="search"
                placeholder="Search for yogurt, brukina, parfaits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`form-input ${styles.searchInput}`}
                autoFocus
                aria-label="Search products"
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Search
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setIsSearchOpen(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`} aria-hidden={!isMenuOpen}>
        <div className={styles.mobileHeader}>
          <div className={styles.mobileLogo}>
            <span className={styles.logoMain}>Sweet Spoon</span>
            <span className={styles.logoSub}>by Hetty</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className={styles.mobileNav}>
          <div className={styles.navSection}>
            <span className={styles.navSectionTitle}>Navigation</span>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.mobileNavLink} ${pathname === link.href ? styles.active : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span>{link.label}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ))}
            <Link
              href="/track"
              className={`${styles.mobileNavLink} ${pathname === '/track' ? styles.active : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span>Track My Order</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>

          <div className={styles.navSection}>
            <span className={styles.navSectionTitle}>Account & Orders</span>
            {session?.user ? (
              <>
                <Link
                  href={(session.user as { role?: string })?.role === 'OWNER' ? '/admin' : '/account'}
                  className={styles.mobileNavLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{(session.user as { role?: string })?.role === 'OWNER' ? '⚙️ Admin Dashboard' : '👤 Profile & Orders'}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    signOut({ callbackUrl: '/' })
                  }}
                  className={`${styles.mobileNavLink} ${styles.signOutBtn}`}
                >
                  <span>Sign Out</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                  <span>Sign In</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
                <Link href="/register" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                  <span>Create Account</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </>
            )}
          </div>

          <div className={styles.mobileFooter}>
            <a
              href="https://wa.me/233546686616?text=Hello%20Sweet%20Spoon%2C%20I%20would%20like%20to%20order%20some%20fresh%20yogurt!"
              target="_blank"
              rel="noopener noreferrer"
              className={`btn btn-whatsapp ${styles.mobileWaBtn}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.05-1.928-.485-1.503-.623-2.456-2.146-2.531-2.247-.075-.1-1.026-1.365-1.026-2.604 0-1.239.646-1.85.875-2.106.229-.255.498-.318.665-.318.167 0 .333.002.479.01.156.008.365-.059.57.433.214.512.729 1.776.792 1.905.063.129.104.281.017.452-.088.172-.132.278-.261.432-.13.153-.274.343-.391.46-.131.13-.267.271-.115.531.152.261.675 1.114 1.448 1.803.996.886 1.837 1.161 2.098 1.29.261.13.413.115.565-.06.152-.176.654-.761.828-1.022.174-.261.348-.218.586-.13.238.087 1.516.715 1.777.845.261.13.435.195.499.304.064.108.064.631-.08 1.036z"/>
              </svg>
              Quick Order via WhatsApp
            </a>
            <p className={styles.mobileContactNote}>📞 0535372613 • Ho / Kumasi, Ghana</p>
          </div>
        </nav>
      </div>

      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  )
}

export default Header
