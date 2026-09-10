/**
 * Upserts LEHANGA product #2 (image-only catalog entry).
 * Idempotent — does not modify lehanga-kanjiveram-silk or other products.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789041229/WhatsApp_Image_2026-09-10_at_11.18.13_AM_2.jpg'

const IMAGE_2 =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789041224/WhatsApp_Image_2026-09-10_at_11.18.11_AM_1.jpg'

const IMAGE_3 =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789041222/WhatsApp_Image_2026-09-10_at_11.18.10_AM_1.jpg'

const IMAGE_4 =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789041218/WhatsApp_Image_2026-09-10_at_11.18.07_AM_2.jpg'

/** Keep primary first; append new gallery images only. */
const IMAGES: string[] = [IMAGE, IMAGE_2, IMAGE_3, IMAGE_4]

async function main() {
  await prisma.collection.upsert({
    where: { slug: 'lehanga' },
    create: {
      slug: 'lehanga',
      name: 'LEHANGA',
      description: 'FESTIVE EDITION · Explore the Lehanga collection.',
      image: IMAGE,
      active: true,
      featured: false,
    },
    update: {
      name: 'LEHANGA',
    },
  })

  const product = await prisma.product.upsert({
    where: { slug: 'lehanga-02' },
    create: {
      slug: 'lehanga-02',
      sku: 'SH-LEHANGA-02',
      name: 'LEHANGA',
      description: 'PLACEHOLDER — product details coming soon.',
      price: 0,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'LEHANGA',
      collections: ['lehanga'],
      fabric: 'PLACEHOLDER',
      weave: 'PLACEHOLDER',
      length: 'PLACEHOLDER',
      blouse: 'PLACEHOLDER',
      care: 'PLACEHOLDER',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      name: 'LEHANGA',
      image: IMAGE,
      images: IMAGES,
      category: 'LEHANGA',
      collections: ['lehanga'],
      isNew: true,
      active: true,
      // Do not invent missing details on re-run.
    },
  })

  console.log(`LEHANGA product #2 ready: ${product.id} (${product.slug})`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
