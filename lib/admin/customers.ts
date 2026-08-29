import { OrderStatus, PaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type CustomerSummary = {
  email: string
  name: string
  phone: string
  orderCount: number
  totalSpent: number
  lastOrderAt: Date | null
  active: boolean
}

export type CustomerListParams = {
  q?: string
  page?: number
  pageSize?: number
}

const paidOrderWhere = {
  paymentStatus: PaymentStatus.PAID,
  status: { not: OrderStatus.CANCELLED },
} as const

/**
 * Customers are buyers with at least one PAID order.
 * totalSpent sums only verified PAID order totals.
 */
export async function listCustomers(params: CustomerListParams = {}) {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20))

  const orders = await prisma.order.findMany({
    where: {
      ...paidOrderWhere,
      ...(params.q?.trim()
        ? {
            OR: [
              { customerEmail: { contains: params.q.trim(), mode: 'insensitive' as const } },
              { customerName: { contains: params.q.trim(), mode: 'insensitive' as const } },
              { customerPhone: { contains: params.q.trim(), mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
    select: {
      customerEmail: true,
      customerName: true,
      customerPhone: true,
      total: true,
      createdAt: true,
      status: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const map = new Map<string, CustomerSummary>()
  for (const o of orders) {
    const key = o.customerEmail.toLowerCase()
    const existing = map.get(key)
    if (!existing) {
      map.set(key, {
        email: o.customerEmail,
        name: o.customerName,
        phone: o.customerPhone,
        orderCount: 1,
        totalSpent: o.total,
        lastOrderAt: o.createdAt,
        active: true,
      })
    } else {
      existing.orderCount += 1
      existing.totalSpent += o.total
      if (o.createdAt > (existing.lastOrderAt ?? o.createdAt)) {
        existing.lastOrderAt = o.createdAt
        existing.name = o.customerName
        existing.phone = o.customerPhone
      }
    }
  }

  const all = Array.from(map.values()).sort(
    (a, b) => (b.lastOrderAt?.getTime() ?? 0) - (a.lastOrderAt?.getTime() ?? 0),
  )
  const total = all.length
  const items = all.slice((page - 1) * pageSize, page * pageSize)

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function getCustomerByEmail(email: string) {
  const normalized = email.trim().toLowerCase()
  const orders = await prisma.order.findMany({
    where: {
      customerEmail: { equals: normalized, mode: 'insensitive' },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      total: true,
      createdAt: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
    },
  })

  if (orders.length === 0) return null

  const paidOrders = orders.filter(
    (o) => o.paymentStatus === PaymentStatus.PAID && o.status !== OrderStatus.CANCELLED,
  )
  const totalSpent = paidOrders.reduce((s, o) => s + o.total, 0)
  const latest = orders[0]

  return {
    email: latest.customerEmail,
    name: latest.customerName,
    phone: latest.customerPhone,
    orderCount: orders.length,
    paidOrderCount: paidOrders.length,
    totalSpent,
    averageOrderValue:
      paidOrders.length > 0 ? Math.round(totalSpent / paidOrders.length) : 0,
    lastOrderAt: latest.createdAt,
    orders,
  }
}

/** Unique emails with at least one PAID, non-cancelled order. */
export async function getCustomerCount(): Promise<number> {
  const rows = await prisma.order.findMany({
    where: paidOrderWhere,
    select: { customerEmail: true },
    distinct: ['customerEmail'],
  })
  return rows.length
}
