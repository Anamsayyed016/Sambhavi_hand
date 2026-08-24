import { OrderStatus, PaymentStatus, ProductAvailability } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { CheckoutError } from '@/lib/checkout/errors'
import { fetchRazorpayPayment } from '@/lib/payments/razorpay'
import { createNotification } from '@/lib/admin/notifications'

export async function confirmPaidOrder(input: {
  orderNumber: string
  razorpayOrderId: string
  razorpayPaymentId: string
}): Promise<{ orderNumber: string; alreadyPaid: boolean }> {
  const order = await prisma.order.findUnique({
    where: { orderNumber: input.orderNumber },
    include: { items: { select: { productId: true, quantity: true, product: { select: { availability: true } } } } },
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
        status:
          order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED
            ? OrderStatus.CONFIRMED
            : order.status,
      },
    })

    if (updated.count === 0) return

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

  return { orderNumber: order.orderNumber, alreadyPaid: false }
}

export async function notifyPaymentIssue(orderNumber: string) {
  await createNotification({
    type: 'PAYMENT_ISSUE',
    title: 'Payment issue',
    message: `Payment verification failed for order #${orderNumber}`,
    link: '/admin/orders',
  }).catch(() => undefined)
}
