import { prisma } from '@/lib/prisma'
import { ProductStatus, type Product as DbProduct } from '@prisma/client'
import { resolveCheckoutCoupon } from '@/lib/checkout/coupon'
import { calculateOrderTotal, getShippingRules } from '@/lib/checkout/shipping'
import { isStorefrontProductVisible, productOffersFreeShipping } from '@/lib/payment-test-mode'
import type { Product } from '@/lib/products'
import { getProduct, getStorefrontProducts, withCatalogCreatedAt } from '@/lib/products'
import { mapDbProductToStorefront } from '@/lib/catalog/storefront-search'
import {
  isStorefrontSellableStatus,
  storefrontActiveProductWhere,
} from '@/lib/admin/product-status'

export type DbProductPrice = {
  slug: string
  name: string
  price: number
  image: string
  category: string
  description: string
  /** Compatibility: true only when status is ACTIVE. */
  active: boolean
}

/** Authoritative commerce prices from PostgreSQL (never trust the browser). */
export async function getDbPricesBySlugs(slugs: string[]): Promise<Map<string, DbProductPrice>> {
  const unique = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))]
  if (unique.length === 0) return new Map()

  const rows = await prisma.product.findMany({
    where: { slug: { in: unique } },
    select: {
      slug: true,
      name: true,
      price: true,
      image: true,
      category: true,
      description: true,
      status: true,
    },
  })

  return new Map(
    rows.map((row) => [
      row.slug,
      {
        slug: row.slug,
        name: row.name,
        price: row.price,
        image: row.image,
        category: row.category,
        description: row.description,
        active: isStorefrontSellableStatus(row.status),
      },
    ]),
  )
}

/**
 * Merge a DB product with optional static catalog fallback.
 * Non-empty database values ALWAYS win. Static is only used when DB field is empty.
 */
export function mergeDbProductWithStaticFallback(
  row: DbProduct,
  staticProduct?: Product,
): Product {
  const mapped = mapDbProductToStorefront(row)
  const dbImage = row.image?.trim() ?? ''
  const dbHasGallery = row.images.length > 0

  const image =
    dbImage ||
    staticProduct?.image?.trim() ||
    mapped.image

  const images = dbHasGallery
    ? [...row.images]
    : staticProduct && staticProduct.images.length > 0
      ? [...staticProduct.images]
      : mapped.images

  return {
    ...mapped,
    // Explicit DB-first field picks (non-empty DB never replaced by static)
    name: row.name.trim() || staticProduct?.name || mapped.name,
    price: row.price,
    originalPrice: row.originalPrice ?? staticProduct?.originalPrice,
    image,
    images,
    category: row.category.trim() || staticProduct?.category || mapped.category,
    collections:
      row.collections.length > 0
        ? [...row.collections]
        : staticProduct?.collections?.length
          ? [...staticProduct.collections]
          : mapped.collections,
    fabric: row.fabric.trim() || staticProduct?.fabric || mapped.fabric,
    weave: row.weave.trim() || staticProduct?.weave || mapped.weave,
    length: row.length.trim() || staticProduct?.length || mapped.length,
    blouse: row.blouse.trim() || staticProduct?.blouse || mapped.blouse,
    care: row.care.trim() || staticProduct?.care || mapped.care,
    description: row.description.trim() || staticProduct?.description || mapped.description,
    availability: mapped.availability,
    isNew: row.isNew,
    featured: row.featured,
    createdAt: row.createdAt.toISOString(),
  }
}

/**
 * Overlay DB commerce fields onto a product list (e.g. related products).
 * Fetches full active DB rows by slug — DB wins for every present field.
 */
export async function applyDbPricesToProducts(products: Product[]): Promise<Product[]> {
  if (products.length === 0) return products
  try {
    const slugs = products.map((p) => p.slug)
    const rows = await prisma.product.findMany({
      where: { slug: { in: slugs } },
    })
    const bySlug = new Map(rows.map((row) => [row.slug, row]))

    return products.flatMap((product) => {
      const row = bySlug.get(product.slug)
      if (!row) return [] // hide static-only when we have DB context for these slugs
      if (!isStorefrontSellableStatus(row.status)) return []
      return [mergeDbProductWithStaticFallback(row, product)]
    })
  } catch (error) {
    console.error('[catalog] DB product overlay failed; using provided products', error)
    return products
  }
}

/**
 * Full storefront catalog: ACTIVE database products as source of truth.
 * Static catalog fills only empty DB fields (e.g. legacy empty gallery).
 */
export async function getPricedStorefrontProducts(): Promise<Product[]> {
  try {
    const [activeRows, otherCount] = await Promise.all([
      prisma.product.findMany({ where: storefrontActiveProductWhere }),
      prisma.product.count({
        where: { status: { in: [ProductStatus.DRAFT, ProductStatus.ARCHIVED] } },
      }),
    ])

    // Empty DB → static catalog only (local/dev without seed).
    if (activeRows.length === 0 && otherCount === 0) {
      return withCatalogCreatedAt(getStorefrontProducts())
    }

    const priced: Product[] = []
    for (const row of activeRows) {
      if (!isStorefrontProductVisible(row.slug)) continue
      const staticProduct = getProduct(row.slug)
      priced.push(mergeDbProductWithStaticFallback(row, staticProduct))
    }
    return withCatalogCreatedAt(priced)
  } catch (error) {
    console.error('[catalog] DB catalog load failed; falling back to static catalog', error)
    return withCatalogCreatedAt(getStorefrontProducts())
  }
}

/**
 * Single product for PDP: database row is primary.
 * Non-ACTIVE / missing DB products are hidden when the DB is reachable.
 */
export async function getPricedStorefrontProduct(slug: string): Promise<Product | undefined> {
  try {
    const row = await prisma.product.findUnique({ where: { slug } })
    if (!row || !isStorefrontSellableStatus(row.status)) return undefined
    if (!isStorefrontProductVisible(row.slug)) return undefined
    return mergeDbProductWithStaticFallback(row, getProduct(slug))
  } catch (error) {
    console.error('[catalog] DB product lookup failed; attempting static fallback', error)
    const staticProduct = getProduct(slug)
    if (!staticProduct || !isStorefrontProductVisible(slug)) return undefined
    return staticProduct
  }
}

/** Related products from the live DB catalog (same collections). */
export async function getRelatedPricedProducts(
  slug: string,
  collections: string[],
  limit = 3,
): Promise<Product[]> {
  const all = await getPricedStorefrontProducts()
  return all
    .filter(
      (p) =>
        p.slug !== slug &&
        (collections.length === 0 ||
          p.collections.some((c) => collections.includes(c))),
    )
    .slice(0, limit)
}

export async function computeServerCartTotals(
  items: Array<{ slug: string; quantity: number }>,
  couponCode?: string | null,
): Promise<{
  subtotal: number
  discount: number
  shipping: number
  total: number
  couponCode: string | null
  couponId: string | null
  lines: Array<{ slug: string; price: number; quantity: number; subtotal: number; name: string }>
}> {
  const prices = await getDbPricesBySlugs(items.map((i) => i.slug))
  const lines = items.map((item) => {
    const product = prices.get(item.slug)
    if (!product || !product.active) {
      throw new Error(`Unavailable: ${item.slug}`)
    }
    const subtotal = product.price * item.quantity
    return {
      slug: item.slug,
      price: product.price,
      quantity: item.quantity,
      subtotal,
      name: product.name,
      description: product.description,
    }
  })

  const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0)
  const { shippingFee, freeShippingThreshold } = await getShippingRules()
  const freeShipping = lines.every((line) => productOffersFreeShipping(line))
  const resolvedCoupon = await resolveCheckoutCoupon(couponCode, subtotal)
  const discount = resolvedCoupon?.discount ?? 0
  const totals = calculateOrderTotal(
    subtotal,
    freeShipping ? 0 : shippingFee,
    freeShippingThreshold,
    discount,
  )

  return {
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    total: totals.total,
    couponCode: resolvedCoupon?.couponCode ?? null,
    couponId: resolvedCoupon?.couponId ?? null,
    lines: lines.map(({ slug, price, quantity, subtotal: lineSubtotal, name }) => ({
      slug,
      price,
      quantity,
      subtotal: lineSubtotal,
      name,
    })),
  }
}
