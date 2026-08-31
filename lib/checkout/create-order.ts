import {
  OrderStatus,
  PaymentStatus,
  ProductAvailability,
  type Prisma,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { calculateOrderTotal, getShippingRules } from '@/lib/checkout/shipping'
import { resolveCheckoutCoupon } from '@/lib/checkout/coupon'
import { CheckoutError } from '@/lib/checkout/errors'
import type { CheckoutRequest } from '@/lib/checkout/validation'
import {
  PAYMENT_TEST_MODE,
  PAYMENT_TEST_PRODUCT_SLUG,
  productOffersFreeShipping,
} from '@/lib/payment-test-mode'

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

function assertStock(
  product: {
    stock: number
    availability: ProductAvailability
    name: string
    active: boolean
  },
  quantity: number,
): void {
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
  subtotal: number
  discount: number
  shipping: number
  total: number
  couponCode: string | null
  customerEmail: string
}

export async function createCheckoutOrder(input: CheckoutRequest): Promise<CheckoutResult> {
  const uniqueSlugs = [...new Set(input.items.map((i) => i.slug))]
  if (uniqueSlugs.length !== input.items.length) {
    throw new CheckoutError('Duplicate items in cart. Please refresh and try again.')
  }

  if (PAYMENT_TEST_MODE && uniqueSlugs.some((slug) => slug !== PAYMENT_TEST_PRODUCT_SLUG)) {
    throw new CheckoutError('Only the selected test product can be purchased right now.')
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
      productImage: product.image,
      price,
      quantity: item.quantity,
      subtotal,
    }
  })

  const subtotal = lineItems.reduce((sum, line) => sum + line.subtotal, 0)
  const { shippingFee, freeShippingThreshold } = await getShippingRules()
  const cartQualifiesForFreeShipping = products.every(productOffersFreeShipping)
  const resolvedCoupon = await resolveCheckoutCoupon(input.couponCode, subtotal)
  const discount = resolvedCoupon?.discount ?? 0
  const { shipping, total } = calculateOrderTotal(
    subtotal,
    cartQualifiesForFreeShipping ? 0 : shippingFee,
    freeShippingThreshold,
    discount,
  )

  const order = await prisma.$transaction(async (tx) => {
    const orderNumber = await generateOrderNumber(tx)

    return tx.order.create({
      data: {
        orderNumber,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        subtotal,
        discount,
        shipping,
        total,
        couponCode: resolvedCoupon?.couponCode ?? null,
        couponId: resolvedCoupon?.couponId ?? null,
        currency: 'INR',
        paymentMethod: 'Razorpay',
        customerName: input.customer.name,
        customerEmail: input.customer.email.toLowerCase(),
        customerPhone: input.customer.phone,
        shippingAddress: input.shipping.address,
        city: input.shipping.city,
        state: input.shipping.state,
        postalCode: input.shipping.postalCode,
        country: input.shipping.country || 'India',
        items: {
          create: lineItems.map((line) => ({
            productId: line.productId,
            productSlug: line.productSlug,
            productName: line.productName,
            productImage: line.productImage,
            price: line.price,
            quantity: line.quantity,
            subtotal: line.subtotal,
          })),
        },
      },
      select: {
        id: true,
        orderNumber: true,
        subtotal: true,
        discount: true,
        shipping: true,
        total: true,
        couponCode: true,
        customerEmail: true,
      },
    })
  })

  // Admin NEW_ORDER notification + emails fire only after PAID verification
  // (see confirmPaidOrder). Pending checkout must not look like a successful sale.

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    total: order.total,
    couponCode: order.couponCode,
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
      customerPhone: true,
      shippingAddress: true,
      city: true,
      state: true,
      postalCode: true,
      country: true,
      subtotal: true,
      discount: true,
      shipping: true,
      total: true,
      couponCode: true,
      currency: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      createdAt: true,
      items: {
        select: {
          productName: true,
          productSlug: true,
          productImage: true,
          price: true,
          quantity: true,
          subtotal: true,
          product: { select: { image: true } },
        },
      },
    },
  })
}
