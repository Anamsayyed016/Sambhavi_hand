/**
 * Upserts DHARVI catalog product #6 only (₹1,450 Handloom Cotton).
 * Idempotent — does not modify other DHARVI products.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206601/WhatsApp_Image_2026-09-12_at_12.48.31_PM.jpg'
const IMAGES: string[] = [IMAGE]

const DESCRIPTION = [
  'Elegant Handloom Cotton Saree with Traditional Motif Design Lightweight & Soft Fabric for Daily & Festive Wear',
  '',
  'FABRIC:',
  'Crafted from high-quality, breathable cotton that feels soft on the skin, ensuring comfort throughout the day for both formal and casual use.',
  '',
  'DESIGN:',
  'Features delicate handloom motifs with a contrasting ethnic border, perfect for festivals, office wear, and special occasions.',
  '',
  'RATE:',
  '₹1,450 — FIXED',
  '',
  'QUALITY:',
  '100% Best Quality',
  '',
  'WEIGHT:',
  '470 GM',
  '',
  'AVAILABILITY:',
  'Ready To Ship',
].join('\n')

async function main() {
  await prisma.collection.upsert({
    where: { slug: 'dharvi-durga-pooja-edition' },
    create: {
      slug: 'dharvi-durga-pooja-edition',
      name: 'DHARVI — DURGA POOJA EDITION',
      description: 'NAVRATRI COLLECTION · Explore the Dharvi Durga Pooja Edition.',
      image: IMAGE,
      active: true,
      featured: false,
    },
    update: {
      name: 'DHARVI — DURGA POOJA EDITION',
      active: true,
    },
  })

  const product = await prisma.product.upsert({
    where: { slug: 'dharvi-durga-puja-collection-02' },
    create: {
      slug: 'dharvi-durga-puja-collection-02',
      sku: 'SH-DHARVI-06',
      name: 'Dharvi Durga Puja collection',
      description: DESCRIPTION,
      price: 1450,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'DHARVI — DURGA POOJA EDITION',
      collections: ['dharvi-durga-pooja-edition'],
      fabric:
        'Crafted from high-quality, breathable cotton that feels soft on the skin, ensuring comfort throughout the day for both formal and casual use.',
      weave:
        'Delicate handloom motifs with a contrasting ethnic border, perfect for festivals, office wear, and special occasions.',
      length: 'Weight: 470 GM',
      blouse: '100% Best Quality · Ready To Ship',
      care: 'RATE: ₹1,450 — FIXED · Weight: 470 GM · Ready To Ship',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      sku: 'SH-DHARVI-06',
      name: 'Dharvi Durga Puja collection',
      description: DESCRIPTION,
      price: 1450,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'DHARVI — DURGA POOJA EDITION',
      collections: ['dharvi-durga-pooja-edition'],
      fabric:
        'Crafted from high-quality, breathable cotton that feels soft on the skin, ensuring comfort throughout the day for both formal and casual use.',
      weave:
        'Delicate handloom motifs with a contrasting ethnic border, perfect for festivals, office wear, and special occasions.',
      length: 'Weight: 470 GM',
      blouse: '100% Best Quality · Ready To Ship',
      care: 'RATE: ₹1,450 — FIXED · Weight: 470 GM · Ready To Ship',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(`DHARVI product #6 ready: ${product.id}`)
  console.log(`  slug: ${product.slug}`)
  console.log(`  price: ₹${product.price.toLocaleString('en-IN')}`)
  console.log(`  images: ${product.images.length}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
