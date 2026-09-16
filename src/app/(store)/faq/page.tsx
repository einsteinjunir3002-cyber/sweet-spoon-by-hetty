import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Sweet Spoon by Hetty',
  description: 'Common questions about our freshly made yogurt, ordering, and delivery.',
}

export default function FAQPage() {
  return (
    <div className="container" style={{ padding: '4rem 1.25rem', minHeight: '60vh', maxWidth: '800px' }}>
      <h1 className="heading-1" style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--brand-primary)' }}>Frequently Asked Questions</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h3 className="heading-4" style={{ marginBottom: '0.5rem' }}>Where are you located?</h3>
          <p className="text-muted">We are located in Ho, Volta Region, Ghana, and we deliver fresh across the city and surrounding areas.</p>
        </div>
        
        <div>
          <h3 className="heading-4" style={{ marginBottom: '0.5rem' }}>How long does the yogurt stay fresh?</h3>
          <p className="text-muted">Because we use no preservatives and our products are 100% natural, we recommend consuming them within 5-7 days while kept continuously refrigerated at or below 4°C.</p>
        </div>
        
        <div>
          <h3 className="heading-4" style={{ marginBottom: '0.5rem' }}>Do you do bulk orders for events?</h3>
          <p className="text-muted">Yes, we do! Please contact us via WhatsApp at least 48 hours in advance for event orders or large batches.</p>
        </div>
        
        <div>
          <h3 className="heading-4" style={{ marginBottom: '0.5rem' }}>Do you add sugar to your yogurts?</h3>
          <p className="text-muted">We have both sweetened and unsweetened options. Our standard Greek Yogurt is naturally sweetened, but we also offer a clean, pure unsweetened version for the health-conscious.</p>
        </div>
      </div>
    </div>
  )
}
