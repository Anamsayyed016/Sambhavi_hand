import type { Product } from '@prisma/client'
import { ProductAvailability } from '@prisma/client'

/**
 * Plain JSON template for Duplicate Product form.
 * Safe across RSC → client boundary (no Prisma Decimal / class instances).
 * SKU and slug are omitted — generated server-side on save.
 */
export type ProductDuplicateInitial = {
  name: string
  description: string
  price: string
  originalPrice: string
  image: string
  images: string[]
  videos: string[]
  category: string
  collections: string[]
  fabric: string
  weave: string
  length: string
  blouse: string
  care: string
  availability: ProductAvailability
  stock: string
  active: boolean
  featured: boolean
  isNew: boolean
}

function dedupeUrls(urls: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of urls) {
    const url = raw.trim()
    if (!url || seen.has(url)) continue
    seen.add(url)
    out.push(url)
  }
  return out
}

/**
 * Prefill from a source product for Duplicate.
 * Copies reusable fields; never copies id/sku/slug; stock defaults to 10; status defaults active.
 */
export function buildDuplicateInitialForm(product: Product): ProductDuplicateInitial {
  const images = dedupeUrls(
    product.images.length > 0 ? product.images : product.image ? [product.image] : [],
  )
  return {
    name: product.name,
    description: product.description ?? '',
    price: String(product.price),
    originalPrice: product.originalPrice != null ? String(product.originalPrice) : '',
    image: product.image ?? '',
    images,
    videos: dedupeUrls(product.videos ?? []),
    category: product.category ?? '',
    collections: Array.isArray(product.collections) ? [...product.collections] : [],
    fabric: product.fabric ?? '',
    weave: product.weave ?? '',
    length: product.length ?? '',
    blouse: product.blouse ?? '',
    care: product.care ?? '',
    availability: product.availability ?? ProductAvailability.IN_STOCK,
    stock: '10',
    active: true,
    featured: Boolean(product.featured),
    isNew: Boolean(product.isNew),
  }
}
