/**
 * Upserts Sahajanand 2026 NAVRATRI COLLECTION under NAVRATRI COLLECTION.
 * Idempotent — does not modify sahajanand-new-launch-series or any other products.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789240204/IMG_20260913_002946_769.jpg'

const IMAGES: string[] = [
  IMAGE,
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789240205/IMG_20260913_002946_807.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789240204/IMG_20260913_002947_456.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789240204/IMG_20260913_002947_465.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789240202/IMG_20260913_002946_950.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789240201/IMG_20260913_002946_721.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789240201/IMG_20260913_002946_622.jpg',
]

const DESCRIPTION = [
  'REAL MODLING OF NEW LAUNCHED NAVARATRI LAHENGA CHOLI FROM LOOMEERA💚',
  '',
  '👘 BLOUSE',
  '✦ Fabric: Reyon',
  '✦ Work: Real Mirror Embroidery',
  '✦ Height: 15 inch',
  '✦ Size: Free Size',
  '',
  '👗 LAHENGA',
  '✦ Fabric: Reyon',
  '✦ Kali with Pleated Flair',
  '✦ Full Flared 6 Meter',
  '✦ Height: 42 inch',
  '',
  '🥻 DUPATTA',
  '✦ Bandhni Dupatta',
  '',
  '📦 INCLUDES:',
  '✦ Blouse',
  '✦ Lehenga',
  '✦ Dupatta',
  '',
  '💫 “THIS NAVARATRI CHOOS DIFFERENT, WEAR DIFFERENT, LOOK DIFFERENT“',
  '',
  '📝 NOTE:',
  'You will get the same piece as seen in the video.',
  '',
  '🛍️ GLAM UP YOUR NEXT CELEBRATION 🛍️',
].join('\n')

async function main() {
  await prisma.collection.upsert({
    where: { slug: 'navratri-collection' },
    create: {
      slug: 'navratri-collection',
      name: 'Navratri Collection',
      description: 'Festive Navratri Collection.',
      image: IMAGE,
      active: true,
      featured: false,
    },
    update: {
      active: true,
    },
  })

  const product = await prisma.product.upsert({
    where: { slug: 'sahajanand-2026-navratri-collection' },
    create: {
      slug: 'sahajanand-2026-navratri-collection',
      sku: 'SH-SAHAJANAND-2026-01',
      name: 'Sahajanand 2026 NAVRATRI COLLECTION ✨',
      description: DESCRIPTION,
      price: 2499,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'Navratri Collection',
      collections: ['navratri-collection'],
      fabric: 'Reyon',
      weave: 'Real Mirror Embroidery · Kali with Pleated Flair',
      length: 'Lahenga Height: 42 inch · Full Flared 6 Meter',
      blouse: 'Reyon · Real Mirror Embroidery · Height: 15 inch · Free Size',
      care: 'Includes: Blouse, Lehenga, Dupatta · Same piece as seen in the video',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      sku: 'SH-SAHAJANAND-2026-01',
      name: 'Sahajanand 2026 NAVRATRI COLLECTION ✨',
      description: DESCRIPTION,
      price: 2499,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'Navratri Collection',
      collections: ['navratri-collection'],
      fabric: 'Reyon',
      weave: 'Real Mirror Embroidery · Kali with Pleated Flair',
      length: 'Lahenga Height: 42 inch · Full Flared 6 Meter',
      blouse: 'Reyon · Real Mirror Embroidery · Height: 15 inch · Free Size',
      care: 'Includes: Blouse, Lehenga, Dupatta · Same piece as seen in the video',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(`Sahajanand 2026 Navratri ready: ${product.id}`)
  console.log(`  slug: ${product.slug}`)
  console.log(`  price: ₹${product.price.toLocaleString('en-IN')}`)
  console.log(`  category: ${product.category}`)
  console.log(`  collections: ${product.collections.join(', ')}`)
  console.log(`  images: ${product.images.length}`)
  console.log(`  primary: ${product.image}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
