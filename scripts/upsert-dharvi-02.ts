/**
 * Upserts DHARVI catalog product #2 only (₹999 Soft Linen Print).
 * Idempotent — does not modify the ₹1,250 DHARVI product or other catalogs.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206372/WhatsApp_Image_2026-09-11_at_2.21.56_PM.jpg'

const IMAGES: string[] = [
  IMAGE,
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206373/WhatsApp_Image_2026-09-11_at_2.21.57_PM.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206371/WhatsApp_Image_2026-09-11_at_2.21.56_PM_2.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206370/WhatsApp_Image_2026-09-11_at_2.21.56_PM_1.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206368/WhatsApp_Image_2026-09-11_at_2.21.55_PM_3.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206369/WhatsApp_Image_2026-09-11_at_2.21.55_PM.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206367/WhatsApp_Image_2026-09-11_at_2.21.55_PM_2.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206366/WhatsApp_Image_2026-09-11_at_2.21.55_PM_1.jpg',
]

const DESCRIPTION = [
  '🥳Being Traditional Is Being Classy.',
  '',
  '🥳 Fabric: Soft Linen Print & Blouse',
  '',
  "Let's Talk About Fashion💃🏼",
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
    where: { slug: 'dharvi-durga-puja-collection' },
    create: {
      slug: 'dharvi-durga-puja-collection',
      sku: 'SH-DHARVI-02',
      name: 'Dharvi Durga Puja Collection🇮🇳💫',
      description: DESCRIPTION,
      price: 999,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'DHARVI — DURGA POOJA EDITION',
      collections: ['dharvi-durga-pooja-edition'],
      fabric: 'Soft Linen Print & Blouse',
      weave: 'Linen Print',
      length: 'Saree with blouse',
      blouse: 'Matching blouse',
      care: "Let's Talk About Fashion💃🏼",
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      sku: 'SH-DHARVI-02',
      name: 'Dharvi Durga Puja Collection🇮🇳💫',
      description: DESCRIPTION,
      price: 999,
      image: IMAGE,
      images: IMAGES,
      category: 'DHARVI — DURGA POOJA EDITION',
      collections: ['dharvi-durga-pooja-edition'],
      fabric: 'Soft Linen Print & Blouse',
      weave: 'Linen Print',
      length: 'Saree with blouse',
      blouse: 'Matching blouse',
      care: "Let's Talk About Fashion💃🏼",
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(`DHARVI product #2 ready: ${product.id}`)
  console.log(`  slug: ${product.slug}`)
  console.log(`  price: ₹${product.price.toLocaleString('en-IN')}`)
  console.log(`  category: ${product.category}`)
  console.log(`  collections: ${product.collections.join(', ')}`)
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
