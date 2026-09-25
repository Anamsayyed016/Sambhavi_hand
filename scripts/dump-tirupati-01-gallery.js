const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const p = await prisma.product.findUnique({
    where: { id: 'cmug6wnm90002l1lpqu7yvodu' },
    select: { id: true, sku: true, slug: true, image: true, images: true, status: true },
  })
  console.log(JSON.stringify({ db: p, count: p?.images?.length }, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
