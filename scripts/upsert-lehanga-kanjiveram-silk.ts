/**
 * Upserts the LEHANGA Kanjiveram silk product + collection metadata.
 * Idempotent — safe to re-run. Does not delete or reset unrelated catalog data.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789041228/WhatsApp_Image_2026-09-10_at_11.18.13_AM_1.jpg'

const IMAGE_2 =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789041229/WhatsApp_Image_2026-09-10_at_11.18.13_AM.jpg'

const IMAGE_3 =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789041224/WhatsApp_Image_2026-09-10_at_11.18.10_AM.jpg'

const VIDEO =
  'https://res.cloudinary.com/tcjtyr02/video/upload/v1789041231/WhatsApp_Video_2026-09-10_at_11.18.06_AM.mp4'

/** Keep primary first; append gallery images then video. */
const IMAGES: string[] = [IMAGE, IMAGE_2, IMAGE_3, VIDEO]

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
      category: 'Lehenga Collection',
      collections: ['lehanga', 'navratri-collection'],
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
      category: 'Lehenga Collection',
      collections: ['lehanga', 'navratri-collection'],
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

  console.log(`Lehenga Collection product ready: ${product.id} (${product.slug})`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
