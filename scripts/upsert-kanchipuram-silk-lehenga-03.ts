/**
 * Upserts NEW KANCHIPURAM SILK LEHENGA catalog #3 under Lehenga Collection.
 * Idempotent — does not modify existing kanchipuram catalogs, CHHABILI, or JOBANIYU.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789113684/WhatsApp_Image_2026-09-10_at_11.26.32_AM.jpg'

const IMAGE_2 =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789113670/WhatsApp_Image_2026-09-10_at_11.26.26_AM.jpg'

const IMAGE_3 =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789113671/WhatsApp_Image_2026-09-10_at_11.26.27_AM.jpg'

const IMAGES: string[] = [IMAGE, IMAGE_2, IMAGE_3]

const DESCRIPTION = [
  'Crafted with love, adorned with heritage : The South-style Kanchipuram silk lehenga is more than just attire; it\'s a piece of art that encapsulates the essence of South Indian culture 🪸',
  '',
  'Lehenga (Stitched)',
  '✦ Lehenga Fabric: Kanchipuram',
  '✦ Lehenga Work: Zari Weaving Work',
  '✦ Lehenga Waist: SUPPORTED UP TO 42',
  '✦ Lehenga Closer: Drawstring With Zip',
  '✦ Stitching: Stitch With Canvas',
  '✦ Length: 41',
  '✦ Flair: 3.70 Meter',
  '✦ Inner: Micro Cotton',
  '',
  'Blouse (Unstitched)',
  '✦ Blouse Fabric: Kanchipuram',
  '✦ Blouse Work: Zari Weaving Work',
  '✦ Blouse Length: 0.80 Meter',
  '',
  'Dupatta',
  '✦ Dupatta Fabric: Georgette',
  '✦ Dupatta Work: Plain With Lase Border',
  '✦ Dupatta Length: 2.5 Meter',
  '',
  'Package Contains:',
  '✧ Lehenga',
  '✧ Blouse',
  '✧ Dupatta',
  '✧ Drawstring',
  '',
  'Weight:',
  '◇ 1 kg',
  '',
  'Rate:',
  '❖ ₹1,950',
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
    where: { slug: 'kanchipuram-silk-lehenga-03' },
    create: {
      slug: 'kanchipuram-silk-lehenga-03',
      sku: 'SH-KANCHIPURAM-SILK-LEHENGA-03',
      name: 'KANCHIPURAM SILK LEHENGA',
      description: DESCRIPTION,
      price: 1950,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'Lehenga Collection',
      collections: ['lehanga', 'navratri-collection'],
      fabric: 'Kanchipuram',
      weave: 'Zari Weaving Work',
      length: '41" · 3.70 meter flair · stitch with canvas',
      blouse: 'Unstitched · 0.80 Meter · Zari Weaving Work',
      care: 'Package: Lehenga, Blouse, Dupatta, Drawstring · Weight: 1 kg',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      name: 'KANCHIPURAM SILK LEHENGA',
      description: DESCRIPTION,
      price: 1950,
      image: IMAGE,
      images: IMAGES,
      category: 'Lehenga Collection',
      collections: ['lehanga', 'navratri-collection'],
      fabric: 'Kanchipuram',
      weave: 'Zari Weaving Work',
      length: '41" · 3.70 meter flair · stitch with canvas',
      blouse: 'Unstitched · 0.80 Meter · Zari Weaving Work',
      care: 'Package: Lehenga, Blouse, Dupatta, Drawstring · Weight: 1 kg',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(
    `KANCHIPURAM SILK LEHENGA #3 ready: ${product.id} (${product.slug}) ₹${product.price}`,
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
