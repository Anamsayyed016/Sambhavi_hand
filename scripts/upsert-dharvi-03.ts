/**
 * Upserts DHARVI catalog product #3 only (₹1,499 Soft Linen Gold Zari).
 * Idempotent — does not modify the ₹1,250 or ₹999 DHARVI products.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206426/WhatsApp_Image_2026-09-11_at_2.22.56_PM.jpg'

const IMAGES: string[] = [
  IMAGE,
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206425/WhatsApp_Image_2026-09-11_at_2.22.55_PM.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206424/WhatsApp_Image_2026-09-11_at_2.22.55_PM_3.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206423/WhatsApp_Image_2026-09-11_at_2.22.55_PM_2.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206422/WhatsApp_Image_2026-09-11_at_2.22.55_PM_1.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206421/WhatsApp_Image_2026-09-11_at_2.22.54_PM.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206420/WhatsApp_Image_2026-09-11_at_2.22.54_PM_2.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206419/WhatsApp_Image_2026-09-11_at_2.22.54_PM_1.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206418/WhatsApp_Image_2026-09-11_at_2.22.53_PM.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206417/WhatsApp_Image_2026-09-11_at_2.22.53_PM_1.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206416/WhatsApp_Image_2026-09-11_at_2.22.51_PM.jpg',
]

const DESCRIPTION = [
  '🍁 Dharvi puja collection',
  '',
  'Fabric: Soft Linen Gold Zari Border',
  '',
  'Work: Digital Print',
  '',
  'Saree Length: 6.30 Meter',
  '(With Digital Matching Blouse)',
  '',
  'Blouse Fabric: Soft Linen with Digital Print Matching Blouse',
  '',
  '🍁🍁🍁🍁🍁🍁',
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
    where: { slug: 'dharvi-puja-collection' },
    create: {
      slug: 'dharvi-puja-collection',
      sku: 'SH-DHARVI-03',
      name: 'Dharvi puja collection',
      description: DESCRIPTION,
      price: 1499,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'DHARVI — DURGA POOJA EDITION',
      collections: ['dharvi-durga-pooja-edition'],
      fabric: 'Soft Linen Gold Zari Border',
      weave: 'Digital Print',
      length: '6.30 Meter (With Digital Matching Blouse)',
      blouse: 'Soft Linen with Digital Print Matching Blouse',
      care: 'Digital Print · Soft Linen',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      sku: 'SH-DHARVI-03',
      name: 'Dharvi puja collection',
      description: DESCRIPTION,
      price: 1499,
      image: IMAGE,
      images: IMAGES,
      category: 'DHARVI — DURGA POOJA EDITION',
      collections: ['dharvi-durga-pooja-edition'],
      fabric: 'Soft Linen Gold Zari Border',
      weave: 'Digital Print',
      length: '6.30 Meter (With Digital Matching Blouse)',
      blouse: 'Soft Linen with Digital Print Matching Blouse',
      care: 'Digital Print · Soft Linen',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(`DHARVI product #3 ready: ${product.id}`)
  console.log(`  slug: ${product.slug}`)
  console.log(`  price: ₹${product.price.toLocaleString('en-IN')}`)
  console.log(`  category: ${product.category}`)
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
