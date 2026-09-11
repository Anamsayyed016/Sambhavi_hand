/**
 * Upserts JOBANIYU as its own Navratri child category (sibling of CHHABILI).
 * Idempotent — does not modify CHHABILI, LEHANGA, or other products.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789109341/WhatsApp_Image_2026-09-10_at_11.19.26_AM_1.jpg'

const IMAGES: string[] = [
  IMAGE,
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789109341/WhatsApp_Image_2026-09-10_at_11.19.26_AM.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789109341/WhatsApp_Image_2026-09-10_at_11.19.25_AM_1.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789109341/WhatsApp_Image_2026-09-10_at_11.19.25_AM.jpg',
  'https://res.cloudinary.com/tcjtyr02/video/upload/v1789109786/1.mp4',
]

const DESCRIPTION = [
  'From the looms of tradition to the rhythm of Garba — this Tassar silk lehenga with Gamthi print brings your Navratri dream to life in every swirl 🧿',
  '',
  'Lehenga (Stitched)',
  '✦ Lehenga Fabric: Tasar Silk',
  '✦ Lehenga Work: Gamthi Print With Embossed Design And Gotta Patti Lace Touch Up',
  '✦ Lehenga Waist: Support Up To 42',
  '✦ Lehenga Closer: Drawstring With Zip',
  '✦ Stitching: Stitched With Canvas And Full Inner',
  '✦ Length: 41',
  '✦ Flair: 3.80 Meter',
  '✦ Inner: Micro Crepe',
  '',
  'Blouse (Stitched)',
  '✦ Blouse Fabric: Tasar Silk',
  '✦ Blouse Work: Gamthi Print With Embossed Design And Gotta Patti Lace Touch Up',
  '✦ Blouse Size: 38” There is Extra Margin Customer Can Adjust up to 42',
  '✦ Blouse Length: 15',
  '✦ Sleeve Length: 11',
  '',
  'Dupatta',
  '✦ Dupatta Fabric: Tasar Silk',
  '✦ Dupatta Work: Gamthi Print With Gotta Patti Lace Touch Up',
  '✦ Dupatta Length: 2.40 Meter',
  '',
  'Package Contains:',
  '✧ Lehenga',
  '✧ Blouse',
  '✧ Dupatta',
  '✧ Drawstring with Zip',
  '',
  'Weight:',
  '◇ 1.100 kg',
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
    where: { slug: 'jobaniyu' },
    create: {
      slug: 'jobaniyu',
      name: 'JOBANIYU',
      description: 'NEW COLLECTION · Explore the Jobaniyu festive collection.',
      image: IMAGE,
      active: true,
      featured: false,
    },
    update: {
      name: 'JOBANIYU',
    },
  })

  const product = await prisma.product.upsert({
    where: { slug: 'jobaniyu' },
    create: {
      slug: 'jobaniyu',
      sku: 'SH-JOBANIYU',
      name: 'JOBANIYU (જોબનિયું)',
      description: DESCRIPTION,
      price: 2599,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'JOBANIYU',
      collections: ['jobaniyu', 'navratri-collection'],
      fabric: 'Tasar Silk',
      weave: 'Gamthi Print · Embossed Design · Gotta Patti Lace',
      length: '41" · 3.80 meter flair · stitched with canvas & full inner',
      blouse: '38" (adj. up to 42") · Length 15" · Sleeve Length 11"',
      care: 'Package: Lehenga, Blouse, Dupatta, Drawstring with Zip · Weight: 1.100 kg',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      name: 'JOBANIYU (જોબનિયું)',
      description: DESCRIPTION,
      price: 2599,
      image: IMAGE,
      images: IMAGES,
      category: 'JOBANIYU',
      collections: ['jobaniyu', 'navratri-collection'],
      fabric: 'Tasar Silk',
      weave: 'Gamthi Print · Embossed Design · Gotta Patti Lace',
      length: '41" · 3.80 meter flair · stitched with canvas & full inner',
      blouse: '38" (adj. up to 42") · Length 15" · Sleeve Length 11"',
      care: 'Package: Lehenga, Blouse, Dupatta, Drawstring with Zip · Weight: 1.100 kg',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(`JOBANIYU category ready: ${product.id} (${product.slug}) ₹${product.price}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
