const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const rows = await prisma.product.findMany({
      select: { slug: true, active: true, price: true, name: true },
      orderBy: { slug: 'asc' },
    })
    console.log(
      JSON.stringify(
        {
          count: rows.length,
          active: rows.filter((r) => r.active).length,
          inactive: rows.filter((r) => !r.active).map((r) => r.slug),
          slugs: rows.map((r) => r.slug),
        },
        null,
        2,
      ),
    )
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
