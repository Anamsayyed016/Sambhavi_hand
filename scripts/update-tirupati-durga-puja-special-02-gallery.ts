/**
 * Gallery-only update for Tirupati Durga Puja Special #02.
 * Appends WA0141 + WA0133 after primary. Does NOT modify product #01.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SLUG = 'tirupati-durga-puja-special-02'
const ORIGINAL_SLUG = 'tirupati-durga-puja-special'
const PRIMARY =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1790243072/file_00000000d8c481f69a717618a6f609aa.png'
const EXTRA = [
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1790243073/IMG-20260924-WA0141.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1790243072/IMG-20260924-WA0133.jpg',
] as const

function buildGallery(existing: string[] | undefined): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const url of [PRIMARY, ...(existing ?? []), ...EXTRA]) {
    if (!url || seen.has(url)) continue
    seen.add(url)
    out.push(url)
  }
  const rest = out.filter((url) => url !== PRIMARY)
  return [PRIMARY, ...rest]
}

async function main() {
  const product = await prisma.product.findUnique({ where: { slug: SLUG } })
  if (!product) throw new Error(`Product not found: ${SLUG}`)

  for (const url of EXTRA) {
    if ((product.images ?? []).includes(url)) {
      console.log(`Already present (will keep once): ${url}`)
    }
  }

  const images = buildGallery(product.images)
  const updated = await prisma.product.update({
    where: { slug: SLUG },
    data: {
      image: product.image || PRIMARY,
      images,
    },
  })

  const original = await prisma.product.findUnique({
    where: { slug: ORIGINAL_SLUG },
    select: { images: true, image: true, price: true },
  })

  console.log(`#02 gallery updated (${updated.images.length}):`)
  for (const url of updated.images) console.log(`  - ${url}`)
  console.log('Original #01 unchanged:')
  console.log(`  images (${original?.images.length}):`)
  for (const url of original?.images ?? []) console.log(`  - ${url}`)

  for (const url of EXTRA) {
    if (original?.images?.includes(url) || original?.image === url) {
      throw new Error(`Original product was polluted with ${url}`)
    }
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
