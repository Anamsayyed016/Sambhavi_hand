/**
 * Upserts DHARVI — DURGA POOJA EDITION collection + its first product.
 * Idempotent — does not modify CHHABILI, JOBANIYU, Lehenga Collection,
 * LEHENGA CHOLI, or any other products.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206290/WhatsApp_Image_2026-09-11_at_2.18.16_PM.jpg'

const IMAGES: string[] = [
  IMAGE,
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206289/WhatsApp_Image_2026-09-11_at_2.18.16_PM_1.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206288/WhatsApp_Image_2026-09-11_at_2.18.15_PM.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206288/WhatsApp_Image_2026-09-11_at_2.18.15_PM_1.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206287/WhatsApp_Image_2026-09-11_at_2.18.14_PM.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206286/WhatsApp_Image_2026-09-11_at_2.18.14_PM_2.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206286/WhatsApp_Image_2026-09-11_at_2.18.14_PM_1.jpg',
]

const DESCRIPTION = [
  'ENJOY YOUR FESTIVALS WITH THIS SAREE',
  '',
  '🥻 Saree Fabric: Heavy blooming mul cotton saree with gold pattu border on allover saree with PERFECTLY MATCHED blouse piece and pallu',
  '',
  '✏️ We believe in Quality & Fashion in new catalog',
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
      description: 'NAVRATRI COLLECTION · Explore the Dharvi Durga Pooja Edition.',
      image: IMAGE,
      active: true,
    },
  })

  const product = await prisma.product.upsert({
    where: { slug: 'dharvi-durga-pooja-edition' },
    create: {
      slug: 'dharvi-durga-pooja-edition',
      sku: 'SH-DHARVI-01',
      name: 'DHARVI — DURGA POOJA EDITION',
      description: DESCRIPTION,
      price: 1250,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'DHARVI — DURGA POOJA EDITION',
      collections: ['dharvi-durga-pooja-edition'],
      fabric: 'Heavy Blooming Mul Cotton',
      weave: 'Gold Pattu Border · Allover',
      length: 'Saree with matching pallu',
      blouse: 'Perfectly matched blouse piece included',
      care: 'Quality & Fashion · New catalog',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      sku: 'SH-DHARVI-01',
      name: 'DHARVI — DURGA POOJA EDITION',
      description: DESCRIPTION,
      price: 1250,
      image: IMAGE,
      images: IMAGES,
      category: 'DHARVI — DURGA POOJA EDITION',
      collections: ['dharvi-durga-pooja-edition'],
      fabric: 'Heavy Blooming Mul Cotton',
      weave: 'Gold Pattu Border · Allover',
      length: 'Saree with matching pallu',
      blouse: 'Perfectly matched blouse piece included',
      care: 'Quality & Fashion · New catalog',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(`DHARVI product ready: ${product.id}`)
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
