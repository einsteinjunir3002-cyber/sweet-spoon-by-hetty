'use client'

import { useState } from 'react'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import WhatsAppFloat from '@/components/store/WhatsAppFloat'
import styles from './contact.module.css'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !message) {
      setErrorMsg('Name and message are required.')
      setStatus('error')
      return
    }

    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setStatus('success')
      setName('')
      setEmail('')
      setPhone('')
      setSubject('')
      setMessage('')
    } catch (err: unknown) {
      setStatus('error')
      setErrorMsg((err as Error).message || 'Something went wrong')
    }
  }

  const whatsappUrl = `https://wa.me/233546686616?text=${encodeURIComponent('Hello Hetty! I would like to inquire about Sweet Spoon products or make a bulk order.')}`

  return (
    <>
      <Header />
      <main className={styles.contactPage}>
        {/* Header */}
        <section className={styles.contactHeader}>
          <div className="container">
            <h1>We'd Love to Hear From You</h1>
            <p>Have questions, special event requests, or bulk yogurt orders? Get in touch with Hetty!</p>
          </div>
        </section>

        <div className={`container ${styles.grid}`}>
          {/* Contact Details Card */}
          <div className={styles.infoCard}>
            <h2>Get in Touch</h2>
            <p className={styles.sub}>Feel free to call, message, or visit us in Kumasi.</p>

            <div className={styles.contactItems}>
              <div className={styles.item}>
                <div className={styles.icon}>📞</div>
                <div>
                  <strong>Phone Numbers</strong>
                  <a href="tel:0546686616">0546686616</a>
                  <a href="tel:0249213196">0249213196</a>
                </div>
              </div>

              <div className={styles.item}>
                <div className={styles.icon} style={{ background: '#dcfce7', color: '#16a34a' }}>💬</div>
                <div>
                  <strong>WhatsApp Order Line</strong>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.waLink}>
                    Chat on WhatsApp (0546686616)
                  </a>
                </div>
              </div>

              <div className={styles.item}>
                <div className={styles.icon} style={{ background: '#f3e8ff', color: '#7e22ce' }}>📍</div>
                <div>
                  <strong>Location</strong>
                  <span>Tech, Ayigya</span>
                  <span>Kumasi, Ashanti Region, Ghana</span>
                </div>
              </div>
            </div>

            <div className={styles.whatsappBox}>
              <h3>Need Fast Delivery?</h3>
              <p>Ordering on WhatsApp is the fastest way to get your Greek Yogurt or Brukina delivered today.</p>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.waBtn}>
                Order via WhatsApp Now
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className={styles.formCard}>
            <h2>Send Us a Message</h2>
            <p className={styles.sub}>Fill out the form below and we will respond as soon as possible.</p>

            {status === 'success' && (
              <div className={styles.successAlert}>
                🎉 Thank you! Your message has been sent. Hetty will get back to you shortly.
              </div>
            )}

            {status === 'error' && (
              <div className={styles.errorAlert}>
                ❌ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. 0546686616"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Subject / Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Bulk order inquiry / Event catering"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Message *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Type your message or inquiry here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={styles.textarea}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className={styles.submitBtn}
              >
                {status === 'submitting' ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
