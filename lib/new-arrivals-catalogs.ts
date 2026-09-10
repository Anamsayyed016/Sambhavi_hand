import { CHHABILI_HERO_IMAGE } from '@/components/collections/chhabili-collection-hero'
import { getProductsForCatalogSlug } from '@/lib/catalog-filters'
import { getSareeCategory } from '@/lib/categories'
import { getStorefrontProducts, type Product } from '@/lib/products'

/**
 * Curated New Arrivals — category/collection showcase (exact order).
 * Not product grids. Not gallery frames. Not ProductCards.
 */
export const NEW_ARRIVALS_CATALOG_DEFS = [
  {
    slug: 'lehanga',
    name: 'LEHANGA',
    href: '/collections/lehanga',
    blurb: 'New exclusive designer lehenga in pure Kanjiveram silk.',
  },
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
  /** Valid HTTPS Cloudinary (or equivalent) URL — never a missing local path. */
  image: string | null
}

/**
 * Known-good existing catalog primaries (same Cloudinary URLs already on products).
 * Used when DB/collection cover is missing or invalid — does not change product data.
 */
const KNOWN_VALID_COVERS: Record<string, string> = {
  lehanga:
    'https://res.cloudinary.com/tcjtyr02/image/upload/v1789041228/WhatsApp_Image_2026-09-10_at_11.18.13_AM_1.jpg',
  chhabili: CHHABILI_HERO_IMAGE,
  'digital-print':
    'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916480/WhatsApp_Image_2026-08-28_at_4.02.44_PM.jpg',
  'kota-handloom':
    'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916346/WhatsApp_Image_2026-08-28_at_4.03.20_PM_1.jpg',
}

/** Reject missing seed covers and anything that would render a broken <img>. */
export function isValidCoverImageUrl(url: string | null | undefined): url is string {
  const value = url?.trim() ?? ''
  if (!value) return false
  if (value.startsWith('/images/collection-')) return false
  if (value === '/placeholder.svg') return false
  if (value.startsWith('/')) return false
  return /^https?:\/\//i.test(value)
}

function firstValidProductPrimary(products: Product[]): string | null {
  for (const product of products) {
    const candidates = [product.image, product.images?.[0]]
    for (const candidate of candidates) {
      if (isValidCoverImageUrl(candidate)) return candidate
    }
  }
  return null
}

/**
 * Resolve one representative cover per curated catalog.
 * Prefer static storefront catalog (stable Cloudinary URLs) over DB collection.image,
 * which is often seeded to `/images/collection-silk.png` (file does not exist → broken img).
 */
export function getNewArrivalsCatalogCards(): NewArrivalsCatalogCard[] {
  const products = getStorefrontProducts()

  return NEW_ARRIVALS_CATALOG_DEFS.map((def) => {
    const category = getSareeCategory(def.slug)
    const categoryProducts = getProductsForCatalogSlug(def.slug, products)
    const fromProduct = firstValidProductPrimary(categoryProducts)
    const known = KNOWN_VALID_COVERS[def.slug] ?? null

    const image =
      (isValidCoverImageUrl(fromProduct) ? fromProduct : null) ||
      (isValidCoverImageUrl(known) ? known : null)

    return {
      slug: def.slug,
      name: category?.name ?? def.name,
      href: def.href,
      blurb: def.blurb,
      image,
    }
  })
}
