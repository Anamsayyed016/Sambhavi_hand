/**
 * Update ONLY digital-print-saree-01:
 * name → Green Floral Soft Silk Digital Print Saree
 * price → 1
 * Same id/image/category. No other products touched.
 *
 *   pnpm exec tsx scripts/set-payment-test-price.mjs
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGET_SLUG = 'digital-print-saree-01'
const TARGET_CATEGORY = 'Digital Print'
const NEW_NAME = 'Green Floral Soft Silk Digital Print Saree'
const NEW_PRICE = 1

async function main() {
  const before = await prisma.product.findUnique({
    where: { slug: TARGET_SLUG },
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      category: true,
      image: true,
    },
  })

  if (!before) throw new Error(`Product not found: ${TARGET_SLUG}`)
  if (before.category !== TARGET_CATEGORY) {
    throw new Error(`Refusing update: unexpected category "${before.category}"`)
  }

  const after = await prisma.product.update({
    where: { id: before.id },
    data: { name: NEW_NAME, price: NEW_PRICE },
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      category: true,
      image: true,
    },
  })

  console.log(
    JSON.stringify(
      {
        updated: 1,
        idUnchanged: before.id === after.id,
        imageUnchanged: before.image === after.image,
        before,
        after,
      },
      null,
      2,
    ),
  )
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
