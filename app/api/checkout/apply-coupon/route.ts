import { NextResponse } from 'next/server'
import {
  assertCheckoutOrigin,
  checkoutErrorResponse,
  CheckoutError,
} from '@/lib/checkout/errors'
import { checkCheckoutRateLimit, getCheckoutClientIp } from '@/lib/checkout/rate-limit'
import { applyCouponRequestSchema } from '@/lib/checkout/validation'
import { computeServerCartTotals } from '@/lib/catalog/db-pricing'

export async function POST(request: Request) {
  try {
    assertCheckoutOrigin(request)

    const ip = getCheckoutClientIp(request)
    const limit = checkCheckoutRateLimit(`apply-coupon:${ip}`)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
      )
    }

    const body = await request.json().catch(() => null)
    const parsed = applyCouponRequestSchema.safeParse(body)
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? 'Invalid request.'
      throw new CheckoutError(first, 400)
    }

    const totals = await computeServerCartTotals(parsed.data.items, parsed.data.couponCode)

    return NextResponse.json({
      valid: true,
      couponCode: totals.couponCode,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      total: totals.total,
    })
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ valid: false, error: error.message }, { status: error.status })
    }
    return checkoutErrorResponse(error)
  }
}
