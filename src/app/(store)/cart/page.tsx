'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import styles from './cart.module.css'

export default function CartPage() {
  const { items, itemCount, total, removeItem, updateQuantity, clearCart } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null)
  const [loadingCoupon, setLoadingCoupon] = useState(false)

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode.trim()) return

    setLoadingCoupon(true)
    setCouponMsg(null)

    try {
      const res = await fetch('/api/checkout/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, cartTotal: total }),
      })
      const data = await res.json()

      if (res.ok && data.valid) {
        setDiscount(data.discount)
        setCouponMsg({ text: `Coupon "${data.code}" applied! Saved GH₵${data.discount.toFixed(2)}`, isError: false })
      } else {
        setDiscount(0)
        setCouponMsg({ text: data.error || 'Invalid coupon code', isError: true })
      }
    } catch {
      setDiscount(0)
      setCouponMsg({ text: 'Failed to validate coupon', isError: true })
    } finally {
      setLoadingCoupon(false)
    }
  }

  const finalTotal = Math.max(0, total - discount)

  const handleWhatsAppOrder = () => {
    if (items.length === 0) return
    let message = `Hello! I'd like to place an order from Sweet Spoon by Hetty:\n\n`
    items.forEach((item, i) => {
      message += `${i + 1}. ${item.name} x${item.quantity} - GH₵${(item.price * item.quantity).toFixed(2)}\n`
      if (item.notes) message += `   Notes: ${item.notes}\n`
    })
    message += `\nSubtotal: GH₵${total.toFixed(2)}`
    if (discount > 0) message += `\nDiscount: -GH₵${discount.toFixed(2)}`
    message += `\nTotal: GH₵${finalTotal.toFixed(2)}\n\nPlease confirm availability and delivery fees.`

    const url = `https://wa.me/233535372613?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  if (items.length === 0) {
    return (
      <div className={styles.cartPage}>
        <div className="container">
          <nav className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Cart</span>
          </nav>

          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🥛</div>
            <h1 className={styles.emptyTitle}>Your Shopping Cart is Empty</h1>
            <p className={styles.emptyDesc}>
              Looks like you haven't added any fresh Greek Yogurt, Probiotic Yogurt or Brukina yet!
            </p>
            <Link href="/shop" className="btn btn-primary btn-lg">
              Browse Our Shop
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.cartPage}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span>/</span>
          <span>Cart</span>
        </nav>

        {/* Title */}
        <div className={styles.titleSection}>
          <h1>Your Shopping Cart</h1>
          <p>You have {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart.</p>
        </div>

        <div className={styles.cartGrid}>
          {/* Items List */}
          <div className={styles.itemsCard}>
            {items.map((item) => (
              <div key={`${item.id}-${item.variantId ?? ''}`} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  <Image
                    src={item.image || '/images/greek-yogurt.jpg'}
                    alt={item.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                <div className={styles.itemDetails}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <span className={styles.itemPrice}>GH₵{item.price.toFixed(2)} each</span>
                  {item.notes && (
                    <span className={styles.itemNotes}>Note: {item.notes}</span>
                  )}
                </div>

                <div className={styles.itemActions}>
                  <div className={styles.quantityControl}>
                    <button
                      onClick={() => updateQuantity(item.id, item.variantId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.variantId, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <span className={styles.itemSubtotal}>
                    GH₵{(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.id, item.variantId)}
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 'var(--spacing-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={clearCart} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-gray-500)' }}>
                Clear Cart
              </button>
              <Link href="/shop" className="btn btn-secondary btn-sm">
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal ({itemCount} items)</span>
                <span>GH₵{total.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className={styles.summaryRow} style={{ color: 'var(--color-success)' }}>
                  <span>Discount</span>
                  <span>-GH₵{discount.toFixed(2)}</span>
                </div>
              )}

              <div className={styles.summaryRow}>
                <span>Delivery</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>Calculated at checkout</span>
              </div>

              <div className={styles.summaryTotalRow}>
                <span>Total</span>
                <span className={styles.totalPrice}>GH₵{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon Form */}
            <div className={styles.couponSection}>
              <form onSubmit={handleApplyCoupon} className={styles.couponForm}>
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className={styles.couponInput}
                />
                <button type="submit" className="btn btn-secondary btn-sm" disabled={loadingCoupon}>
                  {loadingCoupon ? '...' : 'Apply'}
                </button>
              </form>
              {couponMsg && (
                <p className={`${styles.couponMsg} ${couponMsg.isError ? styles.couponMsgError : styles.couponMsgSuccess}`}>
                  {couponMsg.text}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className={styles.checkoutBtns}>
              <Link href="/checkout" className={`btn btn-primary btn-lg ${styles.checkoutBtn}`}>
                Proceed to Checkout
              </Link>
              <button onClick={handleWhatsAppOrder} className={`btn btn-whatsapp btn-lg ${styles.checkoutBtn}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Order via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
