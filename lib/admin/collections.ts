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

export type CollectionSort =
  | 'name_asc'
  | 'name_desc'
  | 'newest'
  | 'oldest'
  | 'products_desc'
  | 'products_asc'

export type CollectionListParams = {
  q?: string
  active?: 'true' | 'false' | 'all'
  sort?: CollectionSort
}

function collectionOrderBy(
  sort: CollectionSort | undefined,
): Prisma.CollectionOrderByWithRelationInput {
  switch (sort) {
    case 'name_desc':
      return { name: 'desc' }
    case 'newest':
      return { createdAt: 'desc' }
    case 'oldest':
      return { createdAt: 'asc' }
    case 'name_asc':
    default:
      return { name: 'asc' }
  }
}

export async function listCollections(params?: CollectionListParams) {
  const where: Prisma.CollectionWhereInput = {}
  if (params?.q?.trim()) {
    where.OR = [
      { name: { contains: params.q.trim(), mode: 'insensitive' } },
      { slug: { contains: params.q.trim(), mode: 'insensitive' } },
    ]
  }
  if (params?.active === 'true') where.active = true
  if (params?.active === 'false') where.active = false

  // Product-count sorts are applied in the page after joining counts.
  const sort = params?.sort
  const dbSort: CollectionSort | undefined =
    sort === 'products_desc' || sort === 'products_asc' ? 'name_asc' : sort

  return prisma.collection.findMany({
    where,
    orderBy: collectionOrderBy(dbSort),
  })
}

export async function getCollectionById(id: string) {
  return prisma.collection.findUnique({ where: { id } })
}

export async function getCollectionBySlug(slug: string) {
  return prisma.collection.findUnique({ where: { slug } })
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
  // Admin membership count — all products that list this collection slug
  // (matches Edit Collection page query; not storefront-visible-only).
  const products = await prisma.product.findMany({
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

/**
 * Set exact membership for one collection slug.
 * - Adds the slug to selected products that lack it
 * - Removes the slug from current members not in productIds
 * - Never removes other collection slugs from a product
 */
export async function setCollectionProducts(collectionSlug: string, productIds: string[]) {
  const desiredIds = Array.from(new Set(productIds))
  const desired = new Set(desiredIds)

  const currentMembers = await prisma.product.findMany({
    where: { collections: { has: collectionSlug } },
    select: { id: true, collections: true },
  })
  const currentIds = new Set(currentMembers.map((p) => p.id))

  const toAddIds = desiredIds.filter((id) => !currentIds.has(id))
  const toRemove = currentMembers.filter((p) => !desired.has(p.id))

  const toAdd =
    toAddIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: toAddIds } },
          select: { id: true, collections: true },
        })
      : []

  const updates = [
    ...toAdd.map((p) => {
      const next = new Set(p.collections)
      next.add(collectionSlug)
      return prisma.product.update({
        where: { id: p.id },
        data: { collections: Array.from(next) },
      })
    }),
    ...toRemove.map((p) =>
      prisma.product.update({
        where: { id: p.id },
        data: { collections: p.collections.filter((s) => s !== collectionSlug) },
      }),
    ),
  ]

  if (updates.length > 0) {
    await prisma.$transaction(updates)
  }
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
