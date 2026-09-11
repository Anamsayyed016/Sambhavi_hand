/**
 * Upserts CHHABILI Catalog #3 only.
 * Gallery: NEW cover first, then existing Catalog #3 image as #2.
 * Does not modify Catalog #1 or #2.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE_1 =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789022727/WhatsApp_Image_2026-09-10_at_11.16.46_AM_2.jpg'

const IMAGE_2 =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789022728/WhatsApp_Image_2026-09-10_at_11.16.50_AM_1.jpg'

const IMAGE_3 =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789022728/WhatsApp_Image_2026-09-10_at_11.16.47_AM.jpg'

const IMAGE_4 =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789022727/WhatsApp_Image_2026-09-10_at_11.16.47_AM_1.jpg'

/** Catalog #3 (orange): keep existing gallery; append two videos last. */
const IMAGES: string[] = [
  IMAGE_1,
  IMAGE_2,
  IMAGE_3,
  IMAGE_4,
  'https://res.cloudinary.com/tcjtyr02/video/upload/v1789109611/WhatsApp_Video_2026-09-10_at_11.25.26_AM_1.mp4',
  'https://res.cloudinary.com/tcjtyr02/video/upload/v1789109601/WhatsApp_Video_2026-09-10_at_11.25.26_AM.mp4',
]

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
      image: IMAGE_1,
      active: true,
      featured: true,
    },
    update: {
      active: true,
    },
  })

  const product = await prisma.product.upsert({
    where: { slug: 'chhabili-lehenga-set-04' },
    create: {
      slug: 'chhabili-lehenga-set-04',
      sku: 'SH-CHHABILI-LEHENGA-04',
      name: 'CHHABILI',
      description: DESCRIPTION,
      price: 3999,
      originalPrice: null,
      image: IMAGE_1,
      images: IMAGES,
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
      sku: 'SH-CHHABILI-LEHENGA-04',
      name: 'CHHABILI',
      description: DESCRIPTION,
      price: 3999,
      image: IMAGE_1,
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
  console.log(`  sku: ${product.sku}`)
  console.log(`  price: ₹${product.price}`)
  console.log(`  image: ${product.image}`)
  console.log(`  images: ${product.images.length}`)
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
