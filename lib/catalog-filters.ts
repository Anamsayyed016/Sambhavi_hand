import type { Product } from '@/lib/products'
import {
  getCategoryGroup,
  getChildCategories,
  getSareeCategory,
  getSareeCategoryByName,
  isKotaCategorySlug,
  isLegacyCollectionSlug,
  type SareeCategory,
} from '@/lib/categories'

/** Legacy + current labels for the Kota category slug. */
export const KOTA_CATEGORY_LABELS = ['Kota', 'Kota Handloom'] as const

export const KOTA_COLLECTION_SLUG = 'kota-collection'

/** True when a product belongs on Kota Handloom collection pages. */
export function isKotaProduct(product: Product): boolean {
  return (
    (KOTA_CATEGORY_LABELS as readonly string[]).includes(product.category) ||
    product.collections.includes(KOTA_COLLECTION_SLUG)
  )
}

export function productMatchesCategory(product: Product, categoryName: string): boolean {
  if (categoryName === 'Kota Handloom') {
    return (KOTA_CATEGORY_LABELS as readonly string[]).includes(product.category)
  }
  if (product.category === categoryName) return true

  // Parent categories include products assigned to nested children (Navratri → CHHABILI).
  const category = getSareeCategoryByName(categoryName)
  if (category) {
    const children = getChildCategories(category.slug)
    if (children.some((child) => child.name === product.category)) return true
  }

  return false
}

function productMatchesCatalogCategory(product: Product, category: SareeCategory): boolean {
  if (isKotaCategorySlug(category.slug)) {
    return isKotaProduct(product)
  }
  if (product.category === category.name) return true
  if (product.collections.includes(category.slug)) return true

  const children = getChildCategories(category.slug)
  if (children.some((child) => product.category === child.name || product.collections.includes(child.slug))) {
    return true
  }

  return false
}

export function getProductsForCatalogSlug(slug: string, products: Product[]): Product[] {
  const category = getSareeCategory(slug)
  if (category) {
    return products.filter((p) => productMatchesCatalogCategory(p, category))
  }

  const group = getCategoryGroup(slug)
  if (group) {
    const names = new Set(group.categories.map((c) => c.name))
    for (const parent of group.categories) {
      for (const child of getChildCategories(parent.slug)) {
        names.add(child.name)
      }
    }
    return products.filter(
      (p) =>
        names.has(p.category) ||
        (names.has('Kota Handloom') && (KOTA_CATEGORY_LABELS as readonly string[]).includes(p.category)),
    )
  }

  if (slug === 'new-arrivals') {
    // Cross-category unique products/catalogs, newest first — never gallery frames.
    return sortProductsNewestFirst(uniqueProductsBySlug(products))
  }

  if (isLegacyCollectionSlug(slug)) {
    return products.filter((p) => p.collections.includes(slug))
  }

  return []
}

/** One entry per product slug (stable catalog identity). */
export function uniqueProductsBySlug(products: Product[]): Product[] {
  const seen = new Set<string>()
  const unique: Product[] = []
  for (const product of products) {
    if (seen.has(product.slug)) continue
    seen.add(product.slug)
    unique.push(product)
  }
  return unique
}

function createdAtMs(product: Product): number {
  if (!product.createdAt) return 0
  const value = Date.parse(product.createdAt)
  return Number.isFinite(value) ? value : 0
}

/** Newest catalog additions first — any category/collection. */
export function sortProductsNewestFirst(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const delta = createdAtMs(b) - createdAtMs(a)
    if (delta !== 0) return delta
    // Stable tie-break: prefer explicit isNew, then slug (never alpha name sort as primary).
    return Number(b.isNew ?? 0) - Number(a.isNew ?? 0) || a.slug.localeCompare(b.slug)
  })
}

export function getCatalogTitle(slug: string): string | undefined {
  const category = getSareeCategory(slug)
  if (category) return category.name

  const group = getCategoryGroup(slug)
  if (group) return group.name

  const legacyTitles: Record<string, string> = {
    'new-arrivals': 'New Arrivals',
    'silk-sarees': 'Silk Sarees',
    'banarasi-sarees': 'Banarasi Sarees',
    'cotton-handloom': 'Cotton Handloom',
    'festive-collection': 'Festive Collection',
    'wedding-collection': 'Wedding Collection',
  }

  return legacyTitles[slug]
}

export function getCatalogSubtitle(slug: string, category?: SareeCategory): string {
  if (category) {
    if (category.slug === 'chhabili') {
      return 'NEW COLLECTION · Explore the Chhabili festive collection.'
    }
    if (category.slug === 'jobaniyu') {
      return 'NEW COLLECTION · Explore the Jobaniyu festive collection.'
    }
    if (category.slug === 'lehanga') {
      return 'NAVRATRI COLLECTION · Explore the Lehenga Collection.'
    }
    if (category.slug === 'dharvi-durga-pooja-edition') {
      return 'NAVRATRI COLLECTION · Explore the Dharvi Durga Pooja Edition.'
    }
    const group = getCategoryGroup(category.groupSlug)
    return group ? `${group.name} · Browse ${category.name} sarees.` : `Browse ${category.name} sarees.`
  }

  const group = getCategoryGroup(slug)
  if (group) {
    return `Explore ${group.name} sarees by type.`
  }

  if (slug === 'new-arrivals') {
    return 'New products and collections, thoughtfully curated.'
  }

  return 'Browse sarees in this collection.'
}
