/**
 * Upserts DHARVI Karvachauth Special DULHAN as a separate product under the
 * existing `Dharvi Karva Chauth Saree` category (same listing as the Pink saree).
 * Does not create a separate Dulhan category. Does not modify Pink product data
 * beyond stripping any accidental red image URLs.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

/** Former Red-variant gallery (moved off Pink product) — exact prior order. */
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

const PRODUCT_SLUG = 'dharvi-karvachauth-special-dulhan'
const PRODUCT_NAME = 'DHARVI Karvachauth Special 🎉 DULHAN❤️'
/** Shared category with the Pink Karva product — not a separate Dulhan category. */
const CATEGORY_NAME = 'Dharvi Karva Chauth Saree'
const CATEGORY_SLUG = 'dharvi-karva-chauth-saree'
const ORPHAN_CATEGORY_SLUG = 'dharvi-karvachauth-special-dulhan'
const KARVA_SLUG = 'dharvi-karva-chauth-saree'

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
    where: { slug: CATEGORY_SLUG },
    create: {
      slug: CATEGORY_SLUG,
      name: CATEGORY_NAME,
      description: 'NAVRATRI COLLECTION · Explore the Dharvi Karva Chauth Saree collection.',
      image:
        'https://res.cloudinary.com/tcjtyr02/image/upload/v1790246484/file_00000000948c824391f9226eeb656d5b.png',
      active: true,
      featured: false,
    },
    update: {
      name: CATEGORY_NAME,
      active: true,
    },
  })

  // Remove incorrectly created separate Dulhan category (product name ≠ category).
  const orphan = await prisma.collection.findUnique({
    where: { slug: ORPHAN_CATEGORY_SLUG },
  })
  if (orphan) {
    await prisma.collection.delete({ where: { slug: ORPHAN_CATEGORY_SLUG } })
    console.log(`Deleted orphan Dulhan category collection: ${ORPHAN_CATEGORY_SLUG}`)
  }

  // Guard Pink gallery — strip red URLs if present; do not rewrite other fields.
  const karva = await prisma.product.findUnique({ where: { slug: KARVA_SLUG } })
  if (karva) {
    const redSet = new Set<string>(RED_IMAGES)
    const cleaned = (karva.images ?? []).filter((url) => !redSet.has(url))
    if (cleaned.length !== (karva.images?.length ?? 0) || (karva.image && redSet.has(karva.image))) {
      const pinkImages =
        cleaned.length > 0
          ? cleaned
          : [
              'https://res.cloudinary.com/tcjtyr02/image/upload/v1790246484/file_00000000948c824391f9226eeb656d5b.png',
              'https://res.cloudinary.com/tcjtyr02/image/upload/v1790246486/IMG-20260924-WA0238.jpg',
              'https://res.cloudinary.com/tcjtyr02/image/upload/v1790246486/IMG-20260924-WA0244.jpg',
              'https://res.cloudinary.com/tcjtyr02/image/upload/v1790246485/IMG-20260924-WA0239.jpg',
              'https://res.cloudinary.com/tcjtyr02/image/upload/v1790246485/IMG-20260924-WA0243_1.jpg',
            ]
      const primary =
        karva.image && !redSet.has(karva.image) ? karva.image : pinkImages[0]
      await prisma.product.update({
        where: { slug: KARVA_SLUG },
        data: { image: primary, images: pinkImages },
      })
      console.log(`Karva pink gallery cleaned (${pinkImages.length} images)`)
    } else {
      console.log(`Karva pink gallery already clean (${karva.images?.length ?? 0} images)`)
    }
  }

  const existing = await prisma.product.findUnique({ where: { slug: PRODUCT_SLUG } })
  const product = await prisma.product.upsert({
    where: { slug: PRODUCT_SLUG },
    create: {
      slug: PRODUCT_SLUG,
      sku: 'SH-DHARVI-DULHAN-01',
      name: PRODUCT_NAME,
      description: DESCRIPTION,
      price: 2450,
      originalPrice: null,
      image: RED_IMAGES[0],
      images: [...RED_IMAGES],
      category: CATEGORY_NAME,
      collections: [CATEGORY_SLUG, 'navratri-collection'],
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
      collections: [CATEGORY_SLUG, 'navratri-collection'],
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
    `Dulhan product ${existing ? 'updated' : 'created'}: ${product.id}`,
  )
  console.log(`  slug: ${product.slug}`)
  console.log(`  name: ${product.name}`)
  console.log(`  category: ${product.category}`)
  console.log(`  collections: ${product.collections.join(', ')}`)
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
