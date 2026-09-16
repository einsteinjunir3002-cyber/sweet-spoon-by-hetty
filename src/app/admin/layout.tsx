'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import styles from './admin-layout.module.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const update = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit', hour12: true }))
      setGreeting(getTimeOfDay())
    }
    update()
    const t = setInterval(update, 60000)
    return () => clearInterval(t)
  }, [])

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
    { href: '/admin/orders', label: 'Orders', icon: '🛍️' },
    { href: '/admin/products', label: 'Products', icon: '🥛' },
    { href: '/admin/delivery-zones', label: 'Delivery Zones', icon: '🛵' },
    { href: '/admin/coupons', label: 'Coupons & Promos', icon: '🎟️' },
    { href: '/admin/settings', label: 'Store Settings', icon: '⚙️' },
  ]

  const userName = session?.user?.name || 'Hetty'
  const userInitial = userName.charAt(0).toUpperCase()

  if (status === 'loading') {
    return (
      <div className={styles.portalLoading}>
        <div className={styles.portalSpinner} />
        <p>Loading Owner Portal...</p>
      </div>
    )
  }

  return (
    <div className={styles.adminContainer}>

      {/* === MOBILE TOPBAR === */}
      <header className={styles.mobileHeader}>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={styles.menuBtn}
          aria-label="Toggle Navigation"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {isSidebarOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
        <div className={styles.mobileBrand}>
          <span className={styles.mobileCrown}>👑</span>
          <span>Owner Portal</span>
        </div>
        <Link href="/" target="_blank" className={styles.viewStoreBtn}>
          Store ↗
        </Link>
      </header>

      {/* === SIDEBAR OVERLAY === */}
      {isSidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* === SIDEBAR === */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        {/* Brand Header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.brandLogo}>
            <div className={styles.brandCrownBadge}>👑</div>
            <div>
              <span className={styles.brandName}>Sweet Spoon</span>
              <span className={styles.brandRole}>Owner Portal</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className={styles.navMenu}>
          <div className={styles.navLabel}>MANAGEMENT</div>
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.activeNavItem : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel2}>{item.label}</span>
                {isActive && <span className={styles.activeIndicator} />}
              </Link>
            )
          })}

          <div className={styles.navDivider} />
          <div className={styles.navLabel}>STOREFRONT</div>
          <Link href="/" target="_blank" className={styles.navItem}>
            <span className={styles.navIcon}>🏪</span>
            <span className={styles.navLabel2}>View Live Store</span>
            <span className={styles.externalIcon}>↗</span>
          </Link>
        </nav>

        {/* User Footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>{userInitial}</div>
            <div className={styles.userDetails}>
              <strong>{userName}</strong>
              <span className={styles.userBadge}>👑 Owner</span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={styles.logoutBtn}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* === MAIN CONTENT === */}
      <main className={styles.mainContent}>
        {/* Top Content Header */}
        <div className={styles.contentHeader}>
          <div className={styles.pageInfo}>
            <div className={styles.pageGreeting}>
              Good {greeting || 'Day'}! <span className={styles.ownerName}>{userName} 👋</span>
            </div>
            <div className={styles.pageTime}>{currentTime} • Sweet Spoon Owner Dashboard</div>
          </div>
          <Link href="/" target="_blank" className={styles.desktopStoreLink}>
            🏪 View Customer Website ↗
          </Link>
        </div>

        {/* Page Content */}
        <div className={styles.pageWrapper}>{children}</div>
      </main>
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}
