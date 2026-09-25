import { Prisma, ProductAvailability, ProductStatus, type Product } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { ProductInput, ProductPatch } from '@/lib/admin/validation'
import { dedupeImageUrls } from '@/lib/admin/validation'
import { categoryNames } from '@/lib/categories'
import {
  activeMirrorForStatus,
  LOW_STOCK_THRESHOLD,
  statusFromActiveFlag,
} from '@/lib/admin/product-status'
import { setProductStatus } from '@/lib/admin/product-lifecycle'

export { LOW_STOCK_THRESHOLD }

export type ProductListParams = {
  q?: string
  category?: string
  collection?: string
  active?: 'true' | 'false' | 'all'
  availability?: ProductAvailability | 'all'
  sort?: 'updated' | 'name' | 'price_asc' | 'price_desc' | 'stock'
  page?: number
  pageSize?: number
}

export type ProductListResult = {
  items: Product[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

function buildWhere(params: ProductListParams): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {}

  if (params.q?.trim()) {
    const q = params.q.trim()
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { sku: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
      { category: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (params.category && params.category !== 'all') {
    where.category = params.category
  }

  if (params.collection && params.collection !== 'all') {
    where.collections = { has: params.collection }
  }

  // Admin filter "active" maps to status (authoritative).
  if (params.active === 'true') where.status = ProductStatus.ACTIVE
  if (params.active === 'false') {
    where.status = { in: [ProductStatus.DRAFT, ProductStatus.ARCHIVED] }
  }

  if (params.availability && params.availability !== 'all') {
    where.availability = params.availability
  }

  return where
}

function buildOrderBy(sort?: ProductListParams['sort']): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case 'name':
      return { name: 'asc' }
    case 'price_asc':
      return { price: 'asc' }
    case 'price_desc':
      return { price: 'desc' }
    case 'stock':
      return { stock: 'asc' }
    case 'updated':
    default:
      return { updatedAt: 'desc' }
  }
}

export async function listProducts(params: ProductListParams = {}): Promise<ProductListResult> {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20))
  const where = buildWhere(params)

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: buildOrderBy(params.sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
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

export async function getProductById(id: string): Promise<Product | null> {
  return prisma.product.findUnique({ where: { id } })
}

export async function createProduct(data: ProductInput): Promise<Product> {
  // Preserve current UX: create as ACTIVE unless explicitly deactivated (maps to ARCHIVED).
  const status = statusFromActiveFlag(data.active)
  const images = dedupeImageUrls(
    data.images.length ? data.images : data.image ? [data.image] : [],
  )
  return prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      description: data.description,
      price: data.price,
      originalPrice: data.originalPrice,
      image: data.image,
      images: images.length ? images : [data.image],
      category: data.category,
      collections: data.collections,
      fabric: data.fabric,
      weave: data.weave,
      length: data.length,
      blouse: data.blouse,
      care: data.care,
      availability: data.availability,
      stock: data.stock,
      status,
      active: activeMirrorForStatus(status),
      featured: data.featured,
      isNew: data.isNew,
    },
  })
}

export async function updateProduct(id: string, data: ProductPatch): Promise<Product> {
  const patch: Prisma.ProductUpdateInput = {}

  if (data.name !== undefined) patch.name = data.name
  if (data.slug !== undefined) patch.slug = data.slug
  if (data.sku !== undefined) patch.sku = data.sku
  if (data.description !== undefined) patch.description = data.description
  if (data.price !== undefined) patch.price = data.price
  if (data.originalPrice !== undefined) patch.originalPrice = data.originalPrice
  if (data.image !== undefined) patch.image = data.image
  if (data.images !== undefined) {
    const images = dedupeImageUrls(data.images)
    patch.images = images.length
      ? images
      : data.image
        ? [data.image]
        : undefined
  }
  if (data.category !== undefined) patch.category = data.category
  // Omit collections from the patch when undefined so unrelated edits cannot wipe membership.
  if (data.collections !== undefined) patch.collections = data.collections
  if (data.fabric !== undefined) patch.fabric = data.fabric
  if (data.weave !== undefined) patch.weave = data.weave
  if (data.length !== undefined) patch.length = data.length
  if (data.blouse !== undefined) patch.blouse = data.blouse
  if (data.care !== undefined) patch.care = data.care
  if (data.availability !== undefined) patch.availability = data.availability
  if (data.stock !== undefined) patch.stock = data.stock
  if (data.featured !== undefined) patch.featured = data.featured
  if (data.isNew !== undefined) patch.isNew = data.isNew

  // Lifecycle changes go through the helper so status + active cannot drift.
  if (data.active !== undefined) {
    const status = statusFromActiveFlag(data.active)
    if (Object.keys(patch).length > 0) {
      await prisma.product.update({ where: { id }, data: patch })
    }
    return setProductStatus(id, status)
  }

  return prisma.product.update({ where: { id }, data: patch })
}

/** Soft-archive via authoritative status. */
export async function archiveProduct(id: string): Promise<Product> {
  return setProductStatus(id, ProductStatus.ARCHIVED)
}

export async function getProductFilterOptions() {
  const [categories, collections] = await Promise.all([
    prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    }),
    prisma.collection.findMany({
      select: { slug: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return {
    categories: Array.from(new Set([...categoryNames, ...categories.map((c) => c.category)])).sort(
      (a, b) => a.localeCompare(b),
    ),
    collections,
  }
}

export function isLowStock(product: Pick<Product, 'stock' | 'availability'>): boolean {
  if (product.availability === ProductAvailability.MADE_TO_ORDER) return false
  return (
    product.availability === ProductAvailability.LOW_STOCK ||
    product.stock <= LOW_STOCK_THRESHOLD
  )
}
