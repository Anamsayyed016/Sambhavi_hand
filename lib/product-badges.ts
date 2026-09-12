import type { Product } from '@/lib/products'

/** True when a product belongs to the CHHABILI Navratri edit. */
export function isChhabiliProduct(product: Product): boolean {
  return (
    product.category.trim().toUpperCase() === 'CHHABILI' ||
    product.collections.includes('chhabili') ||
    product.slug.startsWith('chhabili')
  )
}

/** True when a product belongs to the JOBANIYU Navratri edit. */
export function isJobaniyuProduct(product: Product): boolean {
  return (
    product.category.trim().toUpperCase() === 'JOBANIYU' ||
    product.collections.includes('jobaniyu') ||
    product.slug === 'jobaniyu' ||
    product.slug.startsWith('jobaniyu-')
  )
}

/** True when a product belongs to the Lehenga Collection (Navratri nested). */
export function isLehangaProduct(product: Product): boolean {
  const category = product.category.trim().toUpperCase()
  return (
    category === 'LEHENGA COLLECTION' ||
    category === 'LEHANGA' ||
    product.collections.includes('lehanga') ||
    product.slug.startsWith('lehanga-') ||
    product.slug === 'kanchipuram-silk-lehenga'
  )
}

/** True when a product belongs to DHARVI — DURGA POOJA EDITION (Navratri nested). */
export function isDharviProduct(product: Product): boolean {
  return (
    product.category.trim() === 'DHARVI — DURGA POOJA EDITION' ||
    product.collections.includes('dharvi-durga-pooja-edition') ||
    product.slug === 'dharvi-durga-pooja-edition' ||
    product.slug.startsWith('dharvi-')
  )
}

/** Subtle editorial collection label for latest edits. */
export function getEditorialCollectionLabel(product: Product): string | null {
  if (isDharviProduct(product)) return 'NEW COLLECTION'
  if (isJobaniyuProduct(product)) return 'NEW COLLECTION'
  if (isLehangaProduct(product)) return 'NEW EXCLUSIVE DESIGNER LEHENGA'
  if (isChhabiliProduct(product)) return 'NEW COLLECTION'
  return null
}
