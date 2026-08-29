import { OrderStatus, PaymentStatus, Prisma, type Order, type OrderItem, type Product } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type OrderListParams = {
  q?: string
  status?: OrderStatus | 'all'
  paymentStatus?: PaymentStatus | 'all'
  sort?: 'newest' | 'oldest'
  page?: number
  pageSize?: number
}

export type OrderListItem = Order & {
  _count: { items: number }
  items: { productName: string; quantity: number }[]
}

export type OrderListResult = {
  items: OrderListItem[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

export type OrderStats = {
  total: number
  pending: number
  processing: number
  shipped: number
  delivered: number
}

export type OrderDetail = Order & {
  items: (OrderItem & {
    product: Pick<Product, 'id' | 'sku' | 'image' | 'slug'> | null
  })[]
}

function buildWhere(params: OrderListParams): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {}

  if (params.q?.trim()) {
    const q = params.q.trim()
    where.OR = [
      { orderNumber: { contains: q, mode: 'insensitive' } },
      { customerName: { contains: q, mode: 'insensitive' } },
      { customerEmail: { contains: q, mode: 'insensitive' } },
      { customerPhone: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (params.status && params.status !== 'all') {
    where.status = params.status
  }

  if (params.paymentStatus && params.paymentStatus !== 'all') {
    where.paymentStatus = params.paymentStatus
  }

  return where
}

export async function getOrderStats(): Promise<OrderStats> {
  const [total, pending, processing, shipped, delivered] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: OrderStatus.PENDING } }),
    prisma.order.count({ where: { status: OrderStatus.PROCESSING } }),
    prisma.order.count({ where: { status: OrderStatus.SHIPPED } }),
    prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
  ])

  return { total, pending, processing, shipped, delivered }
}

export async function listOrders(params: OrderListParams = {}): Promise<OrderListResult> {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20))
  const where = buildWhere(params)
  const orderBy: Prisma.OrderOrderByWithRelationInput =
    params.sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' }

  const [total, items] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { items: true } },
        items: {
          select: { productName: true, quantity: true },
          take: 2,
          orderBy: { productName: 'asc' },
        },
      },
    }),
  ])

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function getOrderById(id: string): Promise<OrderDetail | null> {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, sku: true, image: true, slug: true },
          },
        },
        orderBy: { productName: 'asc' },
      },
    },
  })
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return prisma.order.update({
    where: { id },
    data: { status },
  })
}
