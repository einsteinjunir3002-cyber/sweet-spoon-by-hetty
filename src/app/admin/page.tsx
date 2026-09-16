'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './admin.module.css'

interface DashboardData {
  stats: {
    totalRevenue: number
    totalOrders: number
    pendingOrdersCount: number
    lowStockCount: number
  }
  recentOrders: Array<{
    id: string
    orderNumber: string
    customerName: string
    customerPhone: string
    total: number
    status: string
    createdAt: string
  }>
  lowStockProducts: Array<{
    id: string
    name: string
    inventory?: {
      quantity: number
      lowStockThreshold: number
    }
  }>
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  PAID:              { bg: '#dcfce7', color: '#15803d', label: 'Paid' },
  DELIVERED:         { bg: '#dcfce7', color: '#15803d', label: 'Delivered' },
  PENDING:           { bg: '#fef9c3', color: '#a16207', label: 'Pending' },
  PAYMENT_PENDING:   { bg: '#fef9c3', color: '#a16207', label: 'Payment Pending' },
  PREPARING:         { bg: '#fef3c7', color: '#92400e', label: 'Preparing' },
  OUT_FOR_DELIVERY:  { bg: '#e0f2fe', color: '#0369a1', label: 'Out for Delivery' },
  CANCELLED:         { bg: '#fee2e2', color: '#b91c1c', label: 'Cancelled' },
  REFUNDED:          { bg: '#fee2e2', color: '#b91c1c', label: 'Refunded' },
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    try {
      const res = await fetch('/api/admin/dashboard', { cache: 'no-store' })
      const resData = await res.json()
      setData(resData)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const fmt = (n: number) => `GH₵${n.toFixed(2)}`

  const getStatus = (status: string) => STATUS_STYLES[status] ?? { bg: '#f1f5f9', color: '#475569', label: status.replace(/_/g, ' ') }

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className={styles.dashboardGrid}>

      {/* === STAT CARDS === */}
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.statRevenue}`}>
          <div className={styles.statIconWrap}>💰</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Revenue</span>
            <strong className={styles.statValue}>{fmt(data?.stats.totalRevenue ?? 0)}</strong>
            <span className={styles.statHint}>All time earnings</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statOrders}`}>
          <div className={styles.statIconWrap}>🛒</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Orders</span>
            <strong className={styles.statValue}>{data?.stats.totalOrders ?? 0}</strong>
            <span className={styles.statHint}>All time orders</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statPending}`}>
          <div className={styles.statIconWrap}>⏳</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Pending Orders</span>
            <strong className={styles.statValue}>{data?.stats.pendingOrdersCount ?? 0}</strong>
            <span className={styles.statHint}>Awaiting action</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statStock}`}>
          <div className={styles.statIconWrap}>⚠️</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Low Stock Items</span>
            <strong className={styles.statValue}>{data?.stats.lowStockCount ?? 0}</strong>
            <span className={styles.statHint}>Need restocking</span>
          </div>
        </div>
      </div>

      {/* === QUICK ACTIONS === */}
      <div className={styles.quickActionsSection}>
        <div className={styles.sectionLabel}>⚡ Quick Actions</div>
        <div className={styles.quickActionsGrid}>
          <Link href="/admin/products?action=new" className={`${styles.qaCard} ${styles.qaAdd}`}>
            <span className={styles.qaIcon}>➕</span>
            <span className={styles.qaText}>Add Product</span>
          </Link>
          <Link href="/admin/orders" className={`${styles.qaCard} ${styles.qaOrders}`}>
            <span className={styles.qaIcon}>📦</span>
            <span className={styles.qaText}>Manage Orders</span>
          </Link>
          <Link href="/admin/coupons?action=new" className={`${styles.qaCard} ${styles.qaCoupon}`}>
            <span className={styles.qaIcon}>🎟️</span>
            <span className={styles.qaText}>Create Coupon</span>
          </Link>
          <Link href="/admin/delivery-zones" className={`${styles.qaCard} ${styles.qaDelivery}`}>
            <span className={styles.qaIcon}>🛵</span>
            <span className={styles.qaText}>Delivery Zones</span>
          </Link>
          <Link href="/admin/settings" className={`${styles.qaCard} ${styles.qaSettings}`}>
            <span className={styles.qaIcon}>⚙️</span>
            <span className={styles.qaText}>Store Settings</span>
          </Link>
          <button onClick={() => loadData(true)} className={`${styles.qaCard} ${styles.qaRefresh}`} disabled={refreshing}>
            <span className={styles.qaIcon}>{refreshing ? '⏳' : '🔄'}</span>
            <span className={styles.qaText}>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* === TWO-COL GRID === */}
      <div className={styles.twoColGrid}>

        {/* RECENT ORDERS */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>🛍️ Recent Orders</h2>
              <p className={styles.cardSubtitle}>Latest customer orders placed</p>
            </div>
            <Link href="/admin/orders" className={styles.viewAllLink}>
              View All →
            </Link>
          </div>
          <div className={styles.tableWrapper}>
            {data?.recentOrders && data.recentOrders.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => {
                    const s = getStatus(order.status)
                    return (
                      <tr key={order.id}>
                        <td className={styles.orderNumCell}>{order.orderNumber}</td>
                        <td>
                          <div className={styles.customerCell}>
                            <strong>{order.customerName}</strong>
                            <small>{order.customerPhone}</small>
                          </div>
                        </td>
                        <td className={styles.amountCell}>{fmt(order.total)}</td>
                        <td>
                          <span
                            className={styles.badge}
                            style={{ background: s.bg, color: s.color }}
                          >
                            {s.label}
                          </span>
                        </td>
                        <td className={styles.dateCell}>
                          {new Date(order.createdAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}
                        </td>
                        <td>
                          <Link href={`/admin/orders#order-${order.id}`} className={styles.tableActionBtn}>
                            Details
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🛒</div>
                <p>No orders yet! When customers place orders, they will appear here.</p>
                <Link href="/shop" target="_blank" className={styles.emptyAction}>
                  View Your Shop →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* LOW STOCK */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>📦 Stock Alerts</h2>
              <p className={styles.cardSubtitle}>Items running low on inventory</p>
            </div>
            <Link href="/admin/products" className={styles.viewAllLink}>
              Manage →
            </Link>
          </div>
          <div className={styles.stockList}>
            {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
              data.lowStockProducts.map((prod) => {
                const qty = prod.inventory?.quantity ?? 0
                const pct = Math.min(100, (qty / (prod.inventory?.lowStockThreshold ?? 10)) * 100)
                return (
                  <div key={prod.id} className={styles.stockItem}>
                    <div className={styles.stockInfo}>
                      <strong>{prod.name}</strong>
                      <div className={styles.stockBar}>
                        <div className={styles.stockBarFill} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={styles.stockQty}>Only {qty} units remaining</span>
                    </div>
                    <Link href={`/admin/products?edit=${prod.id}`} className={styles.restockBtn}>
                      Restock
                    </Link>
                  </div>
                )
              })
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🎉</div>
                <p>All products are well-stocked! Great job keeping up with inventory.</p>
              </div>
            )}
          </div>

          {/* Owner Tip */}
          <div className={styles.ownerTip}>
            <span className={styles.tipIcon}>💡</span>
            <span>Set low stock alerts on each product so you never run out unexpectedly.</span>
          </div>
        </div>
      </div>

      {/* === OWNER SHORTCUTS === */}
      <div className={styles.ownerShortcutsBar}>
        <span className={styles.shortcutsLabel}>👑 Owner Quick Links:</span>
        <a href="https://wa.me/233546686616" target="_blank" rel="noopener noreferrer" className={styles.shortcutLink}>
          💬 WhatsApp Business
        </a>
        <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className={styles.shortcutLink}>
          🗄️ Supabase DB
        </a>
        <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className={styles.shortcutLink}>
          🚀 Vercel Hosting
        </a>
        <a href="https://github.com/einsteinjunir3002-cyber/sweet-spoon-by-hetty" target="_blank" rel="noopener noreferrer" className={styles.shortcutLink}>
          📁 GitHub Code
        </a>
      </div>

    </div>
  )
}
