/**
 * Upserts sahajanand NAVRATRI LEHENGA CHOLI COLLECTIONS-2026 under NAVRATRI COLLECTION.
 * Idempotent — does not modify other Sahajanand or Navratri products.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789240728/IMG_20260913_003024_808.jpg'

const DESCRIPTION = [
  '💕 Navratri Festive vibes Are traditional and spiritual, And focus on the fun aspects of the festival, So Choose the Different colors Lehenga With Top For the dancing, the devotion, or the sense of our community. 💃🏻',
  '',
  'PRODUCT CODE:',
  'L-776',
  '',
  'LEHENGA — FULL-STITCHED 👇🏻',
  '✦ Fabrics & Work: Cora Cotton With Attractive Gota-Patti & Lace work',
  '✦ Length: 42"',
  '✦ Waist: 42"',
  '✦ Inner: Cotton',
  '✦ Flair: 12 MTR',
  '✦ Closure: Chain Attached & With Dori Drawstring',
  '✦ Stitching Type: 4 layer frill stitching',
  '',
  'TOP — FULL-STITCHED 👇🏻',
  '✦ Fabrics & Work: Cora Cotton with Gota patti & lace work',
  '✦ Size: 40" Stitched (User can Alter upto 44")',
  '✦ Stitching Type: Peplum',
  '✦ Length: 30"',
  '✦ Sleeves Type: Full-Sleeves',
  '✦ Neck Type: Pan (V Neck)',
  '✦ Closure: Back side Dori given',
  '',
  'COLOUR:',
  '✦ 4 colours — Off-White, Purple, Rani-pink, Rust',
  '',
  'WEIGHT:',
  '✦ 1.00 KG',
  '',
  'COMBO RATE:',
  '✦ ₹2,550/-',
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
    where: { slug: 'sahajanand-navratri-lehenga-choli-collections-2026' },
    create: {
      slug: 'sahajanand-navratri-lehenga-choli-collections-2026',
      sku: 'L-776',
      name: 'sahajanand NAVRATRI LEHENGA CHOLI COLLECTIONS-2026 👗',
      description: DESCRIPTION,
      price: 2550,
      originalPrice: null,
      image: IMAGE,
      images: [IMAGE],
      category: 'Navratri Collection',
      collections: ['navratri-collection'],
      fabric: 'Cora Cotton With Attractive Gota-Patti & Lace work',
      weave: '4 layer frill stitching · Peplum top',
      length: 'Lehenga Length: 42" · Waist: 42" · Flair: 12 MTR',
      blouse: 'Cora Cotton · Size: 40" Stitched (alter upto 44") · Length: 30" · Full-Sleeves · Pan (V Neck)',
      care: 'Product Code: L-776 · Weight: 1.00 KG · Combo Rate: ₹2,550/- · 4 colours: Off-White, Purple, Rani-pink, Rust',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      sku: 'L-776',
      name: 'sahajanand NAVRATRI LEHENGA CHOLI COLLECTIONS-2026 👗',
      description: DESCRIPTION,
      price: 2550,
      originalPrice: null,
      image: IMAGE,
      images: [IMAGE],
      category: 'Navratri Collection',
      collections: ['navratri-collection'],
      fabric: 'Cora Cotton With Attractive Gota-Patti & Lace work',
      weave: '4 layer frill stitching · Peplum top',
      length: 'Lehenga Length: 42" · Waist: 42" · Flair: 12 MTR',
      blouse: 'Cora Cotton · Size: 40" Stitched (alter upto 44") · Length: 30" · Full-Sleeves · Pan (V Neck)',
      care: 'Product Code: L-776 · Weight: 1.00 KG · Combo Rate: ₹2,550/- · 4 colours: Off-White, Purple, Rani-pink, Rust',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(`sahajanand NAVRATRI LEHENGA CHOLI COLLECTIONS-2026 ready: ${product.id}`)
  console.log(`  slug: ${product.slug}`)
  console.log(`  sku: ${product.sku}`)
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
