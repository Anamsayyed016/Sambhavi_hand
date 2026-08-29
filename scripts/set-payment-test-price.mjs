/**
 * Update ONLY Soft Silk Digital Print Saree (digital-print-saree-01) to ₹1.
 * Does not create products, change images/names/categories, or touch other rows.
 *
 *   pnpm exec tsx scripts/set-payment-test-price.mjs
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGET_SLUG = 'digital-print-saree-01'
const TARGET_NAME = 'Soft Silk Digital Print Saree'
const TARGET_CATEGORY = 'Digital Print'
const TARGET_PRICE = 1

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

  if (!before) {
    throw new Error(`Product not found: ${TARGET_SLUG}`)
  }

  if (before.name !== TARGET_NAME) {
    throw new Error(`Refusing update: unexpected name "${before.name}"`)
  }

  if (before.category !== TARGET_CATEGORY) {
    throw new Error(`Refusing update: unexpected category "${before.category}"`)
  }

  const result = await prisma.product.updateMany({
    where: {
      slug: TARGET_SLUG,
      name: TARGET_NAME,
      category: TARGET_CATEGORY,
    },
    data: { price: TARGET_PRICE },
  })

  const after = await prisma.product.findUnique({
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

  console.log(
    JSON.stringify(
      {
        updated: result.count,
        idUnchanged: before.id === after?.id,
        imageUnchanged: before.image === after?.image,
        before: { price: before.price, category: before.category, name: before.name },
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
