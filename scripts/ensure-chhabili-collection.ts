/**
 * Idempotent upsert for the CHHABILI Navratri sub-collection metadata.
 * Safe to run on deploy — does not delete or reset existing product data.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const collection = await prisma.collection.upsert({
    where: { slug: 'chhabili' },
    create: {
      slug: 'chhabili',
      name: 'CHHABILI',
      description: 'FESTIVE EDITION · Explore the Chhabili collection.',
      image: '/images/collection-silk.png',
      active: true,
      featured: false,
    },
    update: {
      name: 'CHHABILI',
      // Keep admin-managed description/image/active on re-run.
    },
  })

  console.log(`CHHABILI collection ready: ${collection.id} (${collection.slug})`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
