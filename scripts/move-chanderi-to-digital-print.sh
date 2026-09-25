#!/usr/bin/env bash
set -euo pipefail
set -a
. /var/www/sambhavi-handloom/shared/.env
set +a
cd /var/www/sambhavi-handloom/current
node <<'NODE'
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const ID = 'cmt5puxpd000al1pq2csd3btm'
async function main() {
  const before = await prisma.product.findUnique({
    where: { id: ID },
    select: {
      id: true, sku: true, slug: true, name: true, category: true,
      price: true, originalPrice: true, image: true, images: true,
      status: true, collections: true, featured: true, isNew: true,
    },
  })
  console.log('BEFORE', JSON.stringify(before, null, 2))
  if (!before) throw new Error('Product not found')
  if (before.category !== 'Chanderi') {
    throw new Error(`Expected category Chanderi, got ${before.category}`)
  }
  const after = await prisma.product.update({
    where: { id: ID },
    data: { category: 'Digital Print' },
    select: {
      id: true, sku: true, slug: true, name: true, category: true,
      price: true, originalPrice: true, image: true, images: true,
      status: true, collections: true, featured: true, isNew: true,
    },
  })
  console.log('AFTER', JSON.stringify(after, null, 2))
  // Verify only category changed
  const keys = Object.keys(before)
  const diffs = keys.filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]))
  console.log('CHANGED_FIELDS', diffs)
  const leftover = await prisma.product.count({
    where: { category: { equals: 'Chanderi', mode: 'insensitive' } },
  })
  console.log('REMAINING_CHANDERI_COUNT', leftover)
}
main().finally(() => prisma.$disconnect())
NODE
