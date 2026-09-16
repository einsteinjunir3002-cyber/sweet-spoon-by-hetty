import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Sweet Spoon by Hetty',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container" style={{ padding: '4rem 1.25rem', minHeight: '60vh', maxWidth: '800px' }}>
      <h1 className="heading-1" style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--brand-primary)' }}>Privacy Policy</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--brand-text-muted)', lineHeight: '1.8' }}>
        <p>At Sweet Spoon by Hetty, we are committed to protecting your privacy and ensuring your personal information is handled safely and responsibly.</p>
        
        <h3 className="heading-4" style={{ color: 'var(--brand-text)', marginTop: '1rem' }}>Information We Collect</h3>
        <p>When you place an order or contact us, we collect necessary information such as your name, phone number, delivery address, and order details. This helps us process and deliver your order accurately.</p>

        <h3 className="heading-4" style={{ color: 'var(--brand-text)', marginTop: '1rem' }}>How We Use Your Information</h3>
        <p>We use your information exclusively to fulfill your orders, communicate with you regarding your purchases, and improve our services. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>

        <h3 className="heading-4" style={{ color: 'var(--brand-text)', marginTop: '1rem' }}>Contact Us</h3>
        <p>If you have any questions about this Privacy Policy, please contact us via WhatsApp or Phone at the numbers listed in our footer.</p>
      </div>
    </div>
  )
}
