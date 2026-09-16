/**
 * Upserts sahajanand Lehenga Choli under Lehenga Collection (Navratri nested).
 * Idempotent — does not modify other Sahajanand, Tasar, or lehenga products.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789240309/IMG_20260913_003057_358.jpg'

const IMAGES: string[] = [
  IMAGE,
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789240308/IMG_20260913_003108_082.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789240308/IMG_20260913_003108_437.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789240308/IMG_20260913_003107_860.jpg',
]

const DESCRIPTION = [
  'A Tasar Silk masterpiece dipped in artistic tie-dye prints, crafted for moments that deserve something truly unique 🌺✨',
  '',
  'DESIGN / LABEL:',
  'ANAHITHA',
  '',
  'LEHENGA (STITCHED)',
  '✦ Lehenga Fabric: Tasar Silk',
  '✦ Lehenga Work: Tie And Dye Print With Lace Touch Up',
  '✦ Lehenga Waist: Support Up To 42',
  '✦ Lehenga Closer: Drawstring With Zip',
  '✦ Stitching: Stitched With Canvas And Can-can',
  '✦ Length: 41',
  '✦ Flair: 3.80 Meter',
  '✦ Inner: Micro Crepe',
  '',
  'BLOUSE (UNSTITCHED)',
  '✦ Blouse Fabric: Tasar Silk',
  '✦ Blouse Work: Chex Print',
  '✦ Blouse Length: 0.80 Meter',
  '',
  'DUPATTA',
  '✦ Dupatta Fabric: Tasar Silk',
  '✦ Dupatta Work: Printed With Lace Border Also Comes With Both Side Tassels',
  '✦ Dupatta Length: 2.40 Meter',
  '',
  'PACKAGE CONTAIN:',
  '✦ Lehenga',
  '✦ Blouse',
  '✦ Dupatta',
  '',
  'WEIGHT:',
  '✦ 1.200 kg',
  '',
  'RATE:',
  '✦ ₹2,500',
].join('\n')

async function main() {
  await prisma.collection.upsert({
    where: { slug: 'lehanga' },
    create: {
      slug: 'lehanga',
      name: 'Lehenga Collection',
      description: 'NAVRATRI COLLECTION · Explore the Lehenga Collection.',
      image: IMAGE,
      active: true,
      featured: false,
    },
    update: {
      active: true,
    },
  })

  const product = await prisma.product.upsert({
    where: { slug: 'sahajanand-lehenga-choli' },
    create: {
      slug: 'sahajanand-lehenga-choli',
      sku: 'SH-SAHAJANAND-LEHENGA-CHOLI-01',
      name: 'sahajanand Lehenga Choli🌷',
      description: DESCRIPTION,
      price: 2500,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'Lehenga Collection',
      collections: ['lehanga', 'navratri-collection'],
      fabric: 'Tasar Silk',
      weave: 'Tie And Dye Print With Lace Touch Up · ANAHITHA',
      length: '41 · Flair: 3.80 Meter · Waist support up to 42',
      blouse: 'Tasar Silk Chex Print · Unstitched · Length: 0.80 Meter',
      care: 'Weight: 1.200 kg · Package: Lehenga, Blouse, Dupatta · RATE: ₹2,500',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      sku: 'SH-SAHAJANAND-LEHENGA-CHOLI-01',
      name: 'sahajanand Lehenga Choli🌷',
      description: DESCRIPTION,
      price: 2500,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'Lehenga Collection',
      collections: ['lehanga', 'navratri-collection'],
      fabric: 'Tasar Silk',
      weave: 'Tie And Dye Print With Lace Touch Up · ANAHITHA',
      length: '41 · Flair: 3.80 Meter · Waist support up to 42',
      blouse: 'Tasar Silk Chex Print · Unstitched · Length: 0.80 Meter',
      care: 'Weight: 1.200 kg · Package: Lehenga, Blouse, Dupatta · RATE: ₹2,500',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(`sahajanand Lehenga Choli ready: ${product.id}`)
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
