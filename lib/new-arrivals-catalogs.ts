import { CHHABILI_HERO_IMAGE } from '@/components/collections/chhabili-collection-hero'
import { getCollectionBySlug } from '@/lib/admin/collections'
import { getProductsForCatalogSlug } from '@/lib/catalog-filters'
import { getPricedStorefrontProducts } from '@/lib/catalog/db-pricing'
import { getSareeCategory } from '@/lib/categories'

/**
 * Curated New Arrivals — category/collection showcase (exact order).
 * Not product-based, not gallery-based.
 */
export const NEW_ARRIVALS_CATALOG_DEFS = [
  {
    slug: 'chhabili',
    name: 'CHHABILI',
    href: '/collections/chhabili',
    blurb: 'Festive silhouettes from our latest collection.',
  },
  {
    slug: 'digital-print',
    name: 'Digital Print',
    href: '/collections/digital-print',
    blurb: 'Soft silk digital prints for everyday elegance.',
  },
  {
    slug: 'kota-handloom',
    name: 'Kota Handloom',
    href: '/collections/kota-handloom',
    blurb: 'Lightweight Kota weaves with refined embroidery.',
  },
] as const

export type NewArrivalsCatalogCard = {
  slug: string
  name: string
  href: string
  blurb: string
  image: string
}

function isUsableCover(image: string | null | undefined): image is string {
  if (!image?.trim()) return false
  // Seed/admin placeholders — prefer a real product primary instead.
  if (image.startsWith('/images/collection-')) return false
  return true
}

/** Resolve one representative cover per curated New Arrivals catalog. */
export async function getNewArrivalsCatalogCards(): Promise<NewArrivalsCatalogCard[]> {
  const products = await getPricedStorefrontProducts()

  return Promise.all(
    NEW_ARRIVALS_CATALOG_DEFS.map(async (def) => {
      const category = getSareeCategory(def.slug)
      const collection = await getCollectionBySlug(def.slug).catch(() => null)
      const categoryProducts = getProductsForCatalogSlug(def.slug, products)
      const primaryFromProduct =
        categoryProducts[0]?.image || categoryProducts[0]?.images?.[0] || null

      let image: string
      if (def.slug === 'chhabili') {
        image =
          (isUsableCover(collection?.image) ? collection!.image : null) ||
          CHHABILI_HERO_IMAGE ||
          primaryFromProduct ||
          '/placeholder.svg'
      } else {
        image =
          (isUsableCover(collection?.image) ? collection!.image : null) ||
          primaryFromProduct ||
          '/placeholder.svg'
      }

      return {
        slug: def.slug,
        name: category?.name ?? def.name,
        href: def.href,
        blurb: def.blurb,
        image,
      }
    }),
  )
}
