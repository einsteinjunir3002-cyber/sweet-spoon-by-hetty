import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Sweet Spoon by Hetty',
}

export default function TermsPage() {
  return (
    <div className="container" style={{ padding: '4rem 1.25rem', minHeight: '60vh', maxWidth: '800px' }}>
      <h1 className="heading-1" style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--brand-primary)' }}>Terms & Conditions</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--brand-text-muted)', lineHeight: '1.8' }}>
        <p>Welcome to Sweet Spoon by Hetty. By placing an order with us, you agree to the following terms and conditions.</p>
        
        <h3 className="heading-4" style={{ color: 'var(--brand-text)', marginTop: '1rem' }}>Orders and Availability</h3>
        <p>All our products are made fresh daily. Orders are subject to availability. In the rare event that an item you ordered is out of stock, we will notify you immediately to arrange a replacement or refund.</p>

        <h3 className="heading-4" style={{ color: 'var(--brand-text)', marginTop: '1rem' }}>Pricing and Payment</h3>
        <p>All prices are listed in Ghanaian Cedis (GH₵). Payment must be completed before or upon delivery depending on the agreed payment method (Mobile Money or Cash on Delivery).</p>

        <h3 className="heading-4" style={{ color: 'var(--brand-text)', marginTop: '1rem' }}>Allergies and Ingredients</h3>
        <p>Our products contain dairy. While we take great care to maintain a clean environment, our kitchen processes dairy products. It is the customer's responsibility to consider any personal food allergies before consumption.</p>
      </div>
    </div>
  )
}
