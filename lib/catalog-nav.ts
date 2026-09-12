import {
  categoryGroups,
  getChildCategories,
  type CategoryGroup,
  type SareeCategory,
} from '@/lib/categories'
import { getProductsForCatalogSlug } from '@/lib/catalog-filters'
import { isValidCoverImageUrl } from '@/lib/new-arrivals-catalogs'
import type { Product } from '@/lib/products'

/**
 * Public Categories dropdown visibility.
 * Empty categories stay in the data model / routes — only hidden from nav until they have content.
 */

export function categoryHasStorefrontContent(slug: string, products: Product[]): boolean {
  const list = getProductsForCatalogSlug(slug, products)
  return list.some(
    (product) =>
      isValidCoverImageUrl(product.image) || isValidCoverImageUrl(product.images?.[0]),
  )
}

/** Nested children under a visible parent (e.g. CHHABILI / DHARVI under Navratri). */
export function getVisibleNavChildCategories(
  parentSlug: string,
  _products: Product[],
): SareeCategory[] {
  // Nested catalogs are structural — keep them linkable before products land.
  return getChildCategories(parentSlug)
}

/**
 * Category groups for the public Categories mega-menu / mobile accordion.
 * A leaf category is visible when it has ≥1 product with a valid primary image,
 * or when it has a visible nested child with content.
 * Groups with zero visible categories are omitted from the dropdown.
 */
export function getVisibleNavCategoryGroups(products: Product[]): CategoryGroup[] {
  return categoryGroups
    .map((group) => ({
      ...group,
      categories: group.categories.filter(
        (category) =>
          categoryHasStorefrontContent(category.slug, products) ||
          getVisibleNavChildCategories(category.slug, products).length > 0,
      ),
    }))
    .filter((group) => group.categories.length > 0)
}
