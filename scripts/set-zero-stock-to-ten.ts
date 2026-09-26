/**
 * One-time correction: Product.stock 0 → 10.
 * Does not touch availability or any other fields.
 * Does not modify rows where stock !== 0.
 *
 * Usage: pnpm exec tsx scripts/set-zero-stock-to-ten.ts
 */
import { prisma } from '../lib/prisma'

async function main() {
  const zeroBefore = await prisma.product.count({ where: { stock: 0 } })
  const tenBefore = await prisma.product.count({ where: { stock: 10 } })
  const nonZeroBefore = await prisma.product.count({ where: { stock: { not: 0 } } })

  console.log(`Before: stock=0 → ${zeroBefore}`)
  console.log(`Before: stock=10 → ${tenBefore}`)
  console.log(`Before: stock≠0 → ${nonZeroBefore}`)

  if (zeroBefore === 0) {
    console.log('Nothing to update.')
    return
  }

  const result = await prisma.product.updateMany({
    where: { stock: 0 },
    data: { stock: 10 },
  })

  const zeroAfter = await prisma.product.count({ where: { stock: 0 } })
  const tenAfter = await prisma.product.count({ where: { stock: 10 } })
  const nonZeroAfter = await prisma.product.count({ where: { stock: { not: 0 } } })

  console.log(`Updated: ${result.count} product(s) stock 0 → 10`)
  console.log(`After: stock=0 → ${zeroAfter}`)
  console.log(`After: stock=10 → ${tenAfter}`)
  console.log(`After: stock≠0 → ${nonZeroAfter}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
