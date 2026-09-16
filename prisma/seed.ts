import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Sweet Spoon by Hetty database with owner credentials, rich categories & ice cream products...')

  // 1. OWNER ACCOUNT (BigDebbie / Debbie12345)
  const hashedPassword = await bcrypt.hash('Debbie12345', 12)

  // Upsert or update BigDebbie owner account
  const existingOwnerByEmail = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'bigdebbie@sweetspoonbyhetty.com' },
        { username: 'BigDebbie' },
        { username: 'bigdebbie' },
      ],
    },
  })

  if (existingOwnerByEmail) {
    await prisma.user.update({
      where: { id: existingOwnerByEmail.id },
      data: {
        username: 'BigDebbie',
        email: 'bigdebbie@sweetspoonbyhetty.com',
        password: hashedPassword,
        name: 'Hetty (Big Debbie)',
        role: 'OWNER',
        mustChangePassword: false,
        isActive: true,
      },
    })
    console.log(`✅ Owner account updated: BigDebbie (bigdebbie@sweetspoonbyhetty.com)`)
  } else {
    const owner = await prisma.user.create({
      data: {
        username: 'BigDebbie',
        email: 'bigdebbie@sweetspoonbyhetty.com',
        password: hashedPassword,
        name: 'Hetty (Big Debbie)',
        role: 'OWNER',
        mustChangePassword: false,
        isActive: true,
      },
    })
    console.log(`✅ Owner account created: ${owner.username} (${owner.email})`)
  }

  // 2. SITE SETTINGS
  const existingSettings = await prisma.siteSettings.findFirst()
  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        businessName: 'Sweet Spoon by Hetty',
        tagline: 'Artisanal Ghanaian Greek Yogurt, Ice Cream & Brukina',
        phone1: '0535372613',
        phone2: '0508168299',
        whatsappNumber: '0546686616',
        city: 'Ho / Kumasi',
        region: 'Volta & Ashanti Regions, Ghana',
        heroTitle: 'Indulge in Handcrafted Ice Cream, Fresh Greek Yogurt & Brukina',
        heroSubtitle: 'Rich, velvety, and probiotic-packed — handcrafted daily with pure natural Ghanaian dairy.',
        heroCta1Text: 'Shop All Treats',
        heroCta2Text: 'Order via WhatsApp',
        comingSoonEnabled: false,
        currencyCode: 'GHS',
        currencySymbol: 'GH₵',
        allowGuestCheckout: true,
        enableReviews: true,
        enableWishlist: true,
        featuresJson: [
          { icon: '🌺', title: 'Freshly Made Daily', description: 'Handcrafted fresh batches daily with natural Ghanaian ingredients.' },
          { icon: '🍨', title: 'Velvety Artisan Ice Cream', description: 'Real cream, pure Ghanaian cocoa, vanilla pods and real fruit ribbons.' },
          { icon: '💖', title: 'Gut-Loving Probiotics', description: 'Packed with live active cultures for optimal gut health and digestion.' },
          { icon: '🌾', title: 'Authentic Ghanaian Brukina', description: 'Traditional fermented milk drink with steamed millet granules.' },
        ],
      },
    })
  }

  // 3. CATEGORIES
  const iceCreamCat = await prisma.category.upsert({
    where: { slug: 'ice-cream' },
    update: {},
    create: {
      name: 'Artisan Ice Cream & Gelato',
      slug: 'ice-cream',
      description: 'Ultra-creamy, handcrafted artisanal ice creams and Italian-style gelatos.',
      sortOrder: 1,
    },
  })

  const greekCat = await prisma.category.upsert({
    where: { slug: 'greek-yogurt' },
    update: {},
    create: {
      name: 'Greek Yogurt',
      slug: 'greek-yogurt',
      description: 'Thick, creamy Ghanaian Greek yogurt made fresh daily.',
      sortOrder: 2,
    },
  })

  const probioticCat = await prisma.category.upsert({
    where: { slug: 'probiotic-yogurt' },
    update: {},
    create: {
      name: 'Probiotic Drinkable Yogurt',
      slug: 'probiotic-yogurt',
      description: 'Refreshing drinkable yogurt packed with gut-healthy live cultures.',
      sortOrder: 3,
    },
  })

  const brukinaCat = await prisma.category.upsert({
    where: { slug: 'brukina' },
    update: {},
    create: {
      name: 'Brukina & Fermented Dairy',
      slug: 'brukina',
      description: 'Traditional Ghanaian millet & fermented milk drink.',
      sortOrder: 4,
    },
  })

  const parfaitCat = await prisma.category.upsert({
    where: { slug: 'parfaits' },
    update: {},
    create: {
      name: 'Parfaits & Smoothie Bowls',
      slug: 'parfaits',
      description: 'Layered Greek yogurt parfaits with granola, fruits, and honey.',
      sortOrder: 5,
    },
  })

  const froyoCat = await prisma.category.upsert({
    where: { slug: 'frozen-yogurt' },
    update: {},
    create: {
      name: 'Frozen Yogurt & Sorbets',
      slug: 'frozen-yogurt',
      description: 'Refreshing fruit-infused frozen yogurt and dairy-free sorbets.',
      sortOrder: 6,
    },
  })

  // 4. PRODUCTS (14+ high-quality products with online food photography)
  const products = [
    // ICE CREAM
    {
      name: 'Vanilla Bean Artisanal Ice Cream',
      slug: 'vanilla-bean-artisanal-ice-cream',
      description: 'Silky smooth ice cream infused with aromatic Madagascar vanilla beans and rich fresh cream.',
      shortDescription: 'Infused with real Madagascar vanilla beans.',
      price: 45.00,
      compareAtPrice: 50.00,
      size: '500ml Tub',
      categoryId: iceCreamCat.id,
      imageUrl: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&auto=format&fit=crop&q=80',
      isFeatured: true,
      features: ['Real Vanilla Pods', 'Rich & Creamy', 'Fresh Dairy'],
    },
    {
      name: 'Decadent Dark Chocolate Fudge Ice Cream',
      slug: 'decadent-dark-chocolate-fudge-ice-cream',
      description: 'Indulgent rich chocolate ice cream made with premium Ghanaian cocoa and thick ribbons of fudge swirl.',
      shortDescription: 'Pure Ghanaian cocoa & dark chocolate fudge ribbon.',
      price: 45.00,
      compareAtPrice: 50.00,
      size: '500ml Tub',
      categoryId: iceCreamCat.id,
      imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&auto=format&fit=crop&q=80',
      isFeatured: true,
      features: ['Ghanaian Cocoa', 'Dark Fudge Ribbon', 'Ultra Rich'],
    },
    {
      name: 'Fresh Strawberry Swirl Bliss Ice Cream',
      slug: 'fresh-strawberry-swirl-bliss-ice-cream',
      description: 'Creamy sweet dairy blended with crushed fresh strawberries and homemade strawberry jam swirl.',
      shortDescription: 'Real fresh strawberry puree and cream.',
      price: 45.00,
      compareAtPrice: 50.00,
      size: '500ml Tub',
      categoryId: iceCreamCat.id,
      imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&auto=format&fit=crop&q=80',
      isFeatured: true,
      features: ['Real Strawberry Puree', 'Natural Pink Bliss', 'No Artificial Dyes'],
    },
    {
      name: 'Salted Caramel Toffee Crunch Gelato',
      slug: 'salted-caramel-toffee-crunch-gelato',
      description: 'Velvety Italian-style gelato with buttery salted caramel swirl and crispy toffee nuggets.',
      shortDescription: 'Buttery salted caramel & crispy toffee nuggets.',
      price: 50.00,
      compareAtPrice: 55.00,
      size: '500ml Tub',
      categoryId: iceCreamCat.id,
      imageUrl: 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?w=800&auto=format&fit=crop&q=80',
      isFeatured: true,
      features: ['Golden Caramel', 'Toffee Crunch', 'Italian Gelato Style'],
    },
    {
      name: 'Cookies & Cream Artisan Gelato',
      slug: 'cookies-and-cream-artisan-gelato',
      description: 'Rich sweet cream loaded with generous chunks of crunchy chocolate cookies throughout every scoop.',
      shortDescription: 'Sweet cream loaded with crunchy chocolate cookies.',
      price: 48.00,
      compareAtPrice: 52.00,
      size: '500ml Tub',
      categoryId: iceCreamCat.id,
      imageUrl: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=800&auto=format&fit=crop&q=80',
      isFeatured: false,
      features: ['Oreo Cookie Chunks', 'Sweet Cream', 'Customer Favorite'],
    },
    {
      name: 'Creamy Roasted Pistachio Gelato',
      slug: 'creamy-roasted-pistachio-gelato',
      description: 'Crafted with premium slow-roasted pistachios for an authentic nutty flavor and smooth mouthfeel.',
      shortDescription: 'Slow-roasted Mediterranean pistachios.',
      price: 52.00,
      compareAtPrice: 58.00,
      size: '500ml Tub',
      categoryId: iceCreamCat.id,
      imageUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800&auto=format&fit=crop&q=80',
      isFeatured: false,
      features: ['Roasted Pistachios', 'Nutty Aroma', 'Silky Texture'],
    },

    // GREEK YOGURT
    {
      name: 'Pure Ghanaian Greek Yogurt (Vanilla)',
      slug: 'pure-ghanaian-greek-yogurt-vanilla',
      description: 'Velvety, rich Greek yogurt infused with natural vanilla extract. Thick, creamy, and packed with protein.',
      shortDescription: 'Thick, creamy protein-packed vanilla Greek yogurt.',
      price: 35.00,
      compareAtPrice: 40.00,
      size: '500ml Bottle',
      categoryId: greekCat.id,
      imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&auto=format&fit=crop&q=80',
      isFeatured: true,
      features: ['High Protein', 'Rich & Thick', 'Natural Vanilla'],
    },
    {
      name: 'Natural Unsweetened Greek Yogurt',
      slug: 'natural-unsweetened-greek-yogurt',
      description: 'Pure strained Greek yogurt with zero added sugar or artificial preservatives. Ideal for healthy diets.',
      shortDescription: '100% pure unsweetened strained Greek yogurt.',
      price: 35.00,
      size: '500ml Bottle',
      categoryId: greekCat.id,
      imageUrl: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=800&auto=format&fit=crop&q=80',
      isFeatured: false,
      features: ['Zero Sugar', 'Keto Friendly', 'Clean Nutrition'],
    },
    {
      name: 'Wild Blueberry Swirl Greek Yogurt',
      slug: 'wild-blueberry-swirl-greek-yogurt',
      description: 'Creamy Greek yogurt layered with organic wild blueberry compote for antioxidant-rich goodness.',
      shortDescription: 'Layered with wild blueberry fruit compote.',
      price: 38.00,
      compareAtPrice: 42.00,
      size: '500ml Bottle',
      categoryId: greekCat.id,
      imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&auto=format&fit=crop&q=80',
      isFeatured: true,
      features: ['Antioxidant Rich', 'Wild Blueberries', 'High Protein'],
    },

    // PROBIOTIC DRINKABLE YOGURT
    {
      name: 'Rich Strawberry Probiotic Drinkable Yogurt',
      slug: 'rich-strawberry-probiotic-drinkable-yogurt',
      description: 'Refreshing strawberry-flavored probiotic drinkable yogurt packed with active live cultures for gut health.',
      shortDescription: 'Smooth drinkable yogurt with live probiotic cultures.',
      price: 30.00,
      compareAtPrice: 35.00,
      size: '500ml Bottle',
      categoryId: probioticCat.id,
      imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop&q=80',
      isFeatured: true,
      features: ['Live Probiotics', 'Digestive Health', 'Real Strawberry'],
    },
    {
      name: 'Sweet Pineapple Mango Probiotic Yogurt',
      slug: 'sweet-pineapple-mango-probiotic-yogurt',
      description: 'Tropical Ghanaian pineapple and sweet mango puree blended with smooth probiotic cultured dairy.',
      shortDescription: 'Ghanaian tropical pineapple & sweet mango.',
      price: 30.00,
      compareAtPrice: 35.00,
      size: '500ml Bottle',
      categoryId: probioticCat.id,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      isFeatured: false,
      features: ['Tropical Pineapple', 'Ripe Mango', 'Gut Friendly'],
    },

    // BRUKINA
    {
      name: 'Authentic Ghanaian Millet Brukina',
      slug: 'authentic-ghanaian-millet-brukina',
      description: 'Traditional Ghanaian millet Brukina drink made with fresh cow milk yogurt and steamed millet granules.',
      shortDescription: 'Authentic steamed millet granules & fresh dairy yogurt.',
      price: 25.00,
      compareAtPrice: 30.00,
      size: '500ml Bottle',
      categoryId: brukinaCat.id,
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
      isFeatured: true,
      features: ['Traditional Recipe', 'Steamed Millet', 'Pure Cow Milk'],
    },
    {
      name: 'Sweet Coconut Milk Brukina Royale',
      slug: 'sweet-coconut-milk-brukina-royale',
      description: 'Rich Brukina enriched with velvety coconut cream and natural honey for an extraordinary local treat.',
      shortDescription: 'Enriched with velvety coconut milk and blossom honey.',
      price: 28.00,
      compareAtPrice: 32.00,
      size: '500ml Bottle',
      categoryId: brukinaCat.id,
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
      isFeatured: true,
      features: ['Creamy Coconut', 'Pure Honey', 'Steamed Millet'],
    },

    // PARFAITS & SMOOTHIE BOWLS
    {
      name: 'Honey Granola Berry Crunch Parfait',
      slug: 'honey-granola-berry-crunch-parfait',
      description: 'Layered Greek yogurt, crunchy roasted honey oat granola, fresh seasonal berries, and chia seeds.',
      shortDescription: 'Layered Greek yogurt, toasted granola & berries.',
      price: 40.00,
      compareAtPrice: 45.00,
      size: '400g Cup',
      categoryId: parfaitCat.id,
      imageUrl: 'https://images.unsplash.com/photo-1505253758473-96b3015f27eb?w=800&auto=format&fit=crop&q=80',
      isFeatured: true,
      features: ['Toasted Granola', 'Fresh Berries', 'Chia Seeds'],
    },

    // FROZEN YOGURT
    {
      name: 'Tropical Mango Passionfruit Frozen Yogurt',
      slug: 'tropical-mango-passionfruit-frozen-yogurt',
      description: 'Tangy-sweet frozen yogurt blended with fresh mango chunks and exotic passionfruit syrup.',
      shortDescription: 'Tangy-sweet mango and passionfruit frozen swirl.',
      price: 36.00,
      compareAtPrice: 40.00,
      size: '400ml Tub',
      categoryId: froyoCat.id,
      imageUrl: 'https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=800&auto=format&fit=crop&q=80',
      isFeatured: false,
      features: ['Mango & Passionfruit', 'Low Fat', 'Live Cultures'],
    },
  ]

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } })
    if (existing) {
      await prisma.product.update({
        where: { slug: p.slug },
        data: {
          name: p.name,
          description: p.description,
          shortDescription: p.shortDescription,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          size: p.size,
          categoryId: p.categoryId,
          isPublished: true,
          isFeatured: p.isFeatured,
          features: p.features,
        },
      })
      // Ensure main image exists
      const existingImg = await prisma.productImage.findFirst({ where: { productId: existing.id } })
      if (existingImg) {
        await prisma.productImage.update({
          where: { id: existingImg.id },
          data: { url: p.imageUrl, altText: p.name },
        })
      } else {
        await prisma.productImage.create({
          data: { productId: existing.id, url: p.imageUrl, altText: p.name, isMain: true },
        })
      }
      console.log(`🔄 Product updated: ${p.name}`)
    } else {
      const created = await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          shortDescription: p.shortDescription,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          size: p.size,
          categoryId: p.categoryId,
          isPublished: true,
          isFeatured: p.isFeatured,
          features: p.features,
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

  // 5. DELIVERY ZONES (Ashanti, Volta & Greater Accra)
  const zones = [
    { name: 'KNUST Campus & Ayigya (Kumasi)', fee: 15.00, estimatedTime: '30-45 mins delivery' },
    { name: 'Bantama & Adum (Kumasi Central)', fee: 20.00, estimatedTime: '45-60 mins delivery' },
    { name: 'Ho Central & Ho Technical University', fee: 15.00, estimatedTime: '30-45 mins delivery' },
    { name: 'Mawuli & Bankoe (Ho Area)', fee: 15.00, estimatedTime: '30-45 mins delivery' },
    { name: 'Accra Express Station / VIP Bus Delivery', fee: 35.00, estimatedTime: 'Next-day delivery' },
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

  console.log('🎉 Seed complete! BigDebbie owner credentials active & 14+ products in database!')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
