/**
 * Sets Soft Silk Digital Print Saree (digital-print-saree-01) price to ₹1.
 * Does not touch any other product. Safe to re-run.
 *
 * Usage (on the server with a working DATABASE_URL):
 *   pnpm exec tsx scripts/set-payment-test-price.mjs
 *
 * Or sync the full catalog from lib/products.ts:
 *   pnpm db:seed
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.product.updateMany({
    where: { slug: 'digital-print-saree-01' },
    data: { price: 1 },
  })
  const product = await prisma.product.findUnique({
    where: { slug: 'digital-print-saree-01' },
    select: { slug: true, name: true, price: true, category: true },
  })
  console.log(JSON.stringify({ updated: result.count, product }, null, 2))
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
