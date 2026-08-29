import { NextResponse } from 'next/server'
import { z } from 'zod'
import { OrderStatus, PaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { assertCheckoutOrigin, checkoutErrorResponse, CheckoutError } from '@/lib/checkout/errors'
import { checkCheckoutRateLimit, getCheckoutClientIp } from '@/lib/checkout/rate-limit'
import { createRazorpayOrder, fetchRazorpayOrder, getRazorpayKeyId } from '@/lib/payments/razorpay'

const bodySchema = z.object({
  orderNumber: z.string().min(1).max(40),
})

export async function POST(request: Request) {
  try {
    assertCheckoutOrigin(request)

    const ip = getCheckoutClientIp(request)
    const limit = checkCheckoutRateLimit(`razorpay-order:${ip}`)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many payment attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
      )
    }

    const body = await request.json().catch(() => null)
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      throw new CheckoutError('Invalid payment request.', 400)
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: parsed.data.orderNumber },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        paymentStatus: true,
        razorpayOrderId: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
      },
    })

    if (!order) {
      throw new CheckoutError('Order not found.', 404)
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new CheckoutError('This order can no longer be paid.', 400)
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      return NextResponse.json({
        alreadyPaid: true,
        orderNumber: order.orderNumber,
      })
    }

    if (order.paymentStatus === PaymentStatus.FAILED) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: PaymentStatus.PENDING },
      })
    }

    const keyId = getRazorpayKeyId()
    const expectedPaise = order.total * 100

    if (order.total < 1) {
      throw new CheckoutError('Invalid order total.', 400)
    }

    // Never reuse a Razorpay order whose amount does not match the DB order total.
    if (order.razorpayOrderId) {
      try {
        const rpOrder = await fetchRazorpayOrder(order.razorpayOrderId)
        if (rpOrder.amount === expectedPaise && (rpOrder.currency || 'INR') === 'INR') {
          return NextResponse.json({
            keyId,
            orderNumber: order.orderNumber,
            razorpayOrderId: order.razorpayOrderId,
            amount: expectedPaise,
            currency: 'INR',
            customer: {
              name: order.customerName,
              email: order.customerEmail,
              contact: order.customerPhone,
            },
          })
        }
      } catch {
        // Fall through and create a fresh Razorpay order.
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: null },
      })
    }

    const razorpayOrder = await createRazorpayOrder({
      amountPaise: expectedPaise,
      receipt: order.orderNumber,
      notes: {
        orderNumber: order.orderNumber,
        orderId: order.id,
        amountInr: String(order.total),
      },
    })

    if (razorpayOrder.amount !== expectedPaise) {
      throw new CheckoutError('Payment service returned an unexpected amount.', 503)
    }

    try {
      await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: razorpayOrder.id },
      })
    } catch {
      const again = await prisma.order.findUnique({
        where: { id: order.id },
        select: { razorpayOrderId: true },
      })
      if (!again?.razorpayOrderId) {
        throw new CheckoutError('Payment service is temporarily unavailable. Please try again.', 503)
      }
      return NextResponse.json({
        keyId,
        orderNumber: order.orderNumber,
        razorpayOrderId: again.razorpayOrderId,
        amount: expectedPaise,
        currency: 'INR',
        customer: {
          name: order.customerName,
          email: order.customerEmail,
          contact: order.customerPhone,
        },
      })
    }

    return NextResponse.json({
      keyId,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || 'INR',
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        contact: order.customerPhone,
      },
    })
  } catch (error) {
    return checkoutErrorResponse(error)
  }
}
