import {
  OrderStatus,
  PaymentStatus,
  ProductAvailability,
  type Prisma,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { calculateOrderTotal } from '@/lib/checkout/shipping'
import { CheckoutError } from '@/lib/checkout/errors'
import type { CheckoutRequest } from '@/lib/checkout/validation'
import { notifyNewOrder } from '@/lib/admin/notifications'

type Tx = Prisma.TransactionClient

async function generateOrderNumber(tx: Tx): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `SH-${year}-`

  const latest = await tx.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true },
  })

  let next = 1
  if (latest?.orderNumber) {
    const suffix = latest.orderNumber.slice(prefix.length)
    const parsed = Number.parseInt(suffix, 10)
    if (!Number.isNaN(parsed)) next = parsed + 1
  }

  return `${prefix}${String(next).padStart(5, '0')}`
}

function assertStock(product: {
  stock: number
  availability: ProductAvailability
  name: string
  active: boolean
}, quantity: number): void {
  if (!product.active) {
    throw new CheckoutError(`"${product.name}" is no longer available.`)
  }

  if (product.availability === ProductAvailability.MADE_TO_ORDER) {
    return
  }

  if (product.stock < quantity) {
    throw new CheckoutError(
      'Some items are no longer available in the requested quantity.',
    )
  }
}

export type CheckoutResult = {
  orderId: string
  orderNumber: string
  total: number
  customerEmail: string
}

export async function createCheckoutOrder(input: CheckoutRequest): Promise<CheckoutResult> {
  const uniqueSlugs = [...new Set(input.items.map((i) => i.slug))]
  if (uniqueSlugs.length !== input.items.length) {
    throw new CheckoutError('Duplicate items in cart. Please refresh and try again.')
  }

  const products = await prisma.product.findMany({
    where: { slug: { in: uniqueSlugs } },
  })

  if (products.length !== uniqueSlugs.length) {
    throw new CheckoutError('One or more products in your cart are no longer available.')
  }

  const productBySlug = new Map(products.map((p) => [p.slug, p]))

  const lineItems = input.items.map((item) => {
    const product = productBySlug.get(item.slug)!
    assertStock(product, item.quantity)

    const price = product.price
    const subtotal = price * item.quantity

    return {
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      price,
      quantity: item.quantity,
      subtotal,
    }
  })

  const subtotal = lineItems.reduce((sum, line) => sum + line.subtotal, 0)
  const { shipping, total } = calculateOrderTotal(subtotal)

  const order = await prisma.$transaction(async (tx) => {
    const orderNumber = await generateOrderNumber(tx)

    return tx.order.create({
      data: {
        orderNumber,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        subtotal,
        shipping,
        total,
        customerName: input.customer.name,
        customerEmail: input.customer.email.toLowerCase(),
        customerPhone: input.customer.phone,
        shippingAddress: input.shipping.address,
        city: input.shipping.city,
        state: input.shipping.state,
        postalCode: input.shipping.postalCode,
        country: input.shipping.country || 'IN',
        items: {
          create: lineItems.map((line) => ({
            productId: line.productId,
            productSlug: line.productSlug,
            productName: line.productName,
            price: line.price,
            quantity: line.quantity,
            subtotal: line.subtotal,
          })),
        },
      },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        customerEmail: true,
      },
    })
  })

  await notifyNewOrder(order.orderNumber, input.customer.name, order.total).catch(() => undefined)

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    total: order.total,
    customerEmail: order.customerEmail,
  }
}

export async function getPublicOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    select: {
      orderNumber: true,
      customerEmail: true,
      customerName: true,
      subtotal: true,
      shipping: true,
      total: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
      items: {
        select: {
          productName: true,
          productSlug: true,
          price: true,
          quantity: true,
          subtotal: true,
          product: { select: { image: true } },
        },
      },
    },
  })
}
