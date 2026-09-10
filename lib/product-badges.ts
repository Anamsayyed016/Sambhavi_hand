import type { Product } from '@/lib/products'

/** True when a product belongs to the CHHABILI Navratri edit. */
export function isChhabiliProduct(product: Product): boolean {
  return (
    product.category.trim().toUpperCase() === 'CHHABILI' ||
    product.collections.includes('chhabili') ||
    product.slug.startsWith('chhabili')
  )
}

/** Subtle editorial collection label for the latest CHHABILI edit. */
export function getEditorialCollectionLabel(product: Product): string | null {
  if (isChhabiliProduct(product)) return 'NEW COLLECTION'
  return null
}
