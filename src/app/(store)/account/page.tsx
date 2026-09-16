'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './account.module.css'

const AVATAR_PRESETS = [
  '🍨', '🍦', '🍧', '🍓', '🌺', '👑', '💖', '✨', '🥛', '🫐'
]

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
  items: OrderItem[]
}

interface UserProfile {
  id: string
  name: string | null
  username: string | null
  email: string
  phone: string | null
  image: string | null
  role: string
  createdAt: string
  orders: Order[]
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'security'>('profile')
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // Profile Form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('🍨')
  const [customImageUrl, setCustomImageUrl] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Security Form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [securitySaving, setSecuritySaving] = useState(false)
  const [securityMsg, setSecurityMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/account')
      return
    }

    if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data.user)
        setName(data.user.name || '')
        setPhone(data.user.phone || '')
        if (data.user.image) {
          if (AVATAR_PRESETS.includes(data.user.image)) {
            setSelectedAvatar(data.user.image)
          } else {
            setCustomImageUrl(data.user.image)
          }
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg(null)

    try {
      const finalImage = customImageUrl.trim() || selectedAvatar
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          image: finalImage,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' })
      setProfile((prev) => prev ? { ...prev, name, phone, image: finalImage } : null)
    } catch (err: unknown) {
      setProfileMsg({ type: 'error', text: (err as Error).message || 'Failed to save changes' })
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSecuritySaving(true)
    setSecurityMsg(null)

    if (newPassword !== confirmNewPassword) {
      setSecurityMsg({ type: 'error', text: 'New passwords do not match' })
      setSecuritySaving(false)
      return
    }

    if (newPassword.length < 6) {
      setSecurityMsg({ type: 'error', text: 'New password must be at least 6 characters' })
      setSecuritySaving(false)
      return
    }

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      setSecurityMsg({ type: 'success', text: 'Password updated successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err: unknown) {
      setSecurityMsg({ type: 'error', text: (err as Error).message || 'Failed to update password' })
    } finally {
      setSecuritySaving(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <main className={styles.accountPage}>
        <div className={styles.container}>
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Loading your account...</p>
          </div>
        </div>
      </main>
    )
  }

  const currentDisplayAvatar = customImageUrl.trim()
    ? customImageUrl
    : (profile?.image || selectedAvatar)

  const isImageAvatar = currentDisplayAvatar.startsWith('http') || currentDisplayAvatar.startsWith('/')

  return (
    <main className={styles.accountPage}>
      <div className={styles.container}>
        {/* User Header Banner */}
        <div className={styles.userHeader}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {isImageAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentDisplayAvatar} alt="Profile" />
              ) : (
                <span>{currentDisplayAvatar}</span>
              )}
            </div>
            <div className={styles.userMeta}>
              <h1>{profile?.name || profile?.username || 'Valued Customer'}</h1>
              <p>{profile?.email}</p>
              {profile?.role === 'OWNER' && (
                <span className={styles.roleBadge}>👑 Store Owner</span>
              )}
            </div>
          </div>

          <div className={styles.headerActions}>
            {profile?.role === 'OWNER' && (
              <Link href="/admin" className={styles.adminBtn}>
                <span>⚙️ Admin Panel</span>
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className={styles.signOutBtn}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabsNav}>
          <button
            onClick={() => setActiveTab('profile')}
            className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.activeTab : ''}`}
          >
            👤 Profile & Details
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.activeTab : ''}`}
          >
            📦 My Orders ({profile?.orders?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`${styles.tabBtn} ${activeTab === 'security' ? styles.activeTab : ''}`}
          >
            🔒 Password & Security
          </button>
        </div>

        {/* Tab 1: Profile Settings */}
        {activeTab === 'profile' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Profile Information</h2>

            {profileMsg && (
              <div className={profileMsg.type === 'success' ? styles.alertSuccess : styles.alertError}>
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              {/* Avatar Selector */}
              <div className={styles.avatarSection}>
                <label>Choose Avatar Icon or Photo</label>
                <div className={styles.avatarPresets}>
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(preset)
                        setCustomImageUrl('')
                      }}
                      className={`${styles.presetBtn} ${selectedAvatar === preset && !customImageUrl ? styles.activePreset : ''}`}
                      title={`Select ${preset}`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.gridForm}>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Phone Number (WhatsApp Active)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 024 XXX XXXX"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Username</label>
                  <input
                    type="text"
                    value={profile?.username || '—'}
                    disabled
                    className={styles.input}
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullCol}`}>
                  <label>Custom Profile Image URL (Optional)</label>
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://example.com/your-photo.jpg"
                    className={styles.input}
                  />
                </div>
              </div>

              <button type="submit" disabled={profileSaving} className={styles.saveBtn}>
                {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Orders */}
        {activeTab === 'orders' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Recent Orders</h2>

            {!profile?.orders || profile.orders.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🛍️</div>
                <h3>No Orders Yet</h3>
                <p>You haven&apos;t placed any orders yet. Fresh yogurt and ice cream are waiting!</p>
                <Link href="/shop" className={styles.shopBtn}>
                  Browse Shop
                </Link>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {profile.orders.map((order) => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div>
                        <span className={styles.orderNum}>{order.orderNumber}</span>
                        <div className={styles.orderDate}>
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <span className={`${styles.statusBadge} ${order.status === 'DELIVERED' ? styles.statusDelivered : order.status === 'PAID' ? styles.statusPaid : styles.statusPending}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className={styles.orderItemsSummary}>
                      {order.items?.map((item) => (
                        <div key={item.id}>
                          • {item.quantity}x {item.name} (GH₵{item.price.toFixed(2)})
                        </div>
                      ))}
                    </div>

                    <div className={styles.orderFooter}>
                      <span className={styles.orderTotal}>Total: GH₵{order.total.toFixed(2)}</span>
                      <Link href={`/track?order=${encodeURIComponent(order.orderNumber)}`} className={styles.trackBtn}>
                        Track Live Status →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Security */}
        {activeTab === 'security' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Change Password</h2>

            {securityMsg && (
              <div className={securityMsg.type === 'success' ? styles.alertSuccess : styles.alertError}>
                {securityMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className={styles.formGroup} style={{ marginBottom: '1.25rem' }}>
                <label>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className={styles.input}
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                  >
                    {showCurrentPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className={styles.gridForm} style={{ marginBottom: '1.5rem' }}>
                <div className={styles.formGroup}>
                  <label>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className={styles.input}
                      style={{ paddingRight: '44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                    >
                      {showNewPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className={styles.input}
                  />
                </div>
              </div>

              <button type="submit" disabled={securitySaving} className={styles.saveBtn}>
                {securitySaving ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}
