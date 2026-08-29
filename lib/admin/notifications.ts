import { NotificationType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { formatINR } from '@/lib/admin/format'

export async function listNotifications(limit = 20, unreadOnly = false) {
  return prisma.adminNotification.findMany({
    where: unreadOnly ? { read: false } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getUnreadNotificationCount() {
  return prisma.adminNotification.count({ where: { read: false } })
}

export async function markNotificationRead(id: string) {
  return prisma.adminNotification.update({
    where: { id },
    data: { read: true },
  })
}

export async function markAllNotificationsRead() {
  return prisma.adminNotification.updateMany({
    where: { read: false },
    data: { read: true },
  })
}

export async function createNotification(input: {
  type: NotificationType
  title: string
  message: string
  link?: string
  orderId?: string
}) {
  return prisma.adminNotification.create({ data: input })
}

/**
 * Fired only after server-side payment verification marks an order PAID.
 * Idempotent per orderId — will not create a second NEW_ORDER for the same order.
 */
export async function notifyPaidOrder(orderId: string): Promise<void> {
  const existing = await prisma.adminNotification.findFirst({
    where: {
      type: NotificationType.NEW_ORDER,
      orderId,
    },
    select: { id: true },
  })
  if (existing) return

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      total: true,
      paymentStatus: true,
      createdAt: true,
      items: {
        select: {
          productName: true,
          quantity: true,
        },
        take: 3,
      },
    },
  })

  if (!order) return

  const productLine = order.items
    .map((item) => `${item.productName} × ${item.quantity}`)
    .join(', ')
  const when = order.createdAt.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  })

  await createNotification({
    type: NotificationType.NEW_ORDER,
    title: 'New Order',
    message: [
      `#${order.orderNumber}`,
      order.customerName,
      productLine || 'Items',
      formatINR(order.total),
      `Payment: ${order.paymentStatus}`,
      when,
    ].join(' · '),
    link: `/admin/orders/${order.id}`,
    orderId: order.id,
  })
}

/** @deprecated Prefer notifyPaidOrder — kept for any legacy call sites. */
export async function notifyNewOrder(orderNumber: string, customerName: string, total: number) {
  return createNotification({
    type: NotificationType.NEW_ORDER,
    title: 'New Order',
    message: `${customerName} placed order #${orderNumber} (${formatINR(total)})`,
    link: `/admin/orders?q=${encodeURIComponent(orderNumber)}`,
  })
}

export async function ensureLowStockNotifications() {
  const low = await prisma.product.findMany({
    where: {
      active: true,
      availability: { not: 'MADE_TO_ORDER' },
      stock: { lte: 3 },
    },
    take: 5,
    select: { id: true, name: true, stock: true },
  })

  for (const p of low) {
    const existing = await prisma.adminNotification.findFirst({
      where: {
        type: NotificationType.LOW_STOCK,
        message: { contains: p.name },
        read: false,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    })
    if (!existing) {
      await createNotification({
        type: NotificationType.LOW_STOCK,
        title: 'Low stock',
        message: `${p.name} has only ${p.stock} left`,
        link: `/admin/products`,
      })
    }
  }
}
