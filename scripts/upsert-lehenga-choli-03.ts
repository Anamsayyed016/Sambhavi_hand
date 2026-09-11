/**
 * Soft-removes the mistaken LEHENGA CHOLI catalog #03.
 * That image now belongs on lehenga-choli-02 (green).
 * Idempotent — does not modify other LEHENGA CHOLI / Lehenga Collection / CHHABILI / JOBANIYU catalogs.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.product.findUnique({
    where: { slug: 'lehenga-choli-03' },
    select: { id: true, slug: true, active: true },
  })

  if (!existing) {
    console.log('lehenga-choli-03 not in DB — nothing to deactivate')
    return
  }

  const product = await prisma.product.update({
    where: { slug: 'lehenga-choli-03' },
    data: {
      active: false,
      images: [],
      image: '',
    },
  })

  console.log(`Deactivated mistaken catalog: ${product.slug} (${product.id})`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
