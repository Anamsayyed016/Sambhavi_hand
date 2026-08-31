import { prisma } from '@/lib/prisma'
import { resolveCheckoutCoupon } from '@/lib/checkout/coupon'
import { calculateOrderTotal, getShippingRules } from '@/lib/checkout/shipping'
import { productOffersFreeShipping } from '@/lib/payment-test-mode'
import type { Product } from '@/lib/products'
import { getProduct, getStorefrontProduct, getStorefrontProducts } from '@/lib/products'

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
  return applyDbPricesToProducts(getStorefrontProducts())
}

export async function getPricedStorefrontProduct(slug: string): Promise<Product | undefined> {
  const base = getStorefrontProduct(slug) ?? getProduct(slug)
  if (!base) return undefined
  const [priced] = await applyDbPricesToProducts([base])
  const db = await prisma.product.findUnique({
    where: { slug },
    select: { active: true },
  })
  if (db && !db.active) return undefined
  return priced
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
