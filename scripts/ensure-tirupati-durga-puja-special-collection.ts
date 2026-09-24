/**
 * Idempotent upsert for 🍁Tirupati Durga Puja Special 🍁 (Navratri nested) metadata.
 * Parent remains existing `navratri-collection` — does not create a second NAVRATRI.
 * Does not create/modify products or other categories.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SLUG = 'tirupati-durga-puja-special'
const NAME = '🍁Tirupati Durga Puja Special 🍁'
const DESCRIPTION =
  'NAVRATRI COLLECTION · Explore the Tirupati Durga Puja Special collection.'

async function main() {
  const parent = await prisma.collection.upsert({
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

  const existing = await prisma.collection.findUnique({ where: { slug: SLUG } })
  const collection = await prisma.collection.upsert({
    where: { slug: SLUG },
    create: {
      slug: SLUG,
      name: NAME,
      description: DESCRIPTION,
      image: '/images/collection-silk.png',
      active: true,
      featured: false,
    },
    update: {
      name: NAME,
      description: DESCRIPTION,
      active: true,
    },
  })

  console.log(`Parent NAVRATRI: ${parent.id} (${parent.slug})`)
  console.log(
    `Tirupati Durga Puja Special ${existing ? 'updated' : 'created'}: ${collection.id} (${collection.slug})`,
  )
  console.log(
    'Nav hierarchy (code): NAVRATRI → 🍁Tirupati Durga Puja Special 🍁 via parentSlug=navratri-collection',
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
