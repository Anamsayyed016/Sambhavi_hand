import { PaymentStatus, ProductAvailability } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { LOW_STOCK_THRESHOLD } from '@/lib/admin/products'

export type DashboardStats = {
  revenue: number
  orderCount: number
  productCount: number
  activeProductCount: number
  lowStockCount: number
  hasOrders: boolean
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [paidAgg, orderCount, productCount, activeProductCount, lowStockCount] = await Promise.all([
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
  ])

  return {
    revenue: paidAgg._sum.total ?? 0,
    orderCount,
    productCount,
    activeProductCount,
    lowStockCount,
    hasOrders: orderCount > 0,
  }
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
