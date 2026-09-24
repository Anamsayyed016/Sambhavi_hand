/**
 * Idempotent upsert for DHARVI Karvachauth Special DULHAN (Navratri nested) metadata.
 * Parent remains existing `navratri-collection` — does not create a second NAVRATRI.
 * Does not create/modify products or other Dharvi categories.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SLUG = 'dharvi-karvachauth-special-dulhan'
const NAME = 'DHARVI Karvachauth Special 🎉 DULHAN❤️'
const DESCRIPTION =
  'NAVRATRI COLLECTION · Explore the DHARVI Karvachauth Special DULHAN collection.'

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
      // Keep admin-managed fields; ensure name is stable.
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
    `DHARVI Karvachauth Special DULHAN ${existing ? 'updated' : 'created'}: ${collection.id} (${collection.slug})`,
  )
  console.log(
    'Nav hierarchy (code): NAVRATRI → DHARVI Karvachauth Special DULHAN via parentSlug=navratri-collection',
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
