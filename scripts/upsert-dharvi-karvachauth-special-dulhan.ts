/**
 * Upserts DHARVI Karvachauth Special DULHAN under existing Navratri child category
 * `dharvi-karvachauth-special-dulhan`. Idempotent — does not modify other products/categories.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1790243072/file_00000000436c821197f216240f4cd1d4.png'

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
      image: IMAGE,
      active: true,
      featured: false,
    },
    update: {
      name: CATEGORY_NAME,
      active: true,
    },
  })

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
      image: IMAGE,
      images: [IMAGE],
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
      image: IMAGE,
      images: [IMAGE],
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
  console.log(`  collections: ${product.collections.join(', ')}`)
  console.log(`  price: ₹${product.price.toLocaleString('en-IN')}`)
  console.log(`  primary: ${product.image}`)
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
