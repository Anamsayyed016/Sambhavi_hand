import { prisma } from '@/lib/prisma'
import { resolveCheckoutCoupon } from '@/lib/checkout/coupon'
import { calculateOrderTotal, getShippingRules } from '@/lib/checkout/shipping'
import { isStorefrontProductVisible, productOffersFreeShipping } from '@/lib/payment-test-mode'
import type { Product } from '@/lib/products'
import { getProduct, getStorefrontProduct, getStorefrontProducts, withCatalogCreatedAt } from '@/lib/products'
import { mapDbProductToStorefront } from '@/lib/catalog/storefront-search'

export type DbProductPrice = {
  slug: string
  name: string
  price: number
  image: string
  category: string
  description: string
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
      active: true,
    },
  })

  return new Map(rows.map((row) => [row.slug, row]))
}

/** Overlay DB selling prices onto static catalog records used for storefront display. */
export async function applyDbPricesToProducts(products: Product[]): Promise<Product[]> {
  if (products.length === 0) return products
  try {
    const prices = await getDbPricesBySlugs(products.map((p) => p.slug))
    return products.map((product) => {
      const db = prices.get(product.slug)
      if (!db || !db.active) return product
      return {
        ...product,
        name: db.name || product.name,
        price: db.price,
        image: db.image || product.image,
        category: db.category || product.category,
        description: db.description || product.description,
      }
    })
  } catch (error) {
    console.error('[catalog] DB price overlay failed; using static catalog prices', error)
    return products
  }
}

export async function getPricedStorefrontProducts(): Promise<Product[]> {
  const staticPriced = withCatalogCreatedAt(await applyDbPricesToProducts(getStorefrontProducts()))

  try {
    const rows = await prisma.product.findMany({ where: { active: true } })
    if (rows.length === 0) return staticPriced

    const bySlug = new Map(staticPriced.map((product) => [product.slug, product]))
    for (const row of rows) {
      if (!isStorefrontProductVisible(row.slug)) continue
      const mapped = mapDbProductToStorefront(row)
      const fromStatic = bySlug.get(row.slug)
      // Keep explicit static gallery order for catalog products (never auto-sort / never let stale DB reorder).
      if (fromStatic && fromStatic.images.length > 0) {
        bySlug.set(row.slug, {
          ...mapped,
          createdAt: row.createdAt.toISOString(),
          image: fromStatic.image || mapped.image,
          images: [...fromStatic.images],
        })
      } else {
        bySlug.set(row.slug, mapped)
      }
    }
    return withCatalogCreatedAt(Array.from(bySlug.values()))
  } catch (error) {
    console.error('[catalog] DB catalog merge failed; using static+price overlay', error)
    return staticPriced
  }
}

export async function getPricedStorefrontProduct(slug: string): Promise<Product | undefined> {
  if (!getStorefrontProduct(slug) && !getProduct(slug)) {
    try {
      const row = await prisma.product.findUnique({ where: { slug } })
      if (!row || !row.active) return undefined
      return mapDbProductToStorefront(row)
    } catch (error) {
      console.error('[catalog] DB product lookup failed; static catalog only', error)
      return undefined
    }
  }

  const base = getStorefrontProduct(slug) ?? getProduct(slug)
  if (!base) return undefined
  const [priced] = await applyDbPricesToProducts([base])

  let dbActive: boolean | null = null
  try {
    const db = await prisma.product.findUnique({
      where: { slug },
      select: { active: true },
    })
    dbActive = db ? db.active : null
  } catch (error) {
    console.error('[catalog] DB product active check failed; using static catalog', error)
  }
  if (dbActive === false) return undefined

  // Preserve explicit catalog gallery order from static product data.
  return {
    ...priced,
    image: base.image || priced.image,
    images: base.images.length > 0 ? [...base.images] : priced.images,
  }
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
