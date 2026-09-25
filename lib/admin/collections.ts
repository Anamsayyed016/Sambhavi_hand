import { Prisma, type Collection } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCatalogTitle, getProductsForCatalogSlug } from '@/lib/catalog-filters'
import { getPricedStorefrontProducts } from '@/lib/catalog/db-pricing'
import { isValidCoverImageUrl } from '@/lib/new-arrivals-catalogs'
import type { Product } from '@/lib/products'

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
 * Read-only storefront product counts for admin dual-metric display.
 * Uses the same catalog source + getProductsForCatalogSlug as /collections/[slug].
 * null = no valid storefront catalog route for that slug (show N/A — not 0).
 */
export async function getCollectionStorefrontProductCounts(
  slugs: string[],
): Promise<Map<string, number | null>> {
  const meta = await getCollectionAdminListMeta(slugs)
  const counts = new Map<string, number | null>()
  for (const [slug, row] of meta) {
    counts.set(slug, row.storefrontCount)
  }
  return counts
}

export type CollectionAdminListMeta = {
  /** null = no storefront catalog route for this slug */
  storefrontCount: number | null
  /**
   * First valid product image from getProductsForCatalogSlug results.
   * UI-only — never written to Collection.image.
   */
  productThumbUrl: string | null
}

function firstValidResolvedProductImage(products: Product[]): string | null {
  for (const product of products) {
    const candidates = [product.image, product.images?.[0]]
    for (const candidate of candidates) {
      if (isValidCoverImageUrl(candidate)) return candidate
    }
  }
  return null
}

/**
 * One catalog load → storefront counts + derived product thumbnails for admin list.
 * Read-only. Does not touch Collection.image or Product.collections.
 */
export async function getCollectionAdminListMeta(
  slugs: string[],
): Promise<Map<string, CollectionAdminListMeta>> {
  const uniqueSlugs = Array.from(new Set(slugs))
  const meta = new Map<string, CollectionAdminListMeta>()

  const catalogSlugs = uniqueSlugs.filter((slug) => Boolean(getCatalogTitle(slug)))
  for (const slug of uniqueSlugs) {
    if (!getCatalogTitle(slug)) {
      meta.set(slug, { storefrontCount: null, productThumbUrl: null })
    }
  }

  if (catalogSlugs.length === 0) return meta

  const products = await getPricedStorefrontProducts()
  for (const slug of catalogSlugs) {
    const resolved = getProductsForCatalogSlug(slug, products)
    meta.set(slug, {
      storefrontCount: resolved.length,
      productThumbUrl: firstValidResolvedProductImage(resolved),
    })
  }
  return meta
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
