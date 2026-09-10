import type { Product } from '@/lib/products'

/** True when a product belongs to the CHHABILI Navratri edit. */
export function isChhabiliProduct(product: Product): boolean {
  return (
    product.category.trim().toUpperCase() === 'CHHABILI' ||
    product.collections.includes('chhabili') ||
    product.slug.startsWith('chhabili')
  )
}

/** True when a product belongs to the LEHANGA collection. */
export function isLehangaProduct(product: Product): boolean {
  return (
    product.category.trim().toUpperCase() === 'LEHANGA' ||
    product.collections.includes('lehanga') ||
    product.slug.startsWith('lehanga-')
  )
}

/** Subtle editorial collection label for latest edits. */
export function getEditorialCollectionLabel(product: Product): string | null {
  if (isLehangaProduct(product)) return 'NEW EXCLUSIVE DESIGNER LEHENGA'
  if (isChhabiliProduct(product)) return 'NEW COLLECTION'
  return null
}
