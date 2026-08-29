import { getStorefrontProducts, type Product } from '@/lib/products'

/**
 * Storefront product search against existing catalog data (lib/products.ts).
 */
export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  return getStorefrontProducts().filter((p) => {
    const collectionText = p.collections.map((c) => c.replaceAll('-', ' ')).join(' ')
    const haystack = [
      p.name,
      p.category,
      p.fabric,
      p.weave,
      collectionText,
      p.description,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(q)
  })
}
