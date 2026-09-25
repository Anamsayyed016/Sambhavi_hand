#!/usr/bin/env bash
set -euo pipefail
set -a
. /var/www/sambhavi-handloom/shared/.env
set +a
cd /var/www/sambhavi-handloom/current
node <<'NODE'
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  const rows = await prisma.product.findMany({
    where: {
      OR: [
        { category: { equals: 'Chanderi', mode: 'insensitive' } },
        { slug: { contains: 'chanderi', mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      sku: true,
      slug: true,
      name: true,
      category: true,
      status: true,
      price: true,
    },
  })
  console.log(JSON.stringify(rows, null, 2))
  console.log('COUNT', rows.length)
}
main().finally(() => prisma.$disconnect())
NODE
