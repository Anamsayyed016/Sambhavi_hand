/**
 * Upserts Tirupati Durga Puja Special #02 — separate design under the same
 * `tirupati-durga-puja-special` category. Does NOT modify product #01 gallery/data.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1790243072/file_00000000d8c481f69a717618a6f609aa.png'

const DESCRIPTION = [
  'Saree Fabric - Plain Linen',
  '',
  'Work - Digital Print',
  '',
  'Saree Length - 6.30 Meter (With Digital Blouse)',
  '',
  'Blouse Fabric - Plain Linen with Digital Print',
  '',
  'Rate - ₹1,560',
].join('\n')

const SLUG = 'tirupati-durga-puja-special-02'
const CATEGORY_SLUG = 'tirupati-durga-puja-special'
const CATEGORY_NAME = '🍁Tirupati Durga Puja Special 🍁'
const PRODUCT_NAME = 'Tirupati Durga Puja Special 🍁'
const ORIGINAL_SLUG = 'tirupati-durga-puja-special'

async function main() {
  const original = await prisma.product.findUnique({
    where: { slug: ORIGINAL_SLUG },
    select: { id: true, slug: true, image: true, images: true, price: true },
  })
  console.log('Original product (untouched):', original)

  if (original?.images?.includes(IMAGE) || original?.image === IMAGE) {
    throw new Error(
      'Abort: new image already present on original Tirupati product — refusing to proceed',
    )
  }

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
      description: 'NAVRATRI COLLECTION · Explore the Tirupati Durga Puja Special collection.',
      image: '/images/collection-silk.png',
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
      sku: 'SH-TIRUPATI-DURGA-02',
      name: PRODUCT_NAME,
      description: DESCRIPTION,
      price: 1560,
      originalPrice: null,
      image: IMAGE,
      images: [IMAGE],
      category: CATEGORY_NAME,
      collections: [CATEGORY_SLUG, 'navratri-collection'],
      fabric: 'Plain Linen',
      weave: 'Digital Print',
      length: '6.30 Meter (With Digital Blouse)',
      blouse: 'Plain Linen with Digital Print',
      care: '',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      name: PRODUCT_NAME,
      description: DESCRIPTION,
      price: 1560,
      originalPrice: null,
      image: IMAGE,
      images: [IMAGE],
      category: CATEGORY_NAME,
      collections: [CATEGORY_SLUG, 'navratri-collection'],
      fabric: 'Plain Linen',
      weave: 'Digital Print',
      length: '6.30 Meter (With Digital Blouse)',
      blouse: 'Plain Linen with Digital Print',
      care: '',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  const originalAfter = await prisma.product.findUnique({
    where: { slug: ORIGINAL_SLUG },
    select: { images: true, image: true, price: true },
  })

  console.log(
    `Tirupati Durga Puja Special #02 ${existing ? 'updated' : 'created'}: ${product.id}`,
  )
  console.log(`  slug: ${product.slug}`)
  console.log(`  category: ${product.category}`)
  console.log(`  price: ₹${product.price.toLocaleString('en-IN')}`)
  console.log(`  primary: ${product.image}`)
  console.log('Original still:', originalAfter)
  if (originalAfter?.images?.includes(IMAGE)) {
    throw new Error('Original gallery was polluted with new image')
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
