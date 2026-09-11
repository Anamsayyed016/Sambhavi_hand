/**
 * Upserts LEHENGA CHOLI collection + its first product catalog.
 * Idempotent — does not modify Lehenga Collection, CHHABILI, JOBANIYU, or other products.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789125875/WhatsApp_Image_2026-09-10_at_11.28.00_AM_1.jpg'

/** Single provided image only — do not invent gallery frames. */
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
    where: { slug: 'lehenga-choli' },
    create: {
      slug: 'lehenga-choli',
      sku: 'SH-LEHENGA-CHOLI-01',
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
      sku: 'SH-LEHENGA-CHOLI-01',
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

  console.log(`LEHENGA CHOLI product ready: ${product.id}`)
  console.log(`  slug: ${product.slug}`)
  console.log(`  price: ₹${product.price}`)
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
