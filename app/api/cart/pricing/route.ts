import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  assertCheckoutOrigin,
  checkoutErrorResponse,
  CheckoutError,
} from '@/lib/checkout/errors'
import { getDbPricesBySlugs, computeServerCartTotals } from '@/lib/catalog/db-pricing'

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().trim().min(1).max(200),
        quantity: z.coerce.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(20),
})

/**
 * Returns authoritative DB prices + totals for cart lines.
 * Used to refresh stale client cart snapshots before checkout.
 */
export async function POST(request: Request) {
  try {
    assertCheckoutOrigin(request)

    const body = await request.json().catch(() => null)
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      throw new CheckoutError('Invalid cart pricing request.', 400)
    }

    const slugs = parsed.data.items.map((i) => i.slug)
    const prices = await getDbPricesBySlugs(slugs)

    const missing = slugs.filter((slug) => {
      const row = prices.get(slug)
      return !row || !row.active
    })
    if (missing.length > 0) {
      throw new CheckoutError('One or more products are no longer available.', 400)
    }

    const totals = await computeServerCartTotals(parsed.data.items)

    return NextResponse.json({
      items: parsed.data.items.map((item) => {
        const product = prices.get(item.slug)!
        return {
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          quantity: item.quantity,
          lineTotal: product.price * item.quantity,
        }
      }),
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
    })
  } catch (error) {
    return checkoutErrorResponse(error)
  }
}
