/**
 * Create-only sync: inserts static catalog products that are missing from PostgreSQL.
 * Does NOT update existing product rows (prices, stock, active flags untouched).
 *
 * Why: storefront historically listed static-only products; checkout pricing requires
 * an active DB row, so coupon apply failed with "products no longer available".
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'
import { products } from '../lib/products'

const prisma = new PrismaClient()

function mapAvailability(value: string): ProductAvailability {
  if (value === 'Low Stock') return ProductAvailability.LOW_STOCK
  if (value === 'Made to Order') return ProductAvailability.MADE_TO_ORDER
  return ProductAvailability.IN_STOCK
}

function skuFromSlug(slug: string): string {
  const compact = slug
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  return `SH-${compact}`
}

async function main() {
  const existing = await prisma.product.findMany({ select: { slug: true, sku: true } })
  const existingSlugs = new Set(existing.map((row) => row.slug))
  const existingSkus = new Set(existing.map((row) => row.sku))

  const missing = products.filter((product) => !existingSlugs.has(product.slug))
  const created: string[] = []
  const skipped: Array<{ slug: string; reason: string }> = []

  for (const product of missing) {
    if (!Number.isFinite(product.price) || product.price <= 0) {
      skipped.push({ slug: product.slug, reason: `invalid price: ${product.price}` })
      continue
    }

    let sku = skuFromSlug(product.slug)
    if (existingSkus.has(sku)) {
      sku = `${sku}-X`
    }
    if (existingSkus.has(sku)) {
      skipped.push({ slug: product.slug, reason: `sku collision: ${sku}` })
      continue
    }

    await prisma.product.create({
      data: {
        slug: product.slug,
        sku,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice ?? null,
        image: product.image,
        images: product.images?.length ? product.images : [product.image],
        category: product.category,
        collections: product.collections ?? [],
        fabric: product.fabric,
        weave: product.weave,
        length: product.length,
        blouse: product.blouse,
        care: product.care,
        availability: mapAvailability(product.availability),
        isNew: Boolean(product.isNew),
        stock: product.availability === 'Made to Order' ? 0 : 10,
        active: true,
        featured: false,
      },
    })
    existingSkus.add(sku)
    created.push(product.slug)
  }

  console.log(
    JSON.stringify(
      {
        staticCount: products.length,
        dbBefore: existing.length,
        missingBefore: missing.length,
        createdCount: created.length,
        created,
        skipped,
      },
      null,
      2,
    ),
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
