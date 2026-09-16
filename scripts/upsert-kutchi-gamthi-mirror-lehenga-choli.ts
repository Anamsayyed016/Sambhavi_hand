/**
 * Upserts Multi Pure Reyon Kutchi Gamthi Mirror Work Lehenga Choli under NAVRATRI COLLECTION.
 * Idempotent — does not modify other Navratri, lehenga, Anaya, or Sahajanand products.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789241315/IMG-20260912-WA0527.jpg'

const IMAGES: string[] = [
  IMAGE,
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789241315/IMG-20260912-WA0523.jpg',
]

const DESCRIPTION = [
  'Heavy Flair Ready To Wear Real Mirror Work Chaniya Choli From Anaya Designer Studio',
  '',
  'LEHENGA DETAILS:',
  '✦ Fabric: Cotton Printed',
  '✦ Work: Attractive Real Mirror Lace Work',
  '✦ Length: 42"',
  '✦ Waist: 42"',
  '✦ Inner: Cotton',
  '✦ Flair: 4 Meter',
  '✦ Stitching: Fully Stitched with Canvas Patta',
  '✦ Closure: Chain Attached & Dori Drawstring',
  '',
  'BLOUSE DETAILS:',
  '✦ Fabric: Cotton',
  '✦ Work: Kutchi Gamthi Embroidery with Kodi Lace Work',
  '✦ Size: 40" Stitched | Alterable from 38" to 44"',
  '✦ Length: 20"',
  '✦ Stitching: Fully Stitched | Blouse Pattern',
  '',
  'PACKAGE CONTAINS:',
  '✦ 1 Fully Stitched Lehenga',
  '✦ 1 Fully Stitched Blouse',
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
    where: { slug: 'multi-pure-reyon-kutchi-gamthi-mirror-work-lehenga-choli-multicolor' },
    create: {
      slug: 'multi-pure-reyon-kutchi-gamthi-mirror-work-lehenga-choli-multicolor',
      sku: 'SH-KUTCHI-GAMTHI-MIRROR-01',
      name: 'Multi Pure Reyon Kutchi Gamthi Thread Embroidered & Mirror Work Lehenga Choli - Multicolor',
      description: DESCRIPTION,
      price: 1999,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'Navratri Collection',
      collections: ['navratri-collection'],
      fabric: 'Cotton Printed · Cotton blouse',
      weave: 'Attractive Real Mirror Lace Work · Kutchi Gamthi Embroidery with Kodi Lace',
      length: 'Lehenga Length: 42" · Waist: 42" · Flair: 4 Meter',
      blouse: 'Cotton · Size: 40" Stitched | Alterable 38"–44" · Length: 20" · Fully Stitched',
      care: 'Package: 1 Fully Stitched Lehenga + 1 Fully Stitched Blouse · Anaya Designer Studio',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      sku: 'SH-KUTCHI-GAMTHI-MIRROR-01',
      name: 'Multi Pure Reyon Kutchi Gamthi Thread Embroidered & Mirror Work Lehenga Choli - Multicolor',
      description: DESCRIPTION,
      price: 1999,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'Navratri Collection',
      collections: ['navratri-collection'],
      fabric: 'Cotton Printed · Cotton blouse',
      weave: 'Attractive Real Mirror Lace Work · Kutchi Gamthi Embroidery with Kodi Lace',
      length: 'Lehenga Length: 42" · Waist: 42" · Flair: 4 Meter',
      blouse: 'Cotton · Size: 40" Stitched | Alterable 38"–44" · Length: 20" · Fully Stitched',
      care: 'Package: 1 Fully Stitched Lehenga + 1 Fully Stitched Blouse · Anaya Designer Studio',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(`Kutchi Gamthi Mirror Lehenga ready: ${product.id}`)
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
