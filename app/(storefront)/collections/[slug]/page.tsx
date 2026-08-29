import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageBanner } from '@/components/layout/page-banner'
import { ProductGrid } from '@/components/product/product-grid'
import {
  categoryGroups,
  getCategoryGroup,
  getSareeCategory,
  isLegacyCollectionSlug,
  legacyCollectionSlugs,
  sareeCategories,
} from '@/lib/categories'
import {
  getCatalogSubtitle,
  getCatalogTitle,
  getProductsForCatalogSlug,
} from '@/lib/catalog-filters'
import { getPricedStorefrontProducts } from '@/lib/catalog/db-pricing'
import { getStorefrontProducts } from '@/lib/products'

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  const groupSlugs = categoryGroups.map((g) => ({ slug: g.slug }))
  const categorySlugs = [
    ...sareeCategories.map((c) => ({ slug: c.slug })),
    { slug: 'kota' },
  ]
  const legacySlugs = legacyCollectionSlugs.map((slug) => ({ slug }))
  return [...groupSlugs, ...categorySlugs, ...legacySlugs]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const title = getCatalogTitle(slug)
  if (!title) return { title: 'Category Not Found' }
  const category = getSareeCategory(slug)
  return {
    title,
    description: getCatalogSubtitle(slug, category),
  }
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const title = getCatalogTitle(slug)
  if (!title) notFound()

  const category = getSareeCategory(slug)
  const group = getCategoryGroup(slug)
  const items = getProductsForCatalogSlug(slug, await getPricedStorefrontProducts())

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/collections' },
    ...(group
      ? [{ label: title }]
      : category
        ? [
            {
              label: getCategoryGroup(category.groupSlug)?.name ?? 'Categories',
              href: `/collections/${category.groupSlug}`,
            },
            { label: title },
          ]
        : [{ label: title }]),
  ]

  return (
    <>
      <PageBanner
        title={title}
        subtitle={getCatalogSubtitle(slug, category)}
        breadcrumbs={breadcrumbs}
      />
      <section className="mx-auto max-w-[88rem] px-5 py-12 md:px-8 md:py-16">
        {group ? (
          <div className="mb-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/collections/${cat.slug}`}
                className="rounded-sm border border-border bg-background px-4 py-3 font-sans text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        ) : null}

        {items.length > 0 ? (
          <ProductGrid products={items} columns="three" expandImages />
        ) : (
          <p className="py-20 text-center font-serif text-xl text-muted-foreground">
            {category || isLegacyCollectionSlug(slug)
              ? 'No sarees in this category yet. Check back soon.'
              : 'No sarees in this group yet. Select a type above or check back soon.'}
          </p>
        )}
      </section>
    </>
  )
}
