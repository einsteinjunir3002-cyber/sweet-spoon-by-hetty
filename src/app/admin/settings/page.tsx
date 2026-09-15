'use client'

import { useState, useEffect } from 'react'
import styles from './settings-admin.module.css'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  const [businessName, setBusinessName] = useState('Sweet Spoon by Hetty')
  const [tagline, setTagline] = useState('Freshly Made. Naturally Delicious.')
  const [phone1, setPhone1] = useState('0546686616')
  const [phone2, setPhone2] = useState('0249213196')
  const [whatsappNumber, setWhatsappNumber] = useState('0546686616')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('Tech, Ayigya')
  const [city, setCity] = useState('Kumasi')
  const [region, setRegion] = useState('Ashanti Region, Ghana')

  const [heroTitle, setHeroTitle] = useState('Freshly Made. Naturally Delicious.')
  const [heroSubtitle, setHeroSubtitle] = useState('Premium Greek Yogurt, Probiotic Yogurt & Authentic Brukina in Kumasi.')
  const [announcementText, setAnnouncementText] = useState('🎉 Free delivery on orders over GH₵150 in Kumasi!')
  const [announcementEnabled, setAnnouncementEnabled] = useState(true)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          const s = data.settings
          setBusinessName(s.businessName || 'Sweet Spoon by Hetty')
          setTagline(s.tagline || '')
          setPhone1(s.phone1 || '0546686616')
          setPhone2(s.phone2 || '0249213196')
          setWhatsappNumber(s.whatsappNumber || '0546686616')
          setEmail(s.email || '')
          setAddress(s.address || 'Tech, Ayigya')
          setCity(s.city || 'Kumasi')
          setRegion(s.region || 'Ashanti Region, Ghana')
          setHeroTitle(s.heroTitle || '')
          setHeroSubtitle(s.heroSubtitle || '')
          setAnnouncementText(s.announcementText || '')
          setAnnouncementEnabled(s.announcementEnabled ?? true)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Fetch settings error:', err)
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSavedMsg('')

    const payload = {
      businessName,
      tagline,
      phone1,
      phone2,
      whatsappNumber,
      email,
      address,
      city,
      region,
      heroTitle,
      heroSubtitle,
      announcementText,
      announcementEnabled,
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setSavedMsg('✅ Settings updated successfully!')
        setTimeout(() => setSavedMsg(''), 4000)
      }
    } catch (err) {
      console.error('Save settings error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className={styles.loading}>Loading store settings...</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Store & Business Settings</h2>
        <p>Manage business contact details, homepage banners, and store information</p>
      </div>

      {savedMsg && <div className={styles.successAlert}>{savedMsg}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Section 1: Identity */}
        <div className={styles.sectionCard}>
          <h3>🏪 Brand & Identity</h3>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Business Name *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Info */}
        <div className={styles.sectionCard}>
          <h3>📞 Contact Information</h3>
          <div className={styles.formRow3}>
            <div className={styles.formGroup}>
              <label>Primary Phone *</label>
              <input
                type="text"
                required
                value={phone1}
                onChange={(e) => setPhone1(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Secondary Phone</label>
              <input
                type="text"
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>WhatsApp Number *</label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formRow3}>
            <div className={styles.formGroup}>
              <label>Address / Street</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Region *</label>
              <input
                type="text"
                required
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Homepage Banners */}
        <div className={styles.sectionCard}>
          <h3>📢 Banner & Announcement Bar</h3>
          <div className={styles.formGroup}>
            <label>Hero Title</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Hero Subtitle</label>
            <input
              type="text"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Announcement Bar Text</label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className={styles.input}
            />
          </div>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={announcementEnabled}
              onChange={(e) => setAnnouncementEnabled(e.target.checked)}
            />
            Show Announcement Bar on top of site
          </label>
        </div>

        <div className={styles.formActions}>
          <button type="submit" disabled={saving} className={styles.saveBtn}>
            {saving ? 'Saving...' : '💾 Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
