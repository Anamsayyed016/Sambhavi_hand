import { OrderStatus, PaymentStatus, ProductAvailability } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { LOW_STOCK_THRESHOLD } from '@/lib/admin/products'
import { getCustomerCount } from '@/lib/admin/customers'
import { getDailySeries } from '@/lib/admin/analytics'

export type DashboardStats = {
  revenue: number
  paidRevenue: number
  orderCount: number
  productCount: number
  activeProductCount: number
  lowStockCount: number
  customerCount: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  deliveredOrders: number
  hasOrders: boolean
  salesToday: number
  sales7d: number
  sales30d: number
  salesMonth: number
  salesYear: number
  ordersToday: number
  orders7d: number
  orders30d: number
}

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function startOfMonth() {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfYear() {
  const d = new Date()
  d.setMonth(0, 1)
  d.setHours(0, 0, 0, 0)
  return d
}

async function sumOrdersSince(since: Date) {
  const [agg, count] = await Promise.all([
    prisma.order.aggregate({ where: { createdAt: { gte: since } }, _sum: { total: true } }),
    prisma.order.count({ where: { createdAt: { gte: since } } }),
  ])
  return { revenue: agg._sum.total ?? 0, orders: count }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = startOfToday()
  const d7 = daysAgo(7)
  const d30 = daysAgo(30)
  const month = startOfMonth()
  const year = startOfYear()

  const [
    revenueAgg,
    paidAgg,
    orderCount,
    productCount,
    activeProductCount,
    lowStockCount,
    customerCount,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    todayStats,
    stats7d,
    stats30d,
    monthStats,
    yearStats,
  ] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.order.aggregate({
      where: { paymentStatus: PaymentStatus.PAID },
      _sum: { total: true },
    }),
    prisma.order.count(),
    prisma.product.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({
      where: {
        active: true,
        OR: [
          { availability: ProductAvailability.LOW_STOCK },
          { stock: { lte: LOW_STOCK_THRESHOLD } },
        ],
      },
    }),
    getCustomerCount(),
    prisma.order.count({ where: { status: OrderStatus.PENDING } }),
    prisma.order.count({ where: { status: OrderStatus.PROCESSING } }),
    prisma.order.count({ where: { status: OrderStatus.SHIPPED } }),
    prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
    sumOrdersSince(today),
    sumOrdersSince(d7),
    sumOrdersSince(d30),
    sumOrdersSince(month),
    sumOrdersSince(year),
  ])

  return {
    revenue: revenueAgg._sum.total ?? 0,
    paidRevenue: paidAgg._sum.total ?? 0,
    orderCount,
    productCount,
    activeProductCount,
    lowStockCount,
    customerCount,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    hasOrders: orderCount > 0,
    salesToday: todayStats.revenue,
    sales7d: stats7d.revenue,
    sales30d: stats30d.revenue,
    salesMonth: monthStats.revenue,
    salesYear: yearStats.revenue,
    ordersToday: todayStats.orders,
    orders7d: stats7d.orders,
    orders30d: stats30d.orders,
  }
}

export async function getDashboardCharts() {
  return getDailySeries(30)
}

export async function getRecentOrders(limit = 5) {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      total: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
    },
  })
}

export async function getTopProducts(limit = 5) {
  const grouped = await prisma.orderItem.groupBy({
    by: ['productId', 'productName', 'productSlug'],
    _sum: { quantity: true, subtotal: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: limit,
  })

  return grouped.map((row) => ({
    productId: row.productId,
    productName: row.productName,
    productSlug: row.productSlug,
    unitsSold: row._sum.quantity ?? 0,
    revenue: row._sum.subtotal ?? 0,
  }))
}

export async function getLowStockProducts(limit = 8) {
  return prisma.product.findMany({
    where: {
      active: true,
      OR: [
        { availability: ProductAvailability.LOW_STOCK },
        { stock: { lte: LOW_STOCK_THRESHOLD } },
      ],
    },
    orderBy: { stock: 'asc' },
    take: limit,
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      availability: true,
      image: true,
      price: true,
    },
  })
}
