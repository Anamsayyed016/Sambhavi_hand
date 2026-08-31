import { OrderStatus, PaymentStatus, ProductAvailability } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { CheckoutError } from '@/lib/checkout/errors'
import { incrementCouponUsageOnPaidOrder } from '@/lib/checkout/coupon'
import { fetchRazorpayPayment } from '@/lib/payments/razorpay'
import { createNotification, notifyPaidOrder } from '@/lib/admin/notifications'
import {
  sendAdminNewOrderEmail,
  sendCustomerOrderConfirmationEmail,
  type OrderEmailPayload,
} from '@/lib/email/order-emails'

export async function confirmPaidOrder(input: {
  orderNumber: string
  razorpayOrderId: string
  razorpayPaymentId: string
}): Promise<{ orderNumber: string; alreadyPaid: boolean }> {
  const order = await prisma.order.findUnique({
    where: { orderNumber: input.orderNumber },
    include: {
      items: {
        select: {
          productId: true,
          quantity: true,
          productName: true,
          price: true,
          subtotal: true,
          product: { select: { availability: true } },
        },
      },
    },
  })

  if (!order) {
    throw new CheckoutError('Order not found.', 404)
  }

  if (order.status === OrderStatus.CANCELLED) {
    throw new CheckoutError('This order can no longer be paid.', 400)
  }

  if (order.razorpayOrderId && order.razorpayOrderId !== input.razorpayOrderId) {
    throw new CheckoutError('Payment could not be verified. Please try again.', 400)
  }

  if (order.paymentStatus === PaymentStatus.PAID) {
    return { orderNumber: order.orderNumber, alreadyPaid: true }
  }

  const payment = await fetchRazorpayPayment(input.razorpayPaymentId)
  const expectedPaise = order.total * 100

  if (payment.order_id !== input.razorpayOrderId) {
    throw new CheckoutError('Payment could not be verified. Please try again.', 400)
  }

  if (payment.amount !== expectedPaise || payment.currency !== 'INR') {
    throw new CheckoutError('Payment could not be verified. Please try again.', 400)
  }

  if (payment.status !== 'captured' && payment.status !== 'authorized') {
    throw new CheckoutError('Payment could not be verified. Please try again.', 400)
  }

  let newlyPaid = false

  await prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: {
        id: order.id,
        paymentStatus: { not: PaymentStatus.PAID },
      },
      data: {
        paymentStatus: PaymentStatus.PAID,
        paymentId: input.razorpayPaymentId,
        razorpayOrderId: input.razorpayOrderId,
        paymentMethod: 'Razorpay',
        status:
          order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED
            ? OrderStatus.CONFIRMED
            : order.status,
      },
    })

    if (updated.count === 0) return
    newlyPaid = true

    await incrementCouponUsageOnPaidOrder(tx, order.couponId)

    for (const item of order.items) {
      if (!item.productId) continue
      if (item.product?.availability === ProductAvailability.MADE_TO_ORDER) continue

      const product = await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
        select: { stock: true },
      })

      if (product.stock < 0) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: 0 },
        })
      }
    }
  })

  if (newlyPaid) {
    await notifyPaidOrder(order.id).catch((error) => {
      console.error('[notify]', error instanceof Error ? error.message : 'notify failed')
    })

    const emailPayload: OrderEmailPayload = {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      city: order.city,
      state: order.state,
      postalCode: order.postalCode,
      country: order.country,
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      total: order.total,
      couponCode: order.couponCode,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: 'Razorpay',
      razorpayOrderId: input.razorpayOrderId,
      paymentId: input.razorpayPaymentId,
      items: order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
    }

    // Emails must never fail the payment confirmation path.
    await Promise.allSettled([
      sendAdminNewOrderEmail(emailPayload),
      sendCustomerOrderConfirmationEmail(emailPayload),
    ])
  }

  return { orderNumber: order.orderNumber, alreadyPaid: !newlyPaid }
}

/**
 * Mark an order payment as FAILED from Razorpay payment.failed webhook.
 * Never overwrites PAID. Never decrements stock. Never sets order status to paid.
 */
export async function markPaymentFailed(input: {
  razorpayOrderId: string
  razorpayPaymentId?: string
}): Promise<{ orderNumber: string; updated: boolean; alreadyPaid: boolean }> {
  const order = await prisma.order.findUnique({
    where: { razorpayOrderId: input.razorpayOrderId },
    select: {
      id: true,
      orderNumber: true,
      paymentStatus: true,
    },
  })

  if (!order) {
    throw new CheckoutError('Order not found.', 404)
  }

  if (order.paymentStatus === PaymentStatus.PAID) {
    return { orderNumber: order.orderNumber, updated: false, alreadyPaid: true }
  }

  if (order.paymentStatus === PaymentStatus.FAILED) {
    return { orderNumber: order.orderNumber, updated: false, alreadyPaid: false }
  }

  const updated = await prisma.order.updateMany({
    where: {
      id: order.id,
      paymentStatus: { not: PaymentStatus.PAID },
    },
    data: {
      paymentStatus: PaymentStatus.FAILED,
      ...(input.razorpayPaymentId ? { paymentId: input.razorpayPaymentId } : {}),
    },
  })

  return {
    orderNumber: order.orderNumber,
    updated: updated.count > 0,
    alreadyPaid: false,
  }
}

export async function notifyPaymentIssue(orderNumber: string) {
  await createNotification({
    type: 'PAYMENT_ISSUE',
    title: 'Payment issue',
    message: `Payment verification failed for order #${orderNumber}`,
    link: '/admin/orders',
  }).catch(() => undefined)
}
