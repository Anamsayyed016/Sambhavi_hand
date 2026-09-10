import { getPricedStorefrontProducts } from '@/lib/catalog/db-pricing'
import { getProductsForCatalogSlug } from '@/lib/catalog-filters'
import { NewArrivalsCarousel } from '@/components/home/new-arrivals-carousel'

/** Homepage strip — same newest-first, cross-category logic as /collections/new-arrivals. */
export async function NewArrivals() {
  const products = getProductsForCatalogSlug(
    'new-arrivals',
    await getPricedStorefrontProducts(),
  ).slice(0, 8)

  return <NewArrivalsCarousel products={products} />
}
