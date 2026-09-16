/**
 * Audit products that can break coupon/checkout pricing.
 * Run on VPS: node scripts/audit-checkout-products.js
 */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const total = await prisma.product.count()
  const active = await prisma.product.count({ where: { active: true } })
  const inactive = await prisma.product.findMany({
    where: { active: false },
    select: { slug: true, name: true, price: true, active: true },
    orderBy: { name: 'asc' },
  })
  const zeroPrice = await prisma.product.findMany({
    where: { active: true, price: 0 },
    select: { slug: true, name: true, price: true },
  })

  console.log(JSON.stringify({ total, active, inactiveCount: inactive.length, inactive, zeroPrice }, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
