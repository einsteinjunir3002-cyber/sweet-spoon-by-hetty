/**
 * Sweet Spoon by Hetty — Database Seed
 * 
 * This seed creates ONLY the essential system data:
 * - Owner account (with hashed password)
 * - Default site settings
 * - Default social links
 * - Default policy page placeholders
 * 
 * NO fake products, orders, reviews or customers are created.
 * All business data must be entered by the owner through the dashboard.
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Sweet Spoon by Hetty database...')

  // ============================================================
  // 1. OWNER ACCOUNT
  // ============================================================
  const existingOwner = await prisma.user.findFirst({
    where: { role: 'OWNER' },
  })

  if (!existingOwner) {
    const hashedPassword = await bcrypt.hash('Debbie12345', 12)

    const owner = await prisma.user.create({
      data: {
        username: 'BigDebbie',
        email: 'bigdebbie@sweetspoonbyhetty.com',
        password: hashedPassword,
        name: 'Hetty',
        role: 'OWNER',
        mustChangePassword: true, // Force password change on first login
        isActive: true,
      },
    })

    console.log(`✅ Owner account created: ${owner.email}`)
    console.log(`   Username: BigDebbie`)
    console.log(`   ⚠️  Temporary password: Debbie12345 — CHANGE THIS AFTER FIRST LOGIN`)
  } else {
    console.log('ℹ️  Owner account already exists, skipping.')
  }

  // ============================================================
  // 2. SITE SETTINGS (defaults only)
  // ============================================================
  const existingSettings = await prisma.siteSettings.findFirst()

  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        businessName: 'Sweet Spoon by Hetty',
        tagline: 'Freshly Made. Naturally Delicious.',
        phone1: '0535372613',
        phone2: '0508168299',
        whatsappNumber: '0535372613',
        city: 'Ho',
        region: 'Volta Region, Ghana',
        heroTitle: 'Freshly Made. Naturally Delicious.',
        heroSubtitle: 'Premium Greek Yogurt, Probiotic Yogurt and Brukina — made fresh daily in Ho, Volta.',
        heroCta1Text: 'Shop Now',
        heroCta2Text: 'Order on WhatsApp',
        comingSoonEnabled: true,
        launchDate: new Date('2026-09-20T00:00:00Z'),
        comingSoonMessage: 'We\'re launching on September 20th! Get ready for fresh, delicious yogurt delivered to your door.',
        currencyCode: 'GHS',
        currencySymbol: 'GH₵',
        allowGuestCheckout: true,
        enableReviews: true,
        enableWishlist: true,
        featuresJson: [
          { icon: '🌿', title: 'Freshly Made Daily', description: 'Every batch is made fresh daily — no stockpiling, no compromise.' },
          { icon: '🦠', title: 'Probiotic Goodness', description: 'Packed with beneficial live cultures to support your gut health.' },
          { icon: '✨', title: '100% Natural', description: 'No preservatives, no artificial additives — just real ingredients.' },
          { icon: '🥛', title: 'Unsweetened Option', description: 'Clean, pure yogurt with no added sugar for the health-conscious.' },
        ],
      },
    })
    console.log('✅ Default site settings created')
  } else {
    console.log('ℹ️  Site settings already exist, skipping.')
  }

  // ============================================================
  // 3. SOCIAL LINKS (defaults)
  // ============================================================
  const existingSocial = await prisma.socialLinks.findFirst()

  if (!existingSocial) {
    await prisma.socialLinks.create({
      data: {
        tiktok: '@sweetspoonbyherty',
        whatsapp: '0535372613',
        // Instagram, Facebook, YouTube — owner must add real URLs
      },
    })
    console.log('✅ Default social links created')
  } else {
    console.log('ℹ️  Social links already exist, skipping.')
  }

  // ============================================================
  // 4. POLICY PAGES (placeholder — needs owner review)
  // ============================================================
  const policies = [
    {
      type: 'PRIVACY',
      title: 'Privacy Policy',
      content: '⚠️ This privacy policy requires review by the business owner before publishing. Please update this content from the Admin Dashboard → Website → Policies.',
      needsReview: true,
    },
    {
      type: 'TERMS',
      title: 'Terms & Conditions',
      content: '⚠️ These terms and conditions require review by the business owner before publishing. Please update this content from the Admin Dashboard → Website → Policies.',
      needsReview: true,
    },
    {
      type: 'DELIVERY',
      title: 'Delivery Policy',
      content: '⚠️ This delivery policy requires review by the business owner before publishing. Please configure delivery zones and update this content from the Admin Dashboard → Delivery & Website → Policies.',
      needsReview: true,
    },
    {
      type: 'REFUND',
      title: 'Refund & Cancellation Policy',
      content: '⚠️ This refund policy requires review by the business owner before publishing. Please update this content from the Admin Dashboard → Website → Policies.',
      needsReview: true,
    },
  ]

  for (const policy of policies) {
    const existing = await prisma.policyPage.findUnique({ where: { type: policy.type } })
    if (!existing) {
      await prisma.policyPage.create({ data: policy })
    }
  }

  console.log('✅ Policy page placeholders created (owner must review)')

  // ============================================================
  // 5. DEFAULT FAQs (minimal, based on known business info)
  // ============================================================
  const existingFAQs = await prisma.fAQ.count()
  
  if (existingFAQs === 0) {
    await prisma.fAQ.createMany({
      data: [
        {
          question: 'What products does Sweet Spoon by Hetty offer?',
          answer: 'We offer freshly made Greek Yogurt, Probiotic Yogurt, and Brukina. Our products are made daily to ensure freshness.',
          sortOrder: 1,
          isVisible: true,
        },
        {
          question: 'How do I place an order?',
          answer: 'You can place an order directly on our website, or contact us via WhatsApp or phone call. Our numbers are 0535372613 and 0508168299.',
          sortOrder: 2,
          isVisible: true,
        },
        {
          question: 'Are your products freshly made?',
          answer: 'Yes! All our products are freshly made daily. We do not stock old batches — what you receive is always fresh.',
          sortOrder: 3,
          isVisible: true,
        },
        {
          question: 'Is the Greek Yogurt sweetened?',
          answer: 'Our Greek Yogurt is available unsweetened — 100% natural with no preservatives.',
          sortOrder: 4,
          isVisible: true,
        },
      ],
    })
    console.log('✅ Default FAQs created')
  } else {
    console.log('ℹ️  FAQs already exist, skipping.')
  }

  console.log('\n🎉 Seeding complete!')
  console.log('\n📋 Next steps for the owner:')
  console.log('   1. Login at /admin with username: BigDebbie and password: Debbie12345')
  console.log('   2. IMMEDIATELY change your password in Settings → Account')
  console.log('   3. Add your products in Products → Add Product')
  console.log('   4. Configure delivery zones in Delivery → Zones')
  console.log('   5. Set up payment settings in Payments → Configuration')
  console.log('   6. Review and update policy pages in Website → Policies')
  console.log('   7. Disable "Coming Soon" mode when ready to launch')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
