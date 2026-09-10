/**
 * Upserts a NEW CHHABILI catalog product only (Catalog #4).
 * Idempotent — does not modify Catalog #1, #2, or #3.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789022727/WhatsApp_Image_2026-09-10_at_11.16.46_AM_1.jpg'

const DESCRIPTION = [
  'Designed for Pure Cotton, this graceful lehenga features intricate Kashida and gamthi Work on the top, paired with a charming matching Purse for a complete festive look.',
  '',
  'Perfect for Navratri, Garba nights, festive gatherings & special celebrations.',
  '',
  'Specifications:',
  '✦ Designed with 8 meter flair and stitching with canvas & inner',
  '✧ Length: 41"',
  '◇ Waist fits up to 42"',
  '❖ Top 38" standard sizing',
  '✦ Top adjustable margin 36"–40"',
  '◇ Top Length 25"',
  '',
  'Package Contains:',
  '✦ Lehenga',
  '✦ Top',
  '✦ Purse',
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
      active: true,
    },
  })

  const product = await prisma.product.upsert({
    where: { slug: 'chhabili-lehenga-set-05' },
    create: {
      slug: 'chhabili-lehenga-set-05',
      sku: 'SH-CHHABILI-LEHENGA-05',
      name: 'CHHABILI',
      description: DESCRIPTION,
      price: 3999,
      originalPrice: null,
      image: IMAGE,
      images: [IMAGE],
      category: 'CHHABILI',
      collections: ['chhabili', 'navratri-collection'],
      fabric: 'Pure Cotton',
      weave: 'Lehenga Set · Kashida & Gamthi Work',
      length: '41" · 8 meter flair with canvas & inner',
      blouse: 'Top 38" (adj. 36"–40") · Top Length 25" · Waist up to 42"',
      care: 'Package: Lehenga, Top, Purse · Weight: 1.300 Kg',
      availability: ProductAvailability.IN_STOCK,
      stock: 10,
      active: true,
      featured: true,
      isNew: true,
    },
    update: {
      sku: 'SH-CHHABILI-LEHENGA-05',
      name: 'CHHABILI',
      description: DESCRIPTION,
      price: 3999,
      image: IMAGE,
      images: [IMAGE],
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

  console.log(`CHHABILI Catalog #4 ready: ${product.id}`)
  console.log(`  slug: ${product.slug}`)
  console.log(`  sku: ${product.sku}`)
  console.log(`  price: ₹${product.price}`)
  console.log(`  image: ${product.image}`)
  console.log(`  stock: ${product.stock}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
