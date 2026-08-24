import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkoutErrorResponse, CheckoutError } from '@/lib/checkout/errors'
import { verifyWebhookSignature } from '@/lib/payments/razorpay'
import { confirmPaidOrder } from '@/lib/payments/confirm'

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature') ?? ''

    if (!verifyWebhookSignature(rawBody, signature)) {
      throw new CheckoutError('Invalid webhook signature.', 400)
    }

    const payload = JSON.parse(rawBody) as {
      event?: string
      payload?: {
        payment?: {
          entity?: {
            id?: string
            order_id?: string
            notes?: { orderNumber?: string }
          }
        }
        order?: {
          entity?: {
            id?: string
            notes?: { orderNumber?: string }
            receipt?: string
          }
        }
      }
    }

    const event = payload.event
    if (event !== 'payment.captured' && event !== 'order.paid') {
      return NextResponse.json({ ok: true, ignored: true })
    }

    const payment = payload.payload?.payment?.entity
    const razorpayOrderId = payment?.order_id ?? payload.payload?.order?.entity?.id
    const razorpayPaymentId = payment?.id
    const orderNumber =
      payment?.notes?.orderNumber ??
      payload.payload?.order?.entity?.notes?.orderNumber ??
      payload.payload?.order?.entity?.receipt

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ ok: true, ignored: true })
    }

    let number = orderNumber
    if (!number) {
      const order = await prisma.order.findUnique({
        where: { razorpayOrderId },
        select: { orderNumber: true },
      })
      number = order?.orderNumber
    }

    if (!number) {
      return NextResponse.json({ ok: true, ignored: true })
    }

    await confirmPaidOrder({
      orderNumber: number,
      razorpayOrderId,
      razorpayPaymentId,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return checkoutErrorResponse(error)
  }
}
