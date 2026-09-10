/**
 * Idempotent upsert for the LEHANGA collection metadata.
 * Safe to run on deploy — does not delete or reset existing product data.
 * Does not create products; only ensures the collection record exists.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const collection = await prisma.collection.upsert({
    where: { slug: 'lehanga' },
    create: {
      slug: 'lehanga',
      name: 'LEHANGA',
      description: 'FESTIVE EDITION · Explore the Lehanga collection.',
      image: '/images/collection-silk.png',
      active: true,
      featured: false,
    },
    update: {
      name: 'LEHANGA',
      // Keep admin-managed description/image/active on re-run.
    },
  })

  console.log(`LEHANGA collection ready: ${collection.id} (${collection.slug})`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
