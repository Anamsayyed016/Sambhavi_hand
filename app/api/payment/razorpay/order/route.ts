import { NextResponse } from 'next/server'
import { z } from 'zod'
import { OrderStatus, PaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { assertCheckoutOrigin, checkoutErrorResponse, CheckoutError } from '@/lib/checkout/errors'
import { checkCheckoutRateLimit, getCheckoutClientIp } from '@/lib/checkout/rate-limit'
import { createRazorpayOrder, getRazorpayKeyId } from '@/lib/payments/razorpay'

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

    const keyId = getRazorpayKeyId()

    if (order.razorpayOrderId) {
      return NextResponse.json({
        keyId,
        orderNumber: order.orderNumber,
        razorpayOrderId: order.razorpayOrderId,
        amount: order.total * 100,
        currency: 'INR',
        customer: {
          name: order.customerName,
          email: order.customerEmail,
          contact: order.customerPhone,
        },
      })
    }

    const razorpayOrder = await createRazorpayOrder({
      amountPaise: order.total * 100,
      receipt: order.orderNumber,
      notes: { orderNumber: order.orderNumber, orderId: order.id },
    })

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
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
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
