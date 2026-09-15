import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Sweet Spoon by Hetty database with feminine theme and Ghanaian yogurt products...')

  // 1. OWNER ACCOUNT
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
        mustChangePassword: true,
        isActive: true,
      },
    })
    console.log(`✅ Owner account created: ${owner.email}`)
  }

  // 2. SITE SETTINGS
  const existingSettings = await prisma.siteSettings.findFirst()
  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        businessName: 'Sweet Spoon by Hetty',
        tagline: 'Artisanal Ghanaian Greek Yogurt, Probiotic & Brukina',
        phone1: '0535372613',
        phone2: '0508168299',
        whatsappNumber: '0546686616',
        city: 'Kumasi / Ho',
        region: 'Ashanti & Volta Regions, Ghana',
        heroTitle: 'Indulge in Premium Ghanaian Greek Yogurt & Fresh Brukina',
        heroSubtitle: 'Rich, creamy, and probiotic-packed — handcrafted daily with love in Ghana.',
        heroCta1Text: 'Shop All Products',
        heroCta2Text: 'Order via WhatsApp',
        comingSoonEnabled: false,
        currencyCode: 'GHS',
        currencySymbol: 'GH₵',
        allowGuestCheckout: true,
        enableReviews: true,
        enableWishlist: true,
        featuresJson: [
          { icon: '🌺', title: 'Freshly Made Daily', description: 'Handcrafted fresh batches daily with natural Ghanaian ingredients.' },
          { icon: '💖', title: 'Gut-Loving Probiotics', description: 'Packed with live active cultures for optimal gut health and digestion.' },
          { icon: '✨', title: '100% Pure & Creamy', description: 'Zero artificial preservatives or harsh chemical thickeners.' },
          { icon: '🌾', title: 'Authentic Ghanaian Brukina', description: 'Traditional fermented milk drink with steamed millet granules.' },
        ],
      },
    })
  }

  // 3. CATEGORIES
  const greekCat = await prisma.category.upsert({
    where: { slug: 'greek-yogurt' },
    update: {},
    create: {
      name: 'Greek Yogurt',
      slug: 'greek-yogurt',
      description: 'Thick, creamy Ghanaian Greek yogurt made fresh daily.',
    },
  })

  const probioticCat = await prisma.category.upsert({
    where: { slug: 'probiotic-yogurt' },
    update: {},
    create: {
      name: 'Probiotic Yogurt',
      slug: 'probiotic-yogurt',
      description: 'Refreshing drinkable yogurt packed with gut-healthy live cultures.',
    },
  })

  const brukinaCat = await prisma.category.upsert({
    where: { slug: 'brukina' },
    update: {},
    create: {
      name: 'Brukina & Fermented Dairy',
      slug: 'brukina',
      description: 'Traditional Ghanaian millet & fermented milk drink.',
    },
  })

  // 4. INITIAL PRODUCTS (Fully editable by owner in /admin/products)
  const products = [
    {
      name: 'Pure Ghanaian Greek Yogurt (Vanilla)',
      slug: 'pure-ghanaian-greek-yogurt-vanilla',
      description: 'Velvety, rich Greek yogurt infused with natural Madagascar vanilla beans. Thick, creamy, and delicious.',
      price: 35.00,
      compareAtPrice: 40.00,
      size: '500ml',
      categoryId: greekCat.id,
      imageUrl: '/images/greek_yogurt.jpg',
      isFeatured: true,
    },
    {
      name: 'Rich Strawberry Probiotic Drinkable Yogurt',
      slug: 'rich-strawberry-probiotic-drinkable-yogurt',
      description: 'Refreshing strawberry-flavored probiotic drinkable yogurt packed with active live cultures to support digestion.',
      price: 30.00,
      compareAtPrice: 35.00,
      size: '500ml',
      categoryId: probioticCat.id,
      imageUrl: '/images/probiotic_yogurt.jpg',
      isFeatured: true,
    },
    {
      name: 'Authentic Ghanaian Millet Brukina',
      slug: 'authentic-ghanaian-millet-brukina',
      description: 'Traditional Ghanaian millet Brukina drink made with fresh cow milk yogurt and steamed millet granules.',
      price: 25.00,
      compareAtPrice: 30.00,
      size: '500ml',
      categoryId: brukinaCat.id,
      imageUrl: '/images/brukina.jpg',
      isFeatured: true,
    },
    {
      name: 'Natural Unsweetened Greek Yogurt',
      slug: 'natural-unsweetened-greek-yogurt',
      description: 'Pure, clean Greek yogurt with zero added sugar or artificial additives. Ideal for healthy diets and smoothies.',
      price: 35.00,
      size: '500ml',
      categoryId: greekCat.id,
      imageUrl: '/images/greek_yogurt.jpg',
      isFeatured: false,
    },
  ]

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } })
    if (!existing) {
      const created = await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          size: p.size,
          categoryId: p.categoryId,
          isPublished: true,
          isFeatured: p.isFeatured,
          images: {
            create: {
              url: p.imageUrl,
              altText: p.name,
              isMain: true,
            },
          },
          inventory: {
            create: {
              quantity: 50,
              trackStock: true,
              lowStockThreshold: 5,
            },
          },
        },
      })
      console.log(`✅ Product created: ${created.name}`)
    }
  }

  // 5. DELIVERY ZONES (Ashanti & Volta Regions)
  const zones = [
    { name: 'KNUST Campus & Ayigya (Kumasi)', fee: 15.00, estimatedTime: 'Same-day delivery' },
    { name: 'Bantama & Adum (Kumasi Central)', fee: 20.00, estimatedTime: 'Same-day delivery' },
    { name: 'Ho Central & Ho Technical University', fee: 15.00, estimatedTime: 'Same-day delivery' },
    { name: 'Accra Express Station Delivery', fee: 35.00, estimatedTime: 'Next-day bus delivery' },
  ]

  for (const z of zones) {
    const existingZone = await prisma.deliveryZone.findFirst({ where: { name: z.name } })
    if (!existingZone) {
      await prisma.deliveryZone.create({
        data: {
          name: z.name,
          fee: z.fee,
          estimatedTime: z.estimatedTime,
          isActive: true,
        },
      })
    }
  }

  console.log('🎉 Seed complete with feminine Ghanaian yogurt products!')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
