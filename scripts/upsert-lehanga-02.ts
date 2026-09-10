/**
 * Upserts LEHANGA product #2 details (same copy/price as product #1).
 * Idempotent — preserves this product's own gallery; does not modify product #1.
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

const IMAGES: string[] = [IMAGE, IMAGE_2, IMAGE_3, IMAGE_4]

const DESCRIPTION = [
  'Launch New Exclusive Designer premium Quality pure Kanjiveram silk full stitched Lehenga with Full stitched Designer maggam work blouse with embroidered work Dupatta.',
  '',
  'Product Details:',
  '✦ Lehenga: Full stitched Kanjiveram silk with big Jacquard Border attached with canvas patta',
  '✦ Length: 42"',
  '✦ Flair: 4 mtr',
  '',
  '✦ Blouse: Full stitched Rangoli with heavy designer work on back and front with designer work sleeve',
  '✦ Size: Free size',
  '',
  '✦ Dupatta: Premium Quality Rangoli silk with beautiful embroidery cutwork border',
].join('\n')

const DETAILS = {
  name: 'LEHANGA',
  description: DESCRIPTION,
  price: 2690,
  fabric: 'Pure Kanjiveram Silk',
  weave: 'Lehenga Set · Jacquard Border · Maggam Work Blouse',
  length: '42" · 4 mtr flair with canvas patta',
  blouse: 'Full stitched Rangoli · Free size · Designer work sleeves',
  care: 'Package: Lehenga, Blouse, Dupatta',
  category: 'LEHANGA',
  collections: ['lehanga'] as string[],
  availability: ProductAvailability.IN_STOCK,
  isNew: true,
  active: true,
}

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
      ...DETAILS,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      stock: 10,
      featured: false,
    },
    update: {
      ...DETAILS,
      image: IMAGE,
      images: IMAGES,
    },
  })

  console.log(`LEHANGA product #2 details ready: ${product.id} (${product.slug}) ₹${product.price}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
