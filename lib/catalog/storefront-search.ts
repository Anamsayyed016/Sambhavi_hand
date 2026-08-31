import { ProductAvailability, type Product as DbProduct, type Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { isStorefrontProductVisible } from '@/lib/payment-test-mode'
import type { Product } from '@/lib/products'

export const DEFAULT_SEARCH_PAGE_SIZE = 20
export const MAX_SUGGESTION_LIMIT = 8

export type StorefrontSearchParams = {
  q: string
  page?: number
  pageSize?: number
}

export type StorefrontSearchResult = {
  query: string
  items: Product[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

function mapAvailability(value: ProductAvailability): Product['availability'] {
  switch (value) {
    case ProductAvailability.IN_STOCK:
      return 'In Stock'
    case ProductAvailability.LOW_STOCK:
      return 'Low Stock'
    case ProductAvailability.MADE_TO_ORDER:
      return 'Made to Order'
    default:
      return 'In Stock'
  }
}

/** Map a database product row to the storefront Product shape. */
export function mapDbProductToStorefront(row: DbProduct): Product {
  return {
    slug: row.slug,
    name: row.name,
    price: row.price,
    originalPrice: row.originalPrice ?? undefined,
    image: row.image,
    images: row.images.length > 0 ? row.images : [row.image],
    category: row.category,
    collections: row.collections,
    fabric: row.fabric,
    weave: row.weave,
    length: row.length,
    blouse: row.blouse,
    care: row.care,
    availability: mapAvailability(row.availability),
    isNew: row.isNew,
    description: row.description,
  }
}

function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ')
}

function searchTerms(query: string): string[] {
  const normalized = normalizeQuery(query).toLowerCase()
  const parts = normalized.split(' ').filter((part) => part.length >= 2)
  return parts.length > 0 ? parts : normalized ? [normalized] : []
}

function buildSearchWhere(query: string, collectionSlugs: string[]): Prisma.ProductWhereInput {
  const normalized = normalizeQuery(query)
  const terms = searchTerms(query)
  const or: Prisma.ProductWhereInput[] = [
    { name: { contains: normalized, mode: 'insensitive' } },
    { description: { contains: normalized, mode: 'insensitive' } },
    { category: { contains: normalized, mode: 'insensitive' } },
    { fabric: { contains: normalized, mode: 'insensitive' } },
    { weave: { contains: normalized, mode: 'insensitive' } },
    { sku: { contains: normalized, mode: 'insensitive' } },
  ]

  for (const term of terms) {
    or.push(
      { name: { contains: term, mode: 'insensitive' } },
      { category: { contains: term, mode: 'insensitive' } },
      { fabric: { contains: term, mode: 'insensitive' } },
      { weave: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
      { sku: { contains: term, mode: 'insensitive' } },
    )
  }

  if (collectionSlugs.length > 0) {
    or.push({ collections: { hasSome: collectionSlugs } })
  }

  return {
    active: true,
    OR: or,
  }
}

function scoreProduct(row: DbProduct, query: string): number {
  const q = normalizeQuery(query).toLowerCase()
  if (!q) return 0

  const terms = searchTerms(query)
  const name = row.name.toLowerCase()
  const category = row.category.toLowerCase()
  const fabric = row.fabric.toLowerCase()
  const weave = row.weave.toLowerCase()
  const description = row.description.toLowerCase()
  const sku = row.sku.toLowerCase()
  const collectionText = row.collections.map((slug) => slug.replaceAll('-', ' ')).join(' ')

  let score = 0

  if (name === q) score += 200
  if (name.includes(q)) score += 120
  if (name.startsWith(q)) score += 40

  for (const term of terms) {
    if (name.includes(term)) score += 60
    if (category.includes(term)) score += 35
    if (collectionText.includes(term)) score += 30
    if (fabric.includes(term)) score += 28
    if (weave.includes(term)) score += 24
    if (sku.includes(term)) score += 20
    if (description.includes(term)) score += 12
  }

  if (category.includes(q)) score += 45
  if (collectionText.includes(q)) score += 40
  if (fabric.includes(q)) score += 38
  if (weave.includes(q)) score += 32
  if (sku.includes(q)) score += 25
  if (description.includes(q)) score += 15

  return score
}

async function matchingCollectionSlugs(query: string): Promise<string[]> {
  const normalized = normalizeQuery(query)
  const terms = searchTerms(query)
  const or: Prisma.CollectionWhereInput[] = [
    { name: { contains: normalized, mode: 'insensitive' } },
    { slug: { contains: normalized.replaceAll(' ', '-'), mode: 'insensitive' } },
    { description: { contains: normalized, mode: 'insensitive' } },
  ]

  for (const term of terms) {
    or.push(
      { name: { contains: term, mode: 'insensitive' } },
      { slug: { contains: term, mode: 'insensitive' } },
    )
  }

  const rows = await prisma.collection.findMany({
    where: { OR: or },
    select: { slug: true },
    take: 20,
  })

  return rows.map((row) => row.slug)
}

export async function searchStorefrontProducts(
  params: StorefrontSearchParams,
): Promise<StorefrontSearchResult> {
  const query = normalizeQuery(params.q)
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? DEFAULT_SEARCH_PAGE_SIZE))

  if (!query) {
    return { query: '', items: [], total: 0, page: 1, pageSize, pageCount: 1 }
  }

  const collectionSlugs = await matchingCollectionSlugs(query)
  const rows = await prisma.product.findMany({
    where: buildSearchWhere(query, collectionSlugs),
    orderBy: { updatedAt: 'desc' },
  })

  const ranked = rows
    .filter((row) => isStorefrontProductVisible(row.slug))
    .map((row) => ({ row, score: scoreProduct(row, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.row.name.localeCompare(b.row.name))

  const total = ranked.length
  const start = (page - 1) * pageSize
  const items = ranked.slice(start, start + pageSize).map((entry) => mapDbProductToStorefront(entry.row))

  return {
    query,
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  }
}

/** Lightweight suggestion list for navbar/typeahead (same relevance rules). */
export async function searchStorefrontSuggestions(
  query: string,
  limit = MAX_SUGGESTION_LIMIT,
): Promise<Product[]> {
  const result = await searchStorefrontProducts({
    q: query,
    page: 1,
    pageSize: Math.min(limit, MAX_SUGGESTION_LIMIT),
  })
  return result.items
}
