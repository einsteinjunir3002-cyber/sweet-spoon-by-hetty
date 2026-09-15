'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import styles from './admin-layout.module.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Don't wrap login page with admin shell
  if (pathname === '/login') {
    return <>{children}</>
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/orders', label: 'Orders', icon: '🛍️' },
    { href: '/admin/products', label: 'Products', icon: '🥛' },
    { href: '/admin/categories', label: 'Categories', icon: '🏷️' },
    { href: '/admin/delivery-zones', label: 'Delivery Zones', icon: '🛵' },
    { href: '/admin/coupons', label: 'Coupons & Promos', icon: '🎟️' },
    { href: '/admin/messages', label: 'Messages', icon: '💬' },
    { href: '/admin/settings', label: 'Store Settings', icon: '⚙️' },
  ]

  return (
    <div className={styles.adminContainer}>
      {/* Mobile Top Header */}
      <header className={styles.mobileHeader}>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={styles.menuBtn}
          aria-label="Toggle Navigation"
        >
          ☰
        </button>
        <span className={styles.mobileLogo}>Sweet Spoon Admin</span>
        <Link href="/" target="_blank" className={styles.viewStoreBtn}>
          View Store ↗
        </Link>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.brandTitle}>
            <span>Sweet Spoon</span>
            <small>Owner Portal</small>
          </Link>
        </div>

        <nav className={styles.navMenu}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`${styles.navItem} ${isActive ? styles.activeNavItem : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <strong>{session?.user?.name || 'Hetty'}</strong>
            <small>{session?.user?.email || 'Owner Account'}</small>
          </div>
          <div className={styles.footerActions}>
            <Link href="/" target="_blank" className={styles.storeLink}>
              🏪 Open Storefront
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className={styles.logoutBtn}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <div>
            <h1 className={styles.pageHeading}>Admin Dashboard</h1>
            <p className={styles.pageSubheading}>Welcome back, Hetty! Here is your business overview.</p>
          </div>
          <Link href="/" target="_blank" className={styles.desktopStoreLink}>
            🏪 View Customer Website
          </Link>
        </div>
        <div className={styles.pageWrapper}>{children}</div>
      </main>
    </div>
  )
}
