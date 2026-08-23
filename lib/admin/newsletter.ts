import { prisma } from '@/lib/prisma'

export async function listNewsletterSubscribers(params?: {
  q?: string
  page?: number
  pageSize?: number
}) {
  const page = Math.max(1, params?.page ?? 1)
  const pageSize = Math.min(50, Math.max(1, params?.pageSize ?? 20))
  const where = params?.q?.trim()
    ? { email: { contains: params.q.trim(), mode: 'insensitive' as const } }
    : {}

  const [total, items] = await Promise.all([
    prisma.newsletterSubscriber.count({ where }),
    prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { subscribedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) }
}
