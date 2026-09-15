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

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
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
      <div className={`container ${styles.headerInner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo} aria-label={businessName}>
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
          <Link href="/cart" className={styles.cartBtn} aria-label={`Cart (${itemCount} items)`}>
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                placeholder="Search for products..."
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

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`} aria-hidden={!isMenuOpen}>
        <nav className={styles.mobileNav}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.mobileNavLink} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <hr className="divider" />
          {session?.user ? (
            <>
              <Link href={(session.user as { role?: string })?.role === 'OWNER' ? '/admin' : '/account'} className={styles.mobileNavLink}>
                {(session.user as { role?: string })?.role === 'OWNER' ? '⚙️ Admin Dashboard' : '👤 My Account'}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className={styles.mobileNavLink}
                style={{ textAlign: 'left', width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.mobileNavLink}>Login</Link>
              <Link href="/register" className={styles.mobileNavLink}>Create Account</Link>
            </>
          )}
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
