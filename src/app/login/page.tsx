'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import styles from './auth.module.css'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier || !password) {
      setError('Please enter your email/username and password')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await signIn('credentials', {
        identifier,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError('Invalid username/email or password')
      } else {
        router.push(callbackUrl.startsWith('/admin') ? callbackUrl : '/admin')
        router.refresh()
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className={styles.authPage}>
        <div className={styles.authCard}>
          <div className={styles.brandHeader}>
            <h1>Sign In</h1>
            <p>Access your Sweet Spoon account or Admin Portal</p>
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Email or Username</label>
              <input
                type="text"
                required
                placeholder="e.g. owner or hetty@sweetspoon.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className={styles.footerNote}>
            Need help? Contact support on{' '}
            <a href="https://wa.me/233546686616" target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
