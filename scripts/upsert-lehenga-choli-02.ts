/**
 * Upserts LEHENGA CHOLI Catalog #2 only.
 * Idempotent — does not modify lehenga-choli (catalog #1), Lehenga Collection, CHHABILI, or JOBANIYU.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789125861/WhatsApp_Image_2026-09-10_at_11.27.57_AM.jpg'

/** Own primary image only — do not share gallery frames with catalog #1. */
const IMAGES: string[] = [IMAGE]

const DESCRIPTION = [
  'Printed perfection for every occasion 🖤',
  '',
  'Lehenga (Stitched)',
  '✦ Lehenga Fabric: Dola Silk',
  '✦ Lehenga Work: Kalmkaei Print',
  '✦ Lehenga Waist: Supported Up To 42',
  '✦ Lehenga Closer: Drawstring With Zip',
  '✦ Stitching: Stitched With Canvas',
  '✦ Length: 41',
  '✦ Flair: 3.5 Meter',
  '✦ Inner: Micro Cotton',
  '',
  'Blouse (Unstitched)',
  '✧ Blouse Fabric: Vichitra Silk',
  '✧ Work: Embroidery Thread Work',
  '',
  'Dupatta',
  '◇ Dupatta Fabric: Vichitra Silk',
  '◇ Dupatta Work: Embroidery Thread Work With 4 Sard Lace Work',
  '◇ Dupatta Length: 2.5 Meter',
  '',
  'Package Contains:',
  '❖ Lehenga',
  '❖ Blouse',
  '❖ Dupatta',
  '❖ Drawstring With Zip',
  '',
  'Weight:',
  '❖ 1 Kg',
  '',
  'RATE:',
  '₹1,999',
].join('\n')

async function main() {
  await prisma.collection.upsert({
    where: { slug: 'lehenga-choli' },
    create: {
      slug: 'lehenga-choli',
      name: 'LEHENGA CHOLI',
      description: 'FESTIVE EDITION · Explore the LEHENGA CHOLI collection.',
      image: IMAGE,
      active: true,
      featured: false,
    },
    update: {
      name: 'LEHENGA CHOLI',
      active: true,
    },
  })

  const product = await prisma.product.upsert({
    where: { slug: 'lehenga-choli-02' },
    create: {
      slug: 'lehenga-choli-02',
      sku: 'SH-LEHENGA-CHOLI-02',
      name: 'Lehenga Choli🌷',
      description: DESCRIPTION,
      price: 1999,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'LEHENGA CHOLI',
      collections: ['lehenga-choli'],
      fabric: 'Dola Silk',
      weave: 'Kalmkaei Print · Embroidery Thread Work',
      length: '41" · 3.5 meter flair · stitched with canvas',
      blouse: 'Unstitched · Vichitra Silk · Embroidery Thread Work',
      care: 'Package: Lehenga, Blouse, Dupatta, Drawstring With Zip · Weight: 1 Kg',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      sku: 'SH-LEHENGA-CHOLI-02',
      name: 'Lehenga Choli🌷',
      description: DESCRIPTION,
      price: 1999,
      image: IMAGE,
      images: IMAGES,
      category: 'LEHENGA CHOLI',
      collections: ['lehenga-choli'],
      fabric: 'Dola Silk',
      weave: 'Kalmkaei Print · Embroidery Thread Work',
      length: '41" · 3.5 meter flair · stitched with canvas',
      blouse: 'Unstitched · Vichitra Silk · Embroidery Thread Work',
      care: 'Package: Lehenga, Blouse, Dupatta, Drawstring With Zip · Weight: 1 Kg',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(`LEHENGA CHOLI catalog #2 ready: ${product.id}`)
  console.log(`  slug: ${product.slug}`)
  console.log(`  price: ₹${product.price}`)
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
