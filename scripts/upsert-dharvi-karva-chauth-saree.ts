/**
 * Upserts Dharvi karva Chauth saree under existing Navratri child category
 * `dharvi-karva-chauth-saree`. Idempotent — does not modify other products/categories.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1790246484/file_00000000948c824391f9226eeb656d5b.png'

const DESCRIPTION = [
  '🥰 New Exclusive Design Launch For Karva Chauth Pooja',
  '',
  '▶️ Catalogue: Karva Chauth',
  '',
  '▶️ Fabric: Soft Shinon Fabric With Beautiful Karva Chauth Pooja Pallu Concept Print And Contrast Arco Cutwork Bordar With Contrast Blouse 👚',
  '',
  '▶️ Wow Price: ₹999/- Only',
].join('\n')

const SLUG = 'dharvi-karva-chauth-saree'
const CATEGORY_NAME = 'Dharvi Karva Chauth Saree'
const PRODUCT_NAME = 'Dharvi karva Chauth saree'

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
      description: 'NAVRATRI COLLECTION · Explore the Dharvi Karva Chauth Saree collection.',
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
      sku: 'SH-DHARVI-KARVA-01',
      name: PRODUCT_NAME,
      description: DESCRIPTION,
      price: 999,
      originalPrice: null,
      image: IMAGE,
      images: [IMAGE],
      category: CATEGORY_NAME,
      collections: [SLUG, 'navratri-collection'],
      fabric:
        'Soft Shinon Fabric With Beautiful Karva Chauth Pooja Pallu Concept Print And Contrast Arco Cutwork Bordar With Contrast Blouse 👚',
      weave: 'Karva Chauth',
      length: 'Catalogue: Karva Chauth',
      blouse: 'Contrast Blouse',
      care: 'Wow Price: ₹999/- Only',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      sku: 'SH-DHARVI-KARVA-01',
      name: PRODUCT_NAME,
      description: DESCRIPTION,
      price: 999,
      originalPrice: null,
      image: IMAGE,
      images: [IMAGE],
      category: CATEGORY_NAME,
      collections: [SLUG, 'navratri-collection'],
      fabric:
        'Soft Shinon Fabric With Beautiful Karva Chauth Pooja Pallu Concept Print And Contrast Arco Cutwork Bordar With Contrast Blouse 👚',
      weave: 'Karva Chauth',
      length: 'Catalogue: Karva Chauth',
      blouse: 'Contrast Blouse',
      care: 'Wow Price: ₹999/- Only',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(
    `Dharvi karva Chauth saree ${existing ? 'updated' : 'created'}: ${product.id}`,
  )
  console.log(`  slug: ${product.slug}`)
  console.log(`  category: ${product.category}`)
  console.log(`  collections: ${product.collections.join(', ')}`)
  console.log(`  price: ₹${product.price.toLocaleString('en-IN')}`)
  console.log(`  image: ${product.image}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
