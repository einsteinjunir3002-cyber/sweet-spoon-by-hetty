'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import styles from './verify.module.css'

function VerifyPaymentContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference') || searchParams.get('ref') || searchParams.get('trxref')
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [orderNumber, setOrderNumber] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!reference) {
      setStatus('failed')
      setMessage('No payment reference found')
      return
    }

    fetch(`/api/checkout/verify?ref=${reference}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'success') {
          setStatus('success')
          setOrderNumber(data.orderNumber)
        } else {
          setStatus('failed')
          setMessage(data.message || 'Payment was not successful')
        }
      })
      .catch(() => {
        setStatus('failed')
        setMessage('An error occurred verifying your payment')
      })
  }, [reference])

  if (status === 'loading') {
    return (
      <div className={styles.verifyBox}>
        <div className={styles.loadingIcon}>
          <div className={styles.spinner} />
        </div>
        <h2>Verifying your payment...</h2>
        <p>Please wait, do not close this page</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className={styles.verifyBox}>
        <div className={styles.successIcon}>🎉</div>
        <h2>Payment Successful!</h2>
        <p>Your order has been confirmed. Thank you for shopping with Sweet Spoon by Hetty!</p>
        {orderNumber && (
          <div className={styles.orderNumberBox}>
            <span>Your Order Number</span>
            <strong>{orderNumber}</strong>
            <span className={styles.orderHint}>Save this number to track your order</span>
          </div>
        )}
        <div className={styles.actionBtns}>
          {orderNumber && (
            <Link href={`/track?order=${orderNumber}`} className={styles.trackBtn}>
              Track My Order
            </Link>
          )}
          <Link href="/shop" className={styles.shopBtn}>
            Continue Shopping
          </Link>
        </div>
        <p className={styles.whatsappNote}>
          We'll reach you on the phone number you provided to arrange delivery.
          You can also contact us on{' '}
          <a href="https://wa.me/233535372613" target="_blank" rel="noopener noreferrer">WhatsApp</a>.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.verifyBox}>
      <div className={styles.failedIcon}>❌</div>
      <h2>Payment Failed</h2>
      <p>{message || 'Your payment could not be processed.'}</p>
      <div className={styles.actionBtns}>
        <Link href="/checkout" className={styles.retryBtn}>Try Again</Link>
        <Link href="/" className={styles.homeBtn}>Go Home</Link>
      </div>
      <p className={styles.supportNote}>
        If you were charged but see this error, please contact us on{' '}
        <a href="https://wa.me/233535372613" target="_blank" rel="noopener noreferrer">WhatsApp</a>{' '}
        with your reference: <code>{reference}</code>
      </p>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <>
      <Header />
      <main className={styles.verifyPage}>
        <div className={styles.container}>
          <Suspense fallback={
            <div className={styles.verifyBox}>
              <div className={styles.loadingIcon}><div className={styles.spinner} /></div>
              <h2>Loading...</h2>
            </div>
          }>
            <VerifyPaymentContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}
