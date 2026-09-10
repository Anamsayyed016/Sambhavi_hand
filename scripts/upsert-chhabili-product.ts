/**
 * Upserts the first real CHHABILI product + collection metadata.
 * Idempotent — safe to re-run. Does not delete or reset unrelated catalog data.
 *
 * Stock is provisional (admin can edit inventory later in Admin → Products).
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789022729/WhatsApp_Image_2026-09-10_at_11.16.51_AM.jpg'

const IMAGE_2 =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789022729/WhatsApp_Image_2026-09-10_at_11.16.50_AM.jpg'

const IMAGE_3 =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789022728/WhatsApp_Image_2026-09-10_at_11.16.50_AM_1.jpg'

/** Explicit gallery order: #1 primary, #2 existing second, #3 newest — never auto-sorted. */
const IMAGES = [IMAGE, IMAGE_2, IMAGE_3] as const

const DESCRIPTION = [
  'Designed for Pure Cotton, this graceful lehenga features intricate Kashida and gamthi Work on the top, paired with a charming matching Purse for a complete festive look.',
  '',
  'Perfect for Navratri, Garba nights, festive gatherings & special celebrations.',
  '',
  'Specifications:',
  '✦ Designed with 8 meter flair and stitching with canvas & inner',
  '✧ Length: 41"',
  '◇ Waist: Fits Up To 42"',
  '❖ Top: 38" standard sizing',
  '✦ Top adjustable margin: 36"–40"',
  '◇ Top Length: 25"',
  '',
  'Package Contains:',
  '✦ Lehenga',
  '✧ Top',
  '◇ Purse',
  '',
  'Weight:',
  '◇ 1.300 Kg',
].join('\n')

async function main() {
  await prisma.collection.upsert({
    where: { slug: 'chhabili' },
    create: {
      slug: 'chhabili',
      name: 'CHHABILI',
      description: 'FESTIVE EDITION · Explore the Chhabili collection.',
      image: IMAGE,
      active: true,
      featured: true,
    },
    update: {
      name: 'CHHABILI',
      active: true,
      // Keep admin-managed description/image unless still a placeholder.
    },
  })

  await prisma.collection.upsert({
    where: { slug: 'navratri-collection' },
    create: {
      slug: 'navratri-collection',
      name: 'Navratri Collection',
      description: 'FESTIVE EDITION · Browse Navratri Collection sarees.',
      image: '/images/collection-silk.png',
      active: true,
      featured: false,
    },
    update: {
      name: 'Navratri Collection',
      active: true,
    },
  })

  const product = await prisma.product.upsert({
    where: { slug: 'chhabili-lehenga-set' },
    create: {
      slug: 'chhabili-lehenga-set',
      sku: 'SH-CHHABILI-LEHENGA-01',
      name: 'CHHABILI',
      description: DESCRIPTION,
      price: 3999,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'CHHABILI',
      collections: ['chhabili', 'navratri-collection'],
      fabric: 'Pure Cotton',
      weave: 'Lehenga Set · Kashida & Gamthi Work',
      length: '41" · 8 meter flair with canvas & inner',
      blouse: 'Top 38" (adj. 36"–40") · Top Length 25" · Waist up to 42"',
      care: 'Package: Lehenga, Top, Purse · Weight: 1.300 Kg',
      availability: ProductAvailability.IN_STOCK,
      // Provisional — update real inventory in Admin → Products.
      stock: 10,
      active: true,
      featured: true,
      isNew: true,
    },
    update: {
      sku: 'SH-CHHABILI-LEHENGA-01',
      name: 'CHHABILI',
      description: DESCRIPTION,
      price: 3999,
      image: IMAGE,
      images: IMAGES,
      category: 'CHHABILI',
      collections: ['chhabili', 'navratri-collection'],
      fabric: 'Pure Cotton',
      weave: 'Lehenga Set · Kashida & Gamthi Work',
      length: '41" · 8 meter flair with canvas & inner',
      blouse: 'Top 38" (adj. 36"–40") · Top Length 25" · Waist up to 42"',
      care: 'Package: Lehenga, Top, Purse · Weight: 1.300 Kg',
      availability: ProductAvailability.IN_STOCK,
      active: true,
      featured: true,
      isNew: true,
      // Preserve admin-managed stock on re-run.
    },
  })

  console.log(`CHHABILI product ready: ${product.id}`)
  console.log(`  slug: ${product.slug}`)
  console.log(`  price: ₹${product.price}`)
  console.log(`  category: ${product.category}`)
  console.log(`  collections: ${product.collections.join(', ')}`)
  console.log(`  images: ${product.images.length}`)
  console.log(`  stock: ${product.stock} (edit in Admin → Products if needed)`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
