/**
 * Upserts DHARVI catalog product #4 only (₹1,449 Dharvi DURGA).
 * Idempotent — does not modify ₹1,250 / ₹999 / ₹1,499 DHARVI products.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE = 'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206464/1.jpg'
const IMAGES: string[] = [
  IMAGE,
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789206463/2.jpg',
  'https://res.cloudinary.com/tcjtyr02/video/upload/v1789206473/3.mp4',
  'https://res.cloudinary.com/tcjtyr02/video/upload/v1789206473/4.mp4',
]

const DESCRIPTION = [
  'Beautiful soft simmer zari cotton sarees with all DURGA PUJA PRINT design along with zari border',
  '',
  'Beautiful Durga special print',
  '',
  'Beautiful zumka on pallu',
  '',
  'Running blouse with border and Durga print',
  '',
  '100% quality',
  '',
  'Beware to duplicate Quality',
  '',
  'Ready To Dispatch',
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
    where: { slug: 'dharvi-durga' },
    create: {
      slug: 'dharvi-durga',
      sku: 'SH-DHARVI-04',
      name: 'Dharvi DURGA',
      description: DESCRIPTION,
      price: 1449,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'DHARVI — DURGA POOJA EDITION',
      collections: ['dharvi-durga-pooja-edition'],
      fabric: 'Soft simmer zari cotton',
      weave: 'Durga Puja Print · Zari Border',
      length: 'Saree with running blouse',
      blouse: 'Running blouse with border and Durga print',
      care: '100% quality · Ready To Dispatch',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      sku: 'SH-DHARVI-04',
      name: 'Dharvi DURGA',
      description: DESCRIPTION,
      price: 1449,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'DHARVI — DURGA POOJA EDITION',
      collections: ['dharvi-durga-pooja-edition'],
      fabric: 'Soft simmer zari cotton',
      weave: 'Durga Puja Print · Zari Border',
      length: 'Saree with running blouse',
      blouse: 'Running blouse with border and Durga print',
      care: '100% quality · Ready To Dispatch',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(`DHARVI product #4 ready: ${product.id}`)
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
