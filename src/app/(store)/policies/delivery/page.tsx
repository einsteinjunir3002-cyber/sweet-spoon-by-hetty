import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Delivery Policy | Sweet Spoon by Hetty',
}

export default function DeliveryPolicyPage() {
  return (
    <div className="container" style={{ padding: '4rem 1.25rem', minHeight: '60vh', maxWidth: '800px' }}>
      <h1 className="heading-1" style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--brand-primary)' }}>Delivery Policy</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--brand-text-muted)', lineHeight: '1.8' }}>
        <p>We strive to get your fresh yogurt and Brukina to you as quickly and safely as possible.</p>
        
        <h3 className="heading-4" style={{ color: 'var(--brand-text)', marginTop: '1rem' }}>Delivery Areas & Times</h3>
        <p>We currently offer delivery within Ho, Volta Region. Deliveries are typically dispatched the same day if orders are placed before our daily cut-off time. Orders placed late in the day may be scheduled for the next morning to guarantee freshness.</p>

        <h3 className="heading-4" style={{ color: 'var(--brand-text)', marginTop: '1rem' }}>Delivery Fees</h3>
        <p>Delivery fees are calculated based on your location and distance from our kitchen. The exact fee will be communicated to you during the checkout or WhatsApp ordering process.</p>

        <h3 className="heading-4" style={{ color: 'var(--brand-text)', marginTop: '1rem' }}>Receiving Your Order</h3>
        <p>Because our products are perishable and must remain cold, please ensure someone is available to receive the delivery. We recommend placing the items in a refrigerator immediately upon receipt.</p>
      </div>
    </div>
  )
}
