import { OrderStatus, PaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { LOW_STOCK_THRESHOLD } from '@/lib/admin/product-status'

export type DateRangeKey =
  | 'today'
  | 'yesterday'
  | '7d'
  | '30d'
  | '90d'
  | 'month'
  | 'last_month'
  | 'year'
  | 'custom'

export const DASHBOARD_RANGE_OPTIONS: Array<{ key: DateRangeKey; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'month', label: 'This month' },
  { key: 'last_month', label: 'Last month' },
  { key: 'year', label: 'This year' },
  { key: 'custom', label: 'Custom range' },
]

const paidOrderWhere = {
  paymentStatus: PaymentStatus.PAID,
  status: { not: OrderStatus.CANCELLED },
} as const

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

export function parseDateRangeKey(raw: string | null | undefined): DateRangeKey {
  const allowed: DateRangeKey[] = [
    'today',
    'yesterday',
    '7d',
    '30d',
    '90d',
    'month',
    'last_month',
    'year',
    'custom',
  ]
  if (raw && (allowed as string[]).includes(raw)) return raw as DateRangeKey
  return '30d'
}

/** Resolve inclusive calendar range for analytics / dashboard. */
export function resolveDateRange(
  key: DateRangeKey,
  fromIso?: string | null,
  toIso?: string | null,
): { start: Date; end: Date; label: string } {
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  switch (key) {
    case 'today':
      return { start: todayStart, end: todayEnd, label: 'Today' }
    case 'yesterday': {
      const y = new Date(todayStart)
      y.setDate(y.getDate() - 1)
      return { start: startOfDay(y), end: endOfDay(y), label: 'Yesterday' }
    }
    case '7d': {
      const start = new Date(todayStart)
      start.setDate(start.getDate() - 6)
      return { start, end: todayEnd, label: 'Last 7 days' }
    }
    case '30d': {
      const start = new Date(todayStart)
      start.setDate(start.getDate() - 29)
      return { start, end: todayEnd, label: 'Last 30 days' }
    }
    case '90d': {
      const start = new Date(todayStart)
      start.setDate(start.getDate() - 89)
      return { start, end: todayEnd, label: 'Last 90 days' }
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return { start: startOfDay(start), end: todayEnd, label: 'This month' }
    }
    case 'last_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      return { start: startOfDay(start), end: endOfDay(end), label: 'Last month' }
    }
    case 'year': {
      const start = new Date(now.getFullYear(), 0, 1)
      return { start: startOfDay(start), end: todayEnd, label: 'This year' }
    }
    case 'custom': {
      const from = fromIso ? startOfDay(new Date(fromIso)) : new Date(todayStart)
      const to = toIso ? endOfDay(new Date(toIso)) : todayEnd
      const start = from <= to ? from : to
      const end = from <= to ? to : from
      return { start, end, label: 'Custom range' }
    }
  }
}

export async function getAnalyticsSummary(
  range: DateRangeKey = '30d',
  fromIso?: string | null,
  toIso?: string | null,
) {
  const { start, end, label } = resolveDateRange(range, fromIso, toIso)
  const where = {
    ...paidOrderWhere,
    createdAt: { gte: start, lte: end },
  }

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
    since: start,
    until: end,
    label,
  }
}

/** Daily paid-order series between two dates (inclusive). */
export async function getDailySeriesBetween(start: Date, end: Date) {
  const since = startOfDay(start)
  const until = endOfDay(end)
  const dayMs = 24 * 60 * 60 * 1000
  const days = Math.max(0, Math.ceil((until.getTime() - since.getTime()) / dayMs))

  const orders = await prisma.order.findMany({
    where: {
      ...paidOrderWhere,
      createdAt: { gte: since, lte: until },
    },
    select: { createdAt: true, total: true },
    orderBy: { createdAt: 'asc' },
  })

  const map = new Map<string, { revenue: number; orders: number }>()
  for (let i = 0; i <= days; i++) {
    const d = new Date(since)
    d.setDate(d.getDate() + i)
    if (d > until) break
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

/** @deprecated Prefer getDailySeriesBetween — kept for callers using day counts. */
export async function getDailySeries(days = 30) {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - (days - 1))
  start.setHours(0, 0, 0, 0)
  return getDailySeriesBetween(start, end)
}

export async function getTopProductsAnalytics(
  limit = 10,
  range: DateRangeKey = '30d',
  fromIso?: string | null,
  toIso?: string | null,
) {
  const { start, end } = resolveDateRange(range, fromIso, toIso)
  const orderWhere = {
    ...paidOrderWhere,
    createdAt: { gte: start, lte: end },
  }
  const grouped = await prisma.orderItem.groupBy({
    by: ['productSlug', 'productName'],
    where: { order: orderWhere },
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

export async function getTopCategoriesAnalytics(
  limit = 10,
  range: DateRangeKey = '30d',
  fromIso?: string | null,
  toIso?: string | null,
) {
  const { start, end } = resolveDateRange(range, fromIso, toIso)
  const orderWhere = {
    ...paidOrderWhere,
    createdAt: { gte: start, lte: end },
  }
  const items = await prisma.orderItem.findMany({
    select: {
      quantity: true,
      subtotal: true,
      product: { select: { category: true } },
    },
    where: {
      productId: { not: null },
      order: orderWhere,
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

export { LOW_STOCK_THRESHOLD } from '@/lib/admin/product-status'
