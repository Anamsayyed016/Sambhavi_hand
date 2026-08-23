import { Prisma, type Collection } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type CollectionInput = {
  slug: string
  name: string
  description: string
  image: string
  active?: boolean
  featured?: boolean
}

export async function listCollections(params?: { q?: string; active?: 'true' | 'false' | 'all' }) {
  const where: Prisma.CollectionWhereInput = {}
  if (params?.q?.trim()) {
    where.OR = [
      { name: { contains: params.q.trim(), mode: 'insensitive' } },
      { slug: { contains: params.q.trim(), mode: 'insensitive' } },
    ]
  }
  if (params?.active === 'true') where.active = true
  if (params?.active === 'false') where.active = false

  return prisma.collection.findMany({
    where,
    orderBy: { name: 'asc' },
  })
}

export async function getCollectionById(id: string) {
  return prisma.collection.findUnique({ where: { id } })
}

export async function createCollection(data: CollectionInput): Promise<Collection> {
  return prisma.collection.create({
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      image: data.image,
      active: data.active ?? true,
      featured: data.featured ?? false,
    },
  })
}

export async function updateCollection(
  id: string,
  data: Partial<CollectionInput>,
): Promise<Collection> {
  return prisma.collection.update({ where: { id }, data })
}

export async function archiveCollection(id: string): Promise<Collection> {
  return prisma.collection.update({ where: { id }, data: { active: false } })
}

export async function getCollectionProductCounts() {
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { collections: true },
  })
  const counts = new Map<string, number>()
  for (const p of products) {
    for (const slug of p.collections) {
      counts.set(slug, (counts.get(slug) ?? 0) + 1)
    }
  }
  return counts
}

export async function setCollectionProducts(collectionSlug: string, productIds: string[]) {
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, collections: true },
  })

  await prisma.$transaction(
    products.map((p) => {
      const set = new Set(p.collections)
      set.add(collectionSlug)
      return prisma.product.update({
        where: { id: p.id },
        data: { collections: Array.from(set) },
      })
    }),
  )
}

export async function removeProductFromCollection(productId: string, collectionSlug: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { collections: true },
  })
  if (!product) return
  await prisma.product.update({
    where: { id: productId },
    data: { collections: product.collections.filter((s) => s !== collectionSlug) },
  })
}
