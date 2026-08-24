import { NextResponse } from 'next/server'
import { z } from 'zod'
import { assertCheckoutOrigin, checkoutErrorResponse, CheckoutError } from '@/lib/checkout/errors'
import { checkCheckoutRateLimit, getCheckoutClientIp } from '@/lib/checkout/rate-limit'
import { verifyCheckoutSignature } from '@/lib/payments/razorpay'
import { confirmPaidOrder, notifyPaymentIssue } from '@/lib/payments/confirm'

const bodySchema = z.object({
  orderNumber: z.string().min(1).max(40),
  razorpay_order_id: z.string().min(1).max(64),
  razorpay_payment_id: z.string().min(1).max(64),
  razorpay_signature: z.string().min(1).max(256),
})

export async function POST(request: Request) {
  try {
    assertCheckoutOrigin(request)

    const ip = getCheckoutClientIp(request)
    const limit = checkCheckoutRateLimit(`razorpay-verify:${ip}`)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
      )
    }

    const body = await request.json().catch(() => null)
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      throw new CheckoutError('Payment could not be verified. Please try again.', 400)
    }

    const valid = verifyCheckoutSignature({
      razorpayOrderId: parsed.data.razorpay_order_id,
      razorpayPaymentId: parsed.data.razorpay_payment_id,
      razorpaySignature: parsed.data.razorpay_signature,
    })

    if (!valid) {
      await notifyPaymentIssue(parsed.data.orderNumber)
      throw new CheckoutError('Payment could not be verified. Please try again.', 400)
    }

    const result = await confirmPaidOrder({
      orderNumber: parsed.data.orderNumber,
      razorpayOrderId: parsed.data.razorpay_order_id,
      razorpayPaymentId: parsed.data.razorpay_payment_id,
    })

    return NextResponse.json({
      paid: true,
      orderNumber: result.orderNumber,
    })
  } catch (error) {
    return checkoutErrorResponse(error)
  }
}
