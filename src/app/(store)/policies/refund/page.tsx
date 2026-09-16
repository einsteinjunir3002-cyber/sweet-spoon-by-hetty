import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy | Sweet Spoon by Hetty',
}

export default function RefundPolicyPage() {
  return (
    <div className="container" style={{ padding: '4rem 1.25rem', minHeight: '60vh', maxWidth: '800px' }}>
      <h1 className="heading-1" style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--brand-primary)' }}>Refund & Return Policy</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--brand-text-muted)', lineHeight: '1.8' }}>
        <p>At Sweet Spoon by Hetty, quality and freshness are our highest priorities.</p>
        
        <h3 className="heading-4" style={{ color: 'var(--brand-text)', marginTop: '1rem' }}>Perishable Goods</h3>
        <p>Because our products are freshly made and highly perishable, we generally do not accept returns once the product has been successfully delivered and accepted.</p>

        <h3 className="heading-4" style={{ color: 'var(--brand-text)', marginTop: '1rem' }}>Damaged or Incorrect Orders</h3>
        <p>If your order arrives damaged, spoiled, or is incorrect, please contact us within 2 hours of delivery. We will gladly replace the items at no extra cost or issue a refund. We may request a photo of the product to help us improve our quality control.</p>

        <h3 className="heading-4" style={{ color: 'var(--brand-text)', marginTop: '1rem' }}>Cancellations</h3>
        <p>If you need to cancel an order, please contact us as soon as possible. Because our products are made fresh, cancellations for large or custom orders must be made at least 24 hours in advance.</p>
      </div>
    </div>
  )
}
