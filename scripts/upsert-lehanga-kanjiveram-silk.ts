/**
 * Upserts the LEHANGA Kanjiveram silk product + collection metadata.
 * Idempotent — safe to re-run. Does not delete or reset unrelated catalog data.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789041228/WhatsApp_Image_2026-09-10_at_11.18.13_AM_1.jpg'

const IMAGES: string[] = [IMAGE]

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
    where: { slug: 'lehanga-kanjiveram-silk' },
    create: {
      slug: 'lehanga-kanjiveram-silk',
      sku: 'SH-LEHANGA-KANJIVERAM-SILK',
      name: 'LEHANGA',
      description: DESCRIPTION,
      price: 2690,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'LEHANGA',
      collections: ['lehanga'],
      fabric: 'Pure Kanjiveram Silk',
      weave: 'Lehenga Set · Jacquard Border · Maggam Work Blouse',
      length: '42" · 4 mtr flair with canvas patta',
      blouse: 'Full stitched Rangoli · Free size · Designer work sleeves',
      care: 'Package: Lehenga, Blouse, Dupatta',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      name: 'LEHANGA',
      description: DESCRIPTION,
      price: 2690,
      image: IMAGE,
      images: IMAGES,
      category: 'LEHANGA',
      collections: ['lehanga'],
      fabric: 'Pure Kanjiveram Silk',
      weave: 'Lehenga Set · Jacquard Border · Maggam Work Blouse',
      length: '42" · 4 mtr flair with canvas patta',
      blouse: 'Full stitched Rangoli · Free size · Designer work sleeves',
      care: 'Package: Lehenga, Blouse, Dupatta',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(`LEHANGA product ready: ${product.id} (${product.slug})`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
