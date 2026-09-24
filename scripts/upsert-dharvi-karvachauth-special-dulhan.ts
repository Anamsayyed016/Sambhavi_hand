/**
 * Upserts DHARVI Karvachauth Special DULHAN as a separate Navratri product.
 * Gallery = former Red-variant images moved off Dharvi Karva Chauth saree.
 * Does not modify the Pink Karva product or other categories.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

/** Exact former DHARVI_KARVA_RED_GALLERY order from product-detail.tsx. */
const RED_IMAGES = [
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1790246486/IMG-20260924-WA0253.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1790246490/IMG-20260924-WA0254.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1790246489/IMG-20260924-WA0257.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1790246488/IMG-20260924-WA0255.jpg',
] as const

const DESCRIPTION = [
  'Soft Space Silk Saree With Heavy Embroider Sequins Jari,Thread Work With Scallop Border And All Over Peacock Butties❤️🔥',
  '',
  'Soft Space Silk Blouse With Front Back And Sleeves Work Done Of Embroidery With Sequins,Jari And Thread Work Designer Latkan Attached On Blouse For Premium Look 🥰',
  '',
  'Saree With Stitch Blouse ~ 2450 rs✔️',
].join('\n')

const SLUG = 'dharvi-karvachauth-special-dulhan'
const CATEGORY_NAME = 'DHARVI Karvachauth Special 🎉 DULHAN❤️'
const PRODUCT_NAME = 'DHARVI Karvachauth Special 🎉 DULHAN❤️'
const KARVA_SLUG = 'dharvi-karva-chauth-saree'
const PINK_IMAGES = [
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1790246484/file_00000000948c824391f9226eeb656d5b.png',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1790246486/IMG-20260924-WA0238.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1790246486/IMG-20260924-WA0244.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1790246485/IMG-20260924-WA0239.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1790246485/IMG-20260924-WA0243_1.jpg',
] as const

async function main() {
  await prisma.collection.upsert({
    where: { slug: 'navratri-collection' },
    create: {
      slug: 'navratri-collection',
      name: 'Navratri Collection',
      description: 'FESTIVE EDITION · Browse Navratri Collection sarees.',
      image: '/images/collection-silk.png',
      active: true,
      featured: false,
    },
    update: {
      name: 'Navratri Collection',
    },
  })

  await prisma.collection.upsert({
    where: { slug: SLUG },
    create: {
      slug: SLUG,
      name: CATEGORY_NAME,
      description:
        'NAVRATRI COLLECTION · Explore the DHARVI Karvachauth Special DULHAN collection.',
      image: RED_IMAGES[0],
      active: true,
      featured: false,
    },
    update: {
      name: CATEGORY_NAME,
      active: true,
      image: RED_IMAGES[0],
    },
  })

  // Ensure Pink Karva gallery stays pink-only (strip any accidental red URLs).
  const karva = await prisma.product.findUnique({ where: { slug: KARVA_SLUG } })
  if (karva) {
    const redSet = new Set<string>(RED_IMAGES)
    const cleaned = (karva.images ?? []).filter((url) => !redSet.has(url))
    const pinkImages =
      cleaned.length > 0 ? cleaned : [...PINK_IMAGES]
    const primary =
      karva.image && !redSet.has(karva.image) ? karva.image : pinkImages[0]
    await prisma.product.update({
      where: { slug: KARVA_SLUG },
      data: {
        image: primary,
        images: pinkImages,
      },
    })
    console.log(`Karva pink gallery preserved (${pinkImages.length} images), red URLs stripped if any`)
  } else {
    console.log('Karva product not found in DB — skipped pink gallery guard')
  }

  const existing = await prisma.product.findUnique({ where: { slug: SLUG } })
  const product = await prisma.product.upsert({
    where: { slug: SLUG },
    create: {
      slug: SLUG,
      sku: 'SH-DHARVI-DULHAN-01',
      name: PRODUCT_NAME,
      description: DESCRIPTION,
      price: 2450,
      originalPrice: null,
      image: RED_IMAGES[0],
      images: [...RED_IMAGES],
      category: CATEGORY_NAME,
      collections: [SLUG, 'navratri-collection'],
      fabric:
        'Soft Space Silk Saree With Heavy Embroider Sequins Jari,Thread Work With Scallop Border And All Over Peacock Butties❤️🔥',
      weave: '',
      length: '',
      blouse:
        'Soft Space Silk Blouse With Front Back And Sleeves Work Done Of Embroidery With Sequins,Jari And Thread Work Designer Latkan Attached On Blouse For Premium Look 🥰',
      care: 'Saree With Stitch Blouse',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      name: PRODUCT_NAME,
      description: DESCRIPTION,
      price: 2450,
      originalPrice: null,
      image: RED_IMAGES[0],
      images: [...RED_IMAGES],
      category: CATEGORY_NAME,
      collections: [SLUG, 'navratri-collection'],
      fabric:
        'Soft Space Silk Saree With Heavy Embroider Sequins Jari,Thread Work With Scallop Border And All Over Peacock Butties❤️🔥',
      weave: '',
      length: '',
      blouse:
        'Soft Space Silk Blouse With Front Back And Sleeves Work Done Of Embroidery With Sequins,Jari And Thread Work Designer Latkan Attached On Blouse For Premium Look 🥰',
      care: 'Saree With Stitch Blouse',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(
    `DHARVI Karvachauth Special DULHAN ${existing ? 'updated' : 'created'}: ${product.id}`,
  )
  console.log(`  slug: ${product.slug}`)
  console.log(`  category: ${product.category}`)
  console.log(`  price: ₹${product.price.toLocaleString('en-IN')}`)
  console.log(`  gallery (${product.images.length}):`)
  for (const url of product.images) console.log(`    - ${url}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
