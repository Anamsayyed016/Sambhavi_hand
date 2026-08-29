import { NextResponse } from 'next/server'
import { PaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createCheckoutOrder } from '@/lib/checkout/create-order'
import {
  assertCheckoutOrigin,
  checkoutErrorResponse,
  CheckoutError,
} from '@/lib/checkout/errors'
import {
  clearIdempotentCheckoutResult,
  getIdempotentCheckoutResult,
  saveIdempotentCheckoutResult,
} from '@/lib/checkout/idempotency'
import { checkCheckoutRateLimit, getCheckoutClientIp } from '@/lib/checkout/rate-limit'
import { checkoutRequestSchema } from '@/lib/checkout/validation'
import { computeServerCartTotals } from '@/lib/catalog/db-pricing'

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

    const expected = await computeServerCartTotals(parsed.data.items)

    const existing = getIdempotentCheckoutResult(parsed.data.idempotencyKey)
    if (existing) {
      const prior = await prisma.order.findUnique({
        where: { orderNumber: existing.orderNumber },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          subtotal: true,
          shipping: true,
          paymentStatus: true,
          razorpayOrderId: true,
        },
      })

      // Reuse only when the unpaid order still matches current DB pricing.
      if (
        prior &&
        prior.paymentStatus !== PaymentStatus.PAID &&
        prior.total === expected.total
      ) {
        return NextResponse.json({
          orderNumber: prior.orderNumber,
          orderId: prior.id,
          subtotal: prior.subtotal,
          shipping: prior.shipping,
          total: prior.total,
          idempotent: true,
        })
      }

      // Stale pending order (e.g. price changed 2460 → 1) — force a fresh order.
      clearIdempotentCheckoutResult(parsed.data.idempotencyKey)
    }

    const result = await createCheckoutOrder(parsed.data)

    saveIdempotentCheckoutResult(parsed.data.idempotencyKey, {
      orderNumber: result.orderNumber,
      orderId: result.orderId,
      total: result.total,
    })

    const created = await prisma.order.findUnique({
      where: { id: result.orderId },
      select: { subtotal: true, shipping: true, total: true },
    })

    return NextResponse.json({
      orderNumber: result.orderNumber,
      orderId: result.orderId,
      subtotal: created?.subtotal ?? expected.subtotal,
      shipping: created?.shipping ?? expected.shipping,
      total: created?.total ?? result.total,
      customerEmail: result.customerEmail,
    })
  } catch (error) {
    return checkoutErrorResponse(error)
  }
}
