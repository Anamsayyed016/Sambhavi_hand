import { NotificationType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

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
}) {
  return prisma.adminNotification.create({ data: input })
}

export async function notifyNewOrder(orderNumber: string, customerName: string, total: number) {
  return createNotification({
    type: NotificationType.NEW_ORDER,
    title: 'New order',
    message: `${customerName} placed order #${orderNumber} (₹${total.toLocaleString('en-IN')})`,
    link: `/admin/orders`,
  })
}

export async function ensureLowStockNotifications() {
  const low = await prisma.product.findMany({
    where: { active: true, stock: { lte: 3 } },
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
