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
  const [showPassword, setShowPassword] = useState(false)
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
        setLoading(false)
        return
      }

      // After sign-in, poll /api/auth/me to get the user role (works reliably with NextAuth v5)
      let role: string | null = null
      for (let attempt = 0; attempt < 5; attempt++) {
        await new Promise((r) => setTimeout(r, 300))
        try {
          const meRes = await fetch('/api/auth/me', { cache: 'no-store' })
          if (meRes.ok) {
            const data = await meRes.json()
            role = data.role
            if (role) break
          }
        } catch {
          // retry
        }
      }

      if (role === 'OWNER' || role === 'ADMIN') {
        router.push('/admin')
      } else if (callbackUrl && callbackUrl !== '/' && !callbackUrl.startsWith('/admin')) {
        router.push(callbackUrl)
      } else {
        router.push('/account')
      }
      router.refresh()
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to sign in')
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className={styles.authPage}>
        <div className={styles.authCard}>
          <div className={styles.brandHeader}>
            <h1>Welcome Back</h1>
            <p>Sign in to your Sweet Spoon account or Admin Portal</p>
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Email or Username</label>
              <input
                type="text"
                required
                placeholder="e.g. BigDebbie or you@email.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={styles.input}
                autoComplete="username"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.togglePasswordBtn}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? (
                <>
                  <span className={styles.btnSpinner} />
                  Signing In...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div className={styles.dividerRow}>or</div>

          {/* Continue as Guest */}
          <Link href={callbackUrl.startsWith('/checkout') ? callbackUrl : '/shop'} className={styles.guestBtn}>
            <span>Continue as Guest</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>

          <p className={styles.switchText}>
            Don&apos;t have an account?
            <Link href="/register">Create Account</Link>
          </p>

          <div className={styles.footerNote}>
            Need help? Chat with Hetty on{' '}
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
