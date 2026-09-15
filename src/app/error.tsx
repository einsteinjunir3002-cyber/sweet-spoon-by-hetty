'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled runtime error:', error)
  }, [error])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'sans-serif',
        background: '#FFF5F7',
        color: '#831843',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍨</div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
        Sweet Spoon by Hetty
      </h1>
      <p style={{ color: '#9D174D', maxWidth: '400px', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        Something went wrong while loading this page. Don't worry, our delicious products are still available!
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => reset()}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#EC4899',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '9999px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
        <Link
          href="/"
          style={{
            padding: '0.75rem 1.5rem',
            background: '#FFFFFF',
            color: '#DB2777',
            border: '1px solid #FBCFE8',
            borderRadius: '9999px',
            fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
