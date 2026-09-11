/**
 * Upserts a NEW Lehenga Collection catalog (lehanga-03) with a single primary image.
 * Idempotent — does not modify kanchipuram-silk-lehenga, lehanga-02, CHHABILI, or JOBANIYU.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789113687/WhatsApp_Image_2026-09-10_at_11.26.34_AM_1.jpg'

const IMAGES: string[] = [IMAGE]

async function main() {
  await prisma.collection.upsert({
    where: { slug: 'navratri-collection' },
    create: {
      slug: 'navratri-collection',
      name: 'Navratri Collection',
      description: 'FESTIVE EDITION · Browse Navratri Collection sarees.',
      image: IMAGE,
      active: true,
      featured: false,
    },
    update: {
      name: 'Navratri Collection',
    },
  })

  await prisma.collection.upsert({
    where: { slug: 'lehanga' },
    create: {
      slug: 'lehanga',
      name: 'Lehenga Collection',
      description: 'NAVRATRI COLLECTION · Explore the Lehenga Collection.',
      image: IMAGE,
      active: true,
      featured: false,
    },
    update: {
      name: 'Lehenga Collection',
    },
  })

  const product = await prisma.product.upsert({
    where: { slug: 'lehanga-03' },
    create: {
      slug: 'lehanga-03',
      sku: 'SH-LEHANGA-03',
      name: 'LEHANGA',
      description: 'Lehenga Collection piece — details coming soon.',
      price: 0,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'Lehenga Collection',
      collections: ['lehanga', 'navratri-collection'],
      fabric: '—',
      weave: '—',
      length: '—',
      blouse: '—',
      care: '—',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      name: 'LEHANGA',
      description: 'Lehenga Collection piece — details coming soon.',
      price: 0,
      image: IMAGE,
      images: IMAGES,
      category: 'Lehenga Collection',
      collections: ['lehanga', 'navratri-collection'],
      fabric: '—',
      weave: '—',
      length: '—',
      blouse: '—',
      care: '—',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(`Lehenga Collection catalog #3 ready: ${product.id} (${product.slug})`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
