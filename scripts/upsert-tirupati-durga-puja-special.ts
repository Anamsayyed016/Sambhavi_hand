/**
 * Upserts Tirupati Durga Puja Special under existing Navratri child category
 * `tirupati-durga-puja-special`. Idempotent — does not modify other products/categories.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1790243072/file_00000000436c821197f216240f4cd1d4.png'

const EXTRA_IMAGES = [
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1790243073/IMG-20260924-WA0137.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1790243074/IMG-20260924-WA0131.jpg',
] as const

/** Primary first, then extras — no duplicates. */
function buildGallery(existing: string[] | undefined): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const url of [IMAGE, ...(existing ?? []), ...EXTRA_IMAGES]) {
    if (!url || seen.has(url)) continue
    seen.add(url)
    out.push(url)
  }
  // Ensure primary stays first even if existing had a different order.
  const withoutPrimary = out.filter((url) => url !== IMAGE)
  return [IMAGE, ...withoutPrimary]
}

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

const SLUG = 'tirupati-durga-puja-special'
const CATEGORY_NAME = '🍁Tirupati Durga Puja Special 🍁'
const PRODUCT_NAME = 'Tirupati Durga Puja Special 🍁'

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
      description: 'NAVRATRI COLLECTION · Explore the Tirupati Durga Puja Special collection.',
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
  const images = buildGallery(existing?.images)

  // Gallery-only update path when product already exists — preserve other fields.
  if (existing) {
    const product = await prisma.product.update({
      where: { slug: SLUG },
      data: {
        image: existing.image || IMAGE,
        images,
      },
    })
    console.log(`Tirupati Durga Puja Special gallery updated: ${product.id}`)
    console.log(`  primary: ${product.image}`)
    console.log(`  gallery (${product.images.length}):`)
    for (const url of product.images) console.log(`    - ${url}`)
    return
  }

  const product = await prisma.product.create({
    data: {
      slug: SLUG,
      sku: 'SH-TIRUPATI-DURGA-01',
      name: PRODUCT_NAME,
      description: DESCRIPTION,
      price: 1560,
      originalPrice: null,
      image: IMAGE,
      images,
      category: CATEGORY_NAME,
      collections: [SLUG, 'navratri-collection'],
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
  })

  console.log(`Tirupati Durga Puja Special created: ${product.id}`)
  console.log(`  slug: ${product.slug}`)
  console.log(`  category: ${product.category}`)
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
