import type { Product } from '@/lib/products'
import {
  getCategoryGroup,
  getSareeCategory,
  isLegacyCollectionSlug,
  type SareeCategory,
} from '@/lib/categories'

export function getProductsForCatalogSlug(slug: string, products: Product[]): Product[] {
  const category = getSareeCategory(slug)
  if (category) {
    return products.filter((p) => p.category === category.name)
  }

  const group = getCategoryGroup(slug)
  if (group) {
    const names = new Set(group.categories.map((c) => c.name))
    return products.filter((p) => names.has(p.category))
  }

  if (slug === 'new-arrivals') {
    return products.filter((p) => p.isNew || p.collections.includes('new-arrivals'))
  }

  if (isLegacyCollectionSlug(slug)) {
    return products.filter((p) => p.collections.includes(slug))
  }

  return []
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
    const group = getCategoryGroup(category.groupSlug)
    return group ? `${group.name} · Browse ${category.name} sarees.` : `Browse ${category.name} sarees.`
  }

  const group = getCategoryGroup(slug)
  if (group) {
    return `Explore ${group.name} sarees by type.`
  }

  return 'Browse sarees in this collection.'
}
