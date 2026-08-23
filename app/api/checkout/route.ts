import { NextResponse } from 'next/server'
import { createCheckoutOrder } from '@/lib/checkout/create-order'
import {
  assertCheckoutOrigin,
  checkoutErrorResponse,
  CheckoutError,
} from '@/lib/checkout/errors'
import {
  getIdempotentCheckoutResult,
  saveIdempotentCheckoutResult,
} from '@/lib/checkout/idempotency'
import { checkCheckoutRateLimit, getCheckoutClientIp } from '@/lib/checkout/rate-limit'
import { checkoutRequestSchema } from '@/lib/checkout/validation'

export async function POST(request: Request) {
  try {
    assertCheckoutOrigin(request)

    const ip = getCheckoutClientIp(request)
    const limit = checkCheckoutRateLimit(`checkout:${ip}`)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many order attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
      )
    }

    const contentLength = request.headers.get('content-length')
    if (contentLength && Number(contentLength) > 32_000) {
      throw new CheckoutError('Request too large', 413)
    }

    const body = await request.json().catch(() => null)
    const parsed = checkoutRequestSchema.safeParse(body)
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? 'Invalid checkout data.'
      throw new CheckoutError(first, 400)
    }

    const existing = getIdempotentCheckoutResult(parsed.data.idempotencyKey)
    if (existing) {
      return NextResponse.json({
        orderNumber: existing.orderNumber,
        orderId: existing.orderId,
        total: existing.total,
        idempotent: true,
      })
    }

    const result = await createCheckoutOrder(parsed.data)

    saveIdempotentCheckoutResult(parsed.data.idempotencyKey, {
      orderNumber: result.orderNumber,
      orderId: result.orderId,
      total: result.total,
    })

    return NextResponse.json({
      orderNumber: result.orderNumber,
      orderId: result.orderId,
      total: result.total,
      customerEmail: result.customerEmail,
    })
  } catch (error) {
    return checkoutErrorResponse(error)
  }
}
