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

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((resData) => {
        setData(resData)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load dashboard:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  const formatMoney = (amount: number) => `GH₵${amount.toFixed(2)}`

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'DELIVERED':
        return styles.badgeSuccess
      case 'PENDING':
      case 'PAYMENT_PENDING':
      case 'PREPARING':
        return styles.badgeWarning
      case 'OUT_FOR_DELIVERY':
        return styles.badgeInfo
      case 'CANCELLED':
      case 'REFUNDED':
        return styles.badgeDanger
      default:
        return styles.badgeDefault
    }
  }

  return (
    <div className={styles.dashboardGrid}>
      {/* Stat Cards */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}>
            💰
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Revenue</span>
            <strong className={styles.statValue}>{formatMoney(data?.stats.totalRevenue ?? 0)}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fdf4ff', color: '#a855f7' }}>
            🛒
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Orders</span>
            <strong className={styles.statValue}>{data?.stats.totalOrders ?? 0}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fff7ed', color: '#ea580c' }}>
            ⏳
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Pending Orders</span>
            <strong className={styles.statValue}>{data?.stats.pendingOrdersCount ?? 0}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fef2f2', color: '#dc2626' }}>
            ⚠️
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Low Stock Items</span>
            <strong className={styles.statValue}>{data?.stats.lowStockCount ?? 0}</strong>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className={styles.quickActionsBar}>
        <Link href="/admin/products?action=new" className={styles.actionBtn}>
          ➕ Add New Product
        </Link>
        <Link href="/admin/orders" className={styles.actionBtnOutline}>
          📦 Manage Orders
        </Link>
        <Link href="/admin/coupons?action=new" className={styles.actionBtnOutline}>
          🎟️ Create Coupon
        </Link>
        <Link href="/admin/delivery-zones" className={styles.actionBtnOutline}>
          🛵 Delivery Zones
        </Link>
      </div>

      {/* Main Two Columns */}
      <div className={styles.twoColumnGrid}>
        {/* Recent Orders Table */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Recent Orders</h2>
            <Link href="/admin/orders" className={styles.viewAllLink}>
              View All Orders →
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
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className={styles.orderNumCell}>{order.orderNumber}</td>
                      <td>
                        <div className={styles.customerCell}>
                          <strong>{order.customerName}</strong>
                          <small>{order.customerPhone}</small>
                        </div>
                      </td>
                      <td className={styles.amountCell}>{formatMoney(order.total)}</td>
                      <td>
                        <span className={`${styles.badge} ${getStatusBadgeClass(order.status)}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className={styles.dateCell}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <Link href={`/admin/orders#order-${order.id}`} className={styles.tableActionBtn}>
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.emptyState}>
                <p>No orders yet. When customers place orders, they will appear here!</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Stock Level Alerts</h2>
            <Link href="/admin/products" className={styles.viewAllLink}>
              Manage Inventory →
            </Link>
          </div>
          <div className={styles.stockList}>
            {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
              data.lowStockProducts.map((prod) => (
                <div key={prod.id} className={styles.stockItem}>
                  <div>
                    <strong>{prod.name}</strong>
                    <span className={styles.stockQty}>
                      Only {prod.inventory?.quantity ?? 0} units left
                    </span>
                  </div>
                  <Link href={`/admin/products?edit=${prod.id}`} className={styles.restockBtn}>
                    Restock
                  </Link>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>🎉 All products are well stocked!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
