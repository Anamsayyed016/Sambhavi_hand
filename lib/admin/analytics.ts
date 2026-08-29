import { OrderStatus, PaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { LOW_STOCK_THRESHOLD } from '@/lib/admin/products'

export type DateRangeKey = 'today' | '7d' | '30d' | '90d' | 'year' | 'month'

const paidOrderWhere = {
  paymentStatus: PaymentStatus.PAID,
  status: { not: OrderStatus.CANCELLED },
} as const

function rangeStart(key: DateRangeKey): Date {
  const now = new Date()
  const d = new Date(now)
  switch (key) {
    case 'today':
      d.setHours(0, 0, 0, 0)
      return d
    case '7d':
      d.setDate(d.getDate() - 7)
      return d
    case '30d':
      d.setDate(d.getDate() - 30)
      return d
    case '90d':
      d.setDate(d.getDate() - 90)
      return d
    case 'month':
      d.setDate(1)
      d.setHours(0, 0, 0, 0)
      return d
    case 'year':
      d.setMonth(0, 1)
      d.setHours(0, 0, 0, 0)
      return d
  }
}

export async function getAnalyticsSummary(range: DateRangeKey = '30d') {
  const since = rangeStart(range)
  const where = { ...paidOrderWhere, createdAt: { gte: since } }

  const [orders, paidAgg, customers, productsSold] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.aggregate({
      where,
      _sum: { total: true },
    }),
    prisma.order.findMany({
      where,
      select: { customerEmail: true },
      distinct: ['customerEmail'],
    }),
    prisma.orderItem.aggregate({
      where: { order: where },
      _sum: { quantity: true },
    }),
  ])

  const paidRevenue = paidAgg._sum.total ?? 0
  const orderCount = orders
  const customerCount = customers.length
  const unitsSold = productsSold._sum.quantity ?? 0
  const aov = orderCount > 0 ? Math.round(paidRevenue / orderCount) : 0

  return {
    revenue: paidRevenue,
    paidRevenue,
    orderCount,
    customerCount,
    unitsSold,
    aov,
    since,
  }
}

/** Daily paid-order series for revenue / order charts. */
export async function getDailySeries(days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  since.setHours(0, 0, 0, 0)

  const orders = await prisma.order.findMany({
    where: {
      ...paidOrderWhere,
      createdAt: { gte: since },
    },
    select: { createdAt: true, total: true },
    orderBy: { createdAt: 'asc' },
  })

  const map = new Map<string, { revenue: number; orders: number }>()
  for (let i = 0; i <= days; i++) {
    const d = new Date(since)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    map.set(key, { revenue: 0, orders: 0 })
  }

  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10)
    const row = map.get(key)
    if (row) {
      row.revenue += o.total
      row.orders += 1
    }
  }

  return Array.from(map.entries()).map(([date, v]) => ({ date, ...v }))
}

export async function getTopProductsAnalytics(limit = 10) {
  const grouped = await prisma.orderItem.groupBy({
    by: ['productSlug', 'productName'],
    where: { order: paidOrderWhere },
    _sum: { quantity: true, subtotal: true },
    orderBy: { _sum: { subtotal: 'desc' } },
    take: limit,
  })
  return grouped.map((r) => ({
    productSlug: r.productSlug,
    productName: r.productName,
    unitsSold: r._sum.quantity ?? 0,
    revenue: r._sum.subtotal ?? 0,
  }))
}

export async function getTopCategoriesAnalytics(limit = 10) {
  const items = await prisma.orderItem.findMany({
    select: {
      quantity: true,
      subtotal: true,
      product: { select: { category: true } },
    },
    where: {
      productId: { not: null },
      order: paidOrderWhere,
    },
  })

  const map = new Map<string, { units: number; revenue: number }>()
  for (const item of items) {
    const cat = item.product?.category ?? 'Uncategorized'
    const row = map.get(cat) ?? { units: 0, revenue: 0 }
    row.units += item.quantity
    row.revenue += item.subtotal
    map.set(cat, row)
  }

  return Array.from(map.entries())
    .map(([category, v]) => ({ category, unitsSold: v.units, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}

export async function getOrderStatusBreakdown() {
  const statuses = Object.values(OrderStatus)
  const counts = await Promise.all(
    statuses.map((status) =>
      prisma.order.count({ where: { status } }).then((count) => ({ status, count })),
    ),
  )
  return counts
}

export { LOW_STOCK_THRESHOLD }
