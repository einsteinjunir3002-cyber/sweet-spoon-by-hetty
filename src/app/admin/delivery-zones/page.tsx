'use client'

import { useState, useEffect } from 'react'
import styles from './delivery-zones.module.css'

interface DeliveryZone {
  id: string
  name: string
  areas: string[]
  fee: number
  estimatedTime?: string | null
  minimumOrder?: number | null
  isActive: boolean
}

export default function AdminDeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [areasInput, setAreasInput] = useState('')
  const [fee, setFee] = useState('')
  const [estimatedTime, setEstimatedTime] = useState('')
  const [minimumOrder, setMinimumOrder] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchZones = () => {
    setLoading(true)
    fetch('/api/delivery-zones')
      .then((r) => r.json())
      .then((data) => {
        setZones(data.deliveryZones || [])
        setLoading(false)
      })
      .catch(console.error)
  }

  useEffect(() => {
    fetchZones()
  }, [])

  const openCreateForm = () => {
    setEditingId(null)
    setName('')
    setAreasInput('')
    setFee('')
    setEstimatedTime('30-60 mins')
    setMinimumOrder('')
    setIsActive(true)
    setIsFormOpen(true)
  }

  const openEditForm = (zone: DeliveryZone) => {
    setEditingId(zone.id)
    setName(zone.name)
    setAreasInput(zone.areas.join(', '))
    setFee(zone.fee.toString())
    setEstimatedTime(zone.estimatedTime || '')
    setMinimumOrder(zone.minimumOrder ? zone.minimumOrder.toString() : '')
    setIsActive(zone.isActive)
    setIsFormOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const areas = areasInput
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0)

    const payload = {
      name,
      areas,
      fee: parseFloat(fee),
      estimatedTime: estimatedTime || undefined,
      minimumOrder: minimumOrder ? parseFloat(minimumOrder) : null,
      isActive,
    }

    const endpoint = editingId ? `/api/delivery-zones?id=${editingId}` : '/api/delivery-zones'
    const method = editingId ? 'PUT' : 'POST'

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setIsFormOpen(false)
        fetchZones()
      }
    } catch (err) {
      console.error('Save zone error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery zone?')) return
    try {
      await fetch(`/api/delivery-zones?id=${id}`, { method: 'DELETE' })
      fetchZones()
    } catch (err) {
      console.error('Delete zone error:', err)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Delivery Zones & Fees</h2>
          <p>Set delivery prices and estimated delivery times for different areas</p>
        </div>
        <button onClick={openCreateForm} className={styles.addBtn}>
          ➕ Add Delivery Zone
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading delivery zones...</div>
      ) : zones.length === 0 ? (
        <div className={styles.emptyState}>No delivery zones configured yet.</div>
      ) : (
        <div className={styles.grid}>
          {zones.map((zone) => (
            <div key={zone.id} className={styles.zoneCard}>
              <div className={styles.cardHeader}>
                <h3>{zone.name}</h3>
                <span className={zone.isActive ? styles.badgeActive : styles.badgeInactive}>
                  {zone.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className={styles.feeHighlight}>
                <span className={styles.feeLabel}>Delivery Fee</span>
                <strong className={styles.feeVal}>GH₵{zone.fee.toFixed(2)}</strong>
              </div>

              <div className={styles.details}>
                <p><strong>Areas Included:</strong> {zone.areas.join(', ')}</p>
                {zone.estimatedTime && <p><strong>Estimated Lead Time:</strong> {zone.estimatedTime}</p>}
                {zone.minimumOrder && (
                  <p><strong>Min. Order Amount:</strong> GH₵{zone.minimumOrder.toFixed(2)}</p>
                )}
              </div>

              <div className={styles.actions}>
                <button onClick={() => openEditForm(zone)} className={styles.editBtn}>Edit</button>
                <button onClick={() => handleDelete(zone.id)} className={styles.deleteBtn}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingId ? 'Edit Delivery Zone' : 'Add New Delivery Zone'}</h3>
              <button onClick={() => setIsFormOpen(false)} className={styles.closeBtn}>×</button>
            </div>

            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Zone Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ho Central / Campus Zone"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Areas Covered (comma separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayigya, Tech Campus, Bomso, Kotei"
                  value={areasInput}
                  onChange={(e) => setAreasInput(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Delivery Fee (GH₵) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="15.00"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Estimated Delivery Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 30-45 mins"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Minimum Order Required (GH₵, optional)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={minimumOrder}
                  onChange={(e) => setMinimumOrder(e.target.value)}
                  className={styles.input}
                />
              </div>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Active (available for customers at checkout)
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
                  {saving ? 'Saving...' : 'Save Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
