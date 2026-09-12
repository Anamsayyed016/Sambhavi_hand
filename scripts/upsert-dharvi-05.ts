/**
 * Upserts DHARVI catalog product #5 only (₹1,560 Plain Linen Golden Jari).
 * Idempotent — does not modify ₹1,250 / ₹999 / ₹1,499 / ₹1,449 DHARVI products.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206545/WhatsApp_Image_2026-09-11_at_2.25.54_PM.jpg'
const IMAGES: string[] = [IMAGE]

const DESCRIPTION = [
  'CATLOGUE NO: Dharvi puja collection',
  '',
  'Saree Fabric: Plain Linen with Golden Jari Border',
  '',
  'Work: Digital Print',
  '',
  'Saree Length: 6.30 Meter (With Digital Blouse)',
  '',
  'Blouse Fabric: Plain Linen with Golden Jari Border with Digital Print',
  '',
  'RATE: ₹1,560',
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
    where: { slug: 'dharvi-puja-collection-02' },
    create: {
      slug: 'dharvi-puja-collection-02',
      sku: 'SH-DHARVI-05',
      name: 'Dharvi puja collection',
      description: DESCRIPTION,
      price: 1560,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'DHARVI — DURGA POOJA EDITION',
      collections: ['dharvi-durga-pooja-edition'],
      fabric: 'Plain Linen with Golden Jari Border',
      weave: 'Digital Print',
      length: '6.30 Meter (With Digital Blouse)',
      blouse: 'Plain Linen with Golden Jari Border with Digital Print',
      care: '🍁🍁🍁🍁🍁🍁',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      sku: 'SH-DHARVI-05',
      name: 'Dharvi puja collection',
      description: DESCRIPTION,
      price: 1560,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'DHARVI — DURGA POOJA EDITION',
      collections: ['dharvi-durga-pooja-edition'],
      fabric: 'Plain Linen with Golden Jari Border',
      weave: 'Digital Print',
      length: '6.30 Meter (With Digital Blouse)',
      blouse: 'Plain Linen with Golden Jari Border with Digital Print',
      care: '🍁🍁🍁🍁🍁🍁',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(`DHARVI product #5 ready: ${product.id}`)
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
