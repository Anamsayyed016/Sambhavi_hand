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

export async function listCustomers(params: CustomerListParams = {}) {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20))

  const orders = await prisma.order.findMany({
    where: params.q?.trim()
      ? {
          OR: [
            { customerEmail: { contains: params.q.trim(), mode: 'insensitive' } },
            { customerName: { contains: params.q.trim(), mode: 'insensitive' } },
            { customerPhone: { contains: params.q.trim(), mode: 'insensitive' } },
          ],
        }
      : undefined,
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
        active: o.status !== 'CANCELLED',
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
    where: { customerEmail: { equals: normalized, mode: 'insensitive' } },
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

  const totalSpent = orders.reduce((s, o) => s + o.total, 0)
  const latest = orders[0]

  return {
    email: latest.customerEmail,
    name: latest.customerName,
    phone: latest.customerPhone,
    orderCount: orders.length,
    totalSpent,
    averageOrderValue: Math.round(totalSpent / orders.length),
    lastOrderAt: latest.createdAt,
    orders,
  }
}

export async function getCustomerCount(): Promise<number> {
  const rows = await prisma.order.findMany({
    select: { customerEmail: true },
    distinct: ['customerEmail'],
  })
  return rows.length
}
