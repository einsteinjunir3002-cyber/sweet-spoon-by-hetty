'use client'

import { useState, useEffect } from 'react'
import styles from './coupons-admin.module.css'

interface Coupon {
  id: string
  code: string
  description?: string | null
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minimumOrder?: number | null
  usageLimit?: number | null
  usageCount: number
  isActive: boolean
  endDate?: string | null
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE')
  const [value, setValue] = useState('')
  const [minimumOrder, setMinimumOrder] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchCoupons = () => {
    setLoading(true)
    fetch('/api/admin/coupons')
      .then((r) => r.json())
      .then((data) => {
        setCoupons(data.coupons || [])
        setLoading(false)
      })
      .catch(console.error)
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const openCreateForm = () => {
    setEditingId(null)
    setCode('')
    setDescription('')
    setType('PERCENTAGE')
    setValue('10')
    setMinimumOrder('')
    setUsageLimit('')
    setIsActive(true)
    setIsFormOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      code: code.toUpperCase().trim(),
      description,
      type,
      value: parseFloat(value),
      minimumOrder: minimumOrder ? parseFloat(minimumOrder) : null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      isActive,
    }

    const endpoint = editingId ? `/api/admin/coupons/${editingId}` : '/api/admin/coupons'
    const method = editingId ? 'PATCH' : 'POST'

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setIsFormOpen(false)
        fetchCoupons()
      }
    } catch (err) {
      console.error('Save coupon error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon code?')) return
    try {
      await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
      fetchCoupons()
    } catch (err) {
      console.error('Delete coupon error:', err)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Discount Coupons & Promo Codes</h2>
          <p>Create discount codes to offer special savings for your customers</p>
        </div>
        <button onClick={openCreateForm} className={styles.addBtn}>
          🎟️ Create Coupon Code
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading coupons...</div>
      ) : coupons.length === 0 ? (
        <div className={styles.emptyState}>No promo codes created yet.</div>
      ) : (
        <div className={styles.grid}>
          {coupons.map((coupon) => (
            <div key={coupon.id} className={styles.couponCard}>
              <div className={styles.cardTop}>
                <span className={styles.codeTag}>{coupon.code}</span>
                <span className={coupon.isActive ? styles.activeBadge : styles.inactiveBadge}>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className={styles.valueHighlight}>
                {coupon.type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `GH₵${coupon.value.toFixed(2)} OFF`}
              </div>

              {coupon.description && <p className={styles.desc}>{coupon.description}</p>}

              <div className={styles.statsRow}>
                <div>
                  <small>Usage</small>
                  <strong>{coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'times'}</strong>
                </div>
                {coupon.minimumOrder && (
                  <div>
                    <small>Min Order</small>
                    <strong>GH₵{coupon.minimumOrder.toFixed(2)}</strong>
                  </div>
                )}
              </div>

              <div className={styles.actions}>
                <button onClick={() => handleDelete(coupon.id)} className={styles.deleteBtn}>
                  Delete Code
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Create New Coupon</h3>
              <button onClick={() => setIsFormOpen(false)} className={styles.closeBtn}>×</button>
            </div>

            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SWEET10 or FRESHYOGURT"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                    className={styles.input}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (GH₵)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder={type === 'PERCENTAGE' ? '10 (for 10%)' : '5.00 (for GH₵5)'}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Minimum Order (GH₵, optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50.00"
                    value={minimumOrder}
                    onChange={(e) => setMinimumOrder(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Usage Limit (optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 100 uses"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Description (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 10% off for first-time customers"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={styles.input}
                />
              </div>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Active (ready to redeem)
              </label>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={styles.saveBtn}>
                  {saving ? 'Saving...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
