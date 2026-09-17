'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import styles from './checkout.module.css'

interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  image?: string
  quantity: number
  variantId?: string
  notes?: string
}

interface DeliveryZone {
  id: string
  name: string
  fee: number
  estimatedTime?: string
  minimumOrder?: number
}

type DeliveryType = 'DELIVERY' | 'PICKUP'

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [step, setStep] = useState<'details' | 'review'>('details')
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [discount, setDiscount] = useState(0)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryType: 'DELIVERY' as DeliveryType,
    deliveryZoneId: '',
    deliveryAddress: '',
    deliveryArea: '',
    deliveryNotes: '',
    orderNotes: '',
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart')
      if (saved) setCart(JSON.parse(saved))
    } catch {}

    fetch('/api/delivery-zones')
      .then((r) => r.json())
      .then((d) => setZones(d.zones ?? []))
      .catch(() => {})
  }, [])

  const selectedZone = zones.find((z) => z.id === form.deliveryZoneId)
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const deliveryFee = form.deliveryType === 'DELIVERY' && selectedZone ? selectedZone.fee : 0
  const total = Math.max(0, subtotal - discount + deliveryFee)

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await fetch('/api/checkout/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCouponError(data.error || 'Invalid coupon')
        setDiscount(0)
        setCouponApplied(false)
      } else {
        setDiscount(data.discountAmount)
        setCouponApplied(true)
        setCouponError('')
      }
    } catch {
      setCouponError('Failed to validate coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  const removeItem = (id: string, variantId?: string) => {
    const updated = cart.filter((i) => !(i.id === id && i.variantId === variantId))
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const updateQty = (id: string, variantId: string | undefined, qty: number) => {
    if (qty <= 0) {
      removeItem(id, variantId)
      return
    }
    const updated = cart.map((i) =>
      i.id === id && i.variantId === variantId ? { ...i, quantity: qty } : i
    )
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  const handleSubmit = async () => {
    if (cart.length === 0) {
      setError('Your cart is empty')
      return
    }
    if (!form.customerName || !form.customerPhone) {
      setError('Please fill in your name and phone number')
      return
    }
    if (form.deliveryType === 'DELIVERY' && !form.deliveryZoneId) {
      setError('Please select your delivery zone')
      return
    }
    if (form.deliveryType === 'DELIVERY' && !form.deliveryAddress) {
      setError('Please enter your delivery address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          cartItems: cart.map((i) => ({
            productId: i.id,
            variantId: i.variantId,
            quantity: i.quantity,
            notes: i.notes,
          })),
          couponCode: couponApplied ? couponCode : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Checkout failed. Please try again.')
        setLoading(false)
        return
      }

      // Redirect to Paystack payment page
      localStorage.removeItem('cart')
      window.dispatchEvent(new Event('cart-updated'))
      window.location.href = data.authorizationUrl
    } catch {
      setError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  if (cart.length === 0 && step === 'details') {
    return (
      <div className={styles.emptyCart}>
        <div className={styles.emptyCartIcon}>🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some delicious products before checking out!</p>
        <Link href="/shop" className={styles.shopBtn}>Browse Products</Link>
      </div>
    )
  }

  return (
    <div className={styles.checkoutPage}>
        <div className="container">
          <h1 className={styles.pageTitle}>Checkout</h1>

          <div className={styles.checkoutLayout}>
            {/* Left: Form */}
            <div className={styles.formSection}>
              {/* Contact Details */}
              <div className={styles.formCard}>
                <h2>Your Details</h2>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Full Name *</label>
                    <input
                      id="name"
                      type="text"
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      placeholder="Abena Mensah"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      id="phone"
                      type="tel"
                      value={form.customerPhone}
                      onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                      placeholder="0501234567"
                      required
                    />
                  </div>
                  <div className={styles.formGroup + ' ' + styles.fullWidth}>
                    <label htmlFor="email">Email Address (optional)</label>
                    <input
                      id="email"
                      type="email"
                      value={form.customerEmail}
                      onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                      placeholder="abena@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Type */}
              <div className={styles.formCard}>
                <h2>Delivery Method</h2>
                <div className={styles.deliveryOptions}>
                  <label className={`${styles.deliveryOption} ${form.deliveryType === 'DELIVERY' ? styles.selectedOption : ''}`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="DELIVERY"
                      checked={form.deliveryType === 'DELIVERY'}
                      onChange={() => setForm({ ...form, deliveryType: 'DELIVERY' })}
                    />
                    <div>
                      <div className={styles.optionTitle}>🚚 Home Delivery</div>
                      <div className={styles.optionDesc}>Delivered to your doorstep</div>
                    </div>
                  </label>
                  <label className={`${styles.deliveryOption} ${form.deliveryType === 'PICKUP' ? styles.selectedOption : ''}`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="PICKUP"
                      checked={form.deliveryType === 'PICKUP'}
                      onChange={() => setForm({ ...form, deliveryType: 'PICKUP', deliveryZoneId: '' })}
                    />
                    <div>
                      <div className={styles.optionTitle}>🏪 Store Pickup</div>
                      <div className={styles.optionDesc}>Pick up from our location — free!</div>
                    </div>
                  </label>
                </div>

                {form.deliveryType === 'DELIVERY' && (
                  <div className={styles.deliveryFields}>
                    <div className={styles.formGroup}>
                      <label htmlFor="zone">Delivery Zone *</label>
                      <select
                        id="zone"
                        value={form.deliveryZoneId}
                        onChange={(e) => setForm({ ...form, deliveryZoneId: e.target.value })}
                        required
                      >
                        <option value="">Select your area</option>
                        {zones.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.name} — GH₵{z.fee.toFixed(2)}{z.estimatedTime ? ` (${z.estimatedTime})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="address">Delivery Address *</label>
                      <input
                        id="address"
                        type="text"
                        value={form.deliveryAddress}
                        onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                        placeholder="House number, street, neighborhood"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="area">Landmark / Area</label>
                      <input
                        id="area"
                        type="text"
                        value={form.deliveryArea}
                        onChange={(e) => setForm({ ...form, deliveryArea: e.target.value })}
                        placeholder="Near Accra Mall, Osu"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="deliveryNotes">Delivery Notes</label>
                      <input
                        id="deliveryNotes"
                        type="text"
                        value={form.deliveryNotes}
                        onChange={(e) => setForm({ ...form, deliveryNotes: e.target.value })}
                        placeholder="Call on arrival, gate is blue..."
                      />
                    </div>
                  </div>
                )}

                {form.deliveryType === 'PICKUP' && (
                  <div className={styles.pickupInfo}>
                    <div className={styles.pickupBox}>
                      <span>📍</span>
                      <div>
                        <strong>Pickup Location</strong>
                        <p>Contact us on WhatsApp for exact pickup address and timing.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div className={styles.formCard}>
                <h2>Order Notes (optional)</h2>
                <div className={styles.formGroup}>
                  <textarea
                    value={form.orderNotes}
                    onChange={(e) => setForm({ ...form, orderNotes: e.target.value })}
                    placeholder="Any special requests or instructions for your order..."
                    rows={3}
                  />
                </div>
              </div>

              {error && <div className={styles.errorBox}>{error}</div>}

              <button
                className={styles.placeOrderBtn}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.spinnerRow}>
                    <span className={styles.spinner} />
                    Processing...
                  </span>
                ) : (
                  `Order via WhatsApp →`
                )}
              </button>

              <div className={styles.paymentNote}>
                📱 We will process your order directly on WhatsApp.
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className={styles.summarySection}>
              <div className={styles.summaryCard}>
                <h2>Order Summary</h2>

                <div className={styles.cartItems}>
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.variantId}`} className={styles.cartItem}>
                      <div className={styles.cartItemImage}>
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="56px" />
                        ) : (
                          <div className={styles.noImage}>🍨</div>
                        )}
                      </div>
                      <div className={styles.cartItemDetails}>
                        <span className={styles.cartItemName}>{item.name}</span>
                        <div className={styles.cartItemQtyRow}>
                          <div className={styles.qtyControl}>
                            <button onClick={() => updateQty(item.id, item.variantId, item.quantity - 1)}>−</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQty(item.id, item.variantId, item.quantity + 1)}>+</button>
                          </div>
                          <span className={styles.cartItemPrice}>GH₵{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.id, item.variantId)}
                        title="Remove item"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className={styles.totalsSection}>
                  <div className={styles.totalRow}>
                    <span>Subtotal</span>
                    <span>GH₵{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className={`${styles.totalRow} ${styles.discountRow}`}>
                      <span>Discount</span>
                      <span>−GH₵{discount.toFixed(2)}</span>
                    </div>
                  )}
                  {form.deliveryType === 'DELIVERY' && (
                    <div className={styles.totalRow}>
                      <span>Delivery fee</span>
                      <span>{deliveryFee > 0 ? `GH₵${deliveryFee.toFixed(2)}` : selectedZone ? 'Free' : '—'}</span>
                    </div>
                  )}
                  {form.deliveryType === 'PICKUP' && (
                    <div className={styles.totalRow}>
                      <span>Delivery fee</span>
                      <span className={styles.freeText}>Free (Pickup)</span>
                    </div>
                  )}
                  <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                    <span>Total</span>
                    <span>GH₵{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.securityBadges}>
                <div className={styles.badge}>📱 Quick WhatsApp Order</div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
