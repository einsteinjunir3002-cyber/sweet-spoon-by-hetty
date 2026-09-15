'use client'

import { useState, useEffect } from 'react'
import styles from './orders-admin.module.css'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  notes?: string | null
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail?: string | null
  customerPhone: string
  deliveryType: string
  deliveryAddress?: string | null
  deliveryArea?: string | null
  deliveryFee: number
  deliveryNotes?: string | null
  subtotal: number
  discountAmount: number
  total: number
  status: string
  createdAt: string
  items: OrderItem[]
  payment?: {
    reference: string
    method: string
    status: string
  } | null
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchOrders = () => {
    setLoading(true)
    fetch('/api/admin/orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Fetch orders error:', err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        fetchOrders()
      }
    } catch (err) {
      console.error('Update status error:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredOrders = selectedStatus === 'ALL'
    ? orders
    : orders.filter((o) => o.status === selectedStatus)

  const formatMoney = (val: number) => `GH₵${val.toFixed(2)}`

  const getStatusBadge = (status: string) => {
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
    <div className={styles.container}>
      {/* Status Filter Tabs */}
      <div className={styles.tabsRow}>
        {['ALL', 'PAYMENT_PENDING', 'PAID', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`${styles.tabBtn} ${selectedStatus === st ? styles.activeTab : ''}`}
          >
            {st === 'ALL' ? 'All Orders' : st.replace(/_/g, ' ')}
            <span className={styles.tabCount}>
              {st === 'ALL' ? orders.length : orders.filter((o) => o.status === st).length}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className={styles.loading}>Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>No orders found in this category.</div>
      ) : (
        <div className={styles.ordersList}>
          {filteredOrders.map((order) => {
            const whatsappText = `Hello ${order.customerName}, your order #${order.orderNumber} from Sweet Spoon by Hetty status is now: ${order.status.replace(/_/g, ' ')}.`
            const whatsappUrl = `https://wa.me/233${order.customerPhone.replace(/^0/, '')}?text=${encodeURIComponent(whatsappText)}`

            return (
              <div key={order.id} id={`order-${order.id}`} className={styles.orderCard}>
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.orderNum}>{order.orderNumber}</span>
                    <span className={styles.dateText}>
                      Placed on {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.statusSection}>
                    <span className={`${styles.badge} ${getStatusBadge(order.status)}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  {/* Customer Info */}
                  <div className={styles.infoCol}>
                    <h4>Customer Details</h4>
                    <p><strong>Name:</strong> {order.customerName}</p>
                    <p><strong>Phone:</strong> <a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a></p>
                    {order.customerEmail && <p><strong>Email:</strong> {order.customerEmail}</p>}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.whatsappNoticeBtn}
                    >
                      💬 Message Customer on WhatsApp
                    </a>
                  </div>

                  {/* Delivery Info */}
                  <div className={styles.infoCol}>
                    <h4>Delivery Info</h4>
                    <p><strong>Type:</strong> {order.deliveryType}</p>
                    {order.deliveryAddress && (
                      <p><strong>Address:</strong> {order.deliveryAddress}</p>
                    )}
                    {order.deliveryArea && (
                      <p><strong>Area:</strong> {order.deliveryArea}</p>
                    )}
                    {order.deliveryNotes && (
                      <p className={styles.notesText}><strong>Notes:</strong> {order.deliveryNotes}</p>
                    )}
                  </div>

                  {/* Order Summary & Items */}
                  <div className={styles.infoCol}>
                    <h4>Items Ordered</h4>
                    <ul className={styles.itemList}>
                      {order.items.map((item) => (
                        <li key={item.id}>
                          <span>{item.quantity}x {item.name}</span>
                          <strong>{formatMoney(item.price * item.quantity)}</strong>
                        </li>
                      ))}
                    </ul>
                    <div className={styles.totalsBox}>
                      <div><span>Subtotal:</span> {formatMoney(order.subtotal)}</div>
                      {order.discountAmount > 0 && (
                        <div className={styles.discountRow}>
                          <span>Discount:</span> -{formatMoney(order.discountAmount)}
                        </div>
                      )}
                      <div><span>Delivery Fee:</span> {formatMoney(order.deliveryFee)}</div>
                      <div className={styles.grandTotal}>
                        <span>Total:</span> <strong>{formatMoney(order.total)}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Update Actions */}
                <div className={styles.cardFooter}>
                  <span>Change Status:</span>
                  <div className={styles.statusButtons}>
                    {['PAID', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
                      <button
                        key={st}
                        disabled={updatingId === order.id || order.status === st}
                        onClick={() => handleUpdateStatus(order.id, st)}
                        className={`${styles.statusBtn} ${order.status === st ? styles.activeStatusBtn : ''}`}
                      >
                        {st.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
