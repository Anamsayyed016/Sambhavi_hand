import { prisma } from '@/lib/prisma'

export type SearchResults = {
  products: { id: string; name: string; slug: string; sku: string }[]
  orders: { id: string; orderNumber: string; customerName: string }[]
  customers: { email: string; name: string }[]
}

export async function adminSearch(q: string, limit = 5): Promise<SearchResults> {
  const term = q.trim()
  if (term.length < 2) {
    return { products: [], orders: [], customers: [] }
  }

  const [products, orders] = await Promise.all([
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { slug: { contains: term, mode: 'insensitive' } },
          { sku: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: { id: true, name: true, slug: true, sku: true },
    }),
    prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: term, mode: 'insensitive' } },
          { customerName: { contains: term, mode: 'insensitive' } },
          { customerEmail: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: { id: true, orderNumber: true, customerName: true },
    }),
  ])

  const orderCustomers = await prisma.order.findMany({
    where: {
      OR: [
        { customerName: { contains: term, mode: 'insensitive' } },
        { customerEmail: { contains: term, mode: 'insensitive' } },
        { customerPhone: { contains: term, mode: 'insensitive' } },
      ],
    },
    take: limit * 2,
    select: { customerEmail: true, customerName: true },
    distinct: ['customerEmail'],
  })

  const customers = orderCustomers.slice(0, limit).map((c) => ({
    email: c.customerEmail,
    name: c.customerName,
  }))

  return { products, orders, customers }
}
