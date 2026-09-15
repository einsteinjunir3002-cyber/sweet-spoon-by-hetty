'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import WhatsAppFloat from '@/components/store/WhatsAppFloat'
import styles from './track.module.css'

interface OrderDetails {
  orderNumber: string
  customerName: string
  status: string
  deliveryType: string
  deliveryAddress?: string | null
  deliveryArea?: string | null
  subtotal: number
  deliveryFee: number
  discountAmount: number
  total: number
  createdAt: string
  items: Array<{ id: string; name: string; price: number; quantity: number }>
}

function TrackContent() {
  const searchParams = useSearchParams()
  const initialOrder = searchParams.get('order') || ''
  const [query, setQuery] = useState(initialOrder)
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [error, setError] = useState('')

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(query.trim())}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Order not found. Please check your order number.')
      }

      setOrder(data.order)
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to find order')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialOrder) {
      handleSearch()
    }
  }, [initialOrder])

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'PAYMENT_PENDING':
      case 'PENDING':
        return 1
      case 'PAID':
      case 'CONFIRMED':
        return 2
      case 'PREPARING':
        return 3
      case 'OUT_FOR_DELIVERY':
        return 4
      case 'DELIVERED':
        return 5
      default:
        return 1
    }
  }

  const currentStep = order ? getStatusStep(order.status) : 0

  return (
    <div className={styles.trackContainer}>
      <div className={styles.searchBox}>
        <h1>Track Your Order</h1>
        <p>Enter your Order Number (e.g., SS-2026-0001) to check live status</p>
        <form onSubmit={handleSearch} className={styles.form}>
          <input
            type="text"
            required
            placeholder="Enter Order Number"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.input}
          />
          <button type="submit" disabled={loading} className={styles.searchBtn}>
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {order && (
        <div className={styles.resultCard}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.orderLabel}>Order Number</span>
              <h2>{order.orderNumber}</h2>
            </div>
            <div className={styles.dateInfo}>
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Progress Steps */}
          <div className={styles.stepper}>
            {[
              { step: 1, label: 'Order Received' },
              { step: 2, label: 'Payment Confirmed' },
              { step: 3, label: 'Preparing Fresh' },
              { step: 4, label: 'Out for Delivery' },
              { step: 5, label: 'Delivered' },
            ].map((s) => (
              <div
                key={s.step}
                className={`${styles.stepItem} ${currentStep >= s.step ? styles.stepCompleted : ''} ${currentStep === s.step ? styles.stepCurrent : ''}`}
              >
                <div className={styles.stepCircle}>{s.step}</div>
                <span className={styles.stepLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Order Details */}
          <div className={styles.detailsGrid}>
            <div className={styles.col}>
              <h4>Customer & Delivery</h4>
              <p><strong>Name:</strong> {order.customerName}</p>
              <p><strong>Delivery Method:</strong> {order.deliveryType}</p>
              {order.deliveryAddress && <p><strong>Address:</strong> {order.deliveryAddress}</p>}
              {order.deliveryArea && <p><strong>Area:</strong> {order.deliveryArea}</p>}
            </div>

            <div className={styles.col}>
              <h4>Order Summary</h4>
              <ul className={styles.itemsList}>
                {order.items.map((item) => (
                  <li key={item.id}>
                    <span>{item.quantity}x {item.name}</span>
                    <strong>GH₵{(item.price * item.quantity).toFixed(2)}</strong>
                  </li>
                ))}
              </ul>
              <div className={styles.totalRow}>
                <span>Total Amount Paid:</span>
                <strong>GH₵{order.total.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <div className={styles.supportFooter}>
            Need assistance with your order?{' '}
            <a
              href={`https://wa.me/233546686616?text=${encodeURIComponent(`Hello Hetty, I am inquiring about my order #${order.orderNumber}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TrackPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className="container">
          <Suspense fallback={<div className={styles.loading}>Loading tracking page...</div>}>
            <TrackContent />
          </Suspense>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
