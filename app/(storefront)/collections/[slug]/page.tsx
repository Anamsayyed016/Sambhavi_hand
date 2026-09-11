import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageBanner } from '@/components/layout/page-banner'
import { ProductGrid } from '@/components/product/product-grid'
import {
  categoryGroups,
  getCategoryGroup,
  getChildCategories,
  getParentCategory,
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
import { getCollectionBySlug } from '@/lib/admin/collections'
import { ChhabiliCollectionHero } from '@/components/collections/chhabili-collection-hero'

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
  const description = getCatalogSubtitle(slug, category)

  if (category?.slug === 'chhabili') {
    return {
      title: 'CHHABILI | Sambhavi Handloom',
      description:
        'Explore CHHABILI from the Navratri Collection festive edit by Sambhavi Handloom.',
    }
  }

  if (category?.slug === 'jobaniyu') {
    return {
      title: 'JOBANIYU | Sambhavi Handloom',
      description:
        'Explore JOBANIYU from the Navratri Collection festive edit by Sambhavi Handloom.',
    }
  }

  if (category?.slug === 'lehanga') {
    return {
      title: 'LEHANGA | Sambhavi Handloom',
      description: 'Explore the LEHANGA collection by Sambhavi Handloom.',
    }
  }

  return {
    title,
    description,
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
  const parent = category ? getParentCategory(category) : undefined
  const children = category ? getChildCategories(category.slug) : []
  const items = getProductsForCatalogSlug(slug, await getPricedStorefrontProducts())

  const childMeta = await Promise.all(
    children.map(async (child) => {
      const collection = await getCollectionBySlug(child.slug).catch(() => null)
      return {
        category: child,
        image: collection?.active !== false ? collection?.image ?? null : null,
        description:
          collection?.description?.trim() ||
          `Explore the ${child.name} festive collection.`,
        active: collection?.active !== false,
      }
    }),
  )

  const ownCollection =
    category && !group
      ? await getCollectionBySlug(category.slug).catch(() => null)
      : null

  const isChhabili = category?.slug === 'chhabili'
  /**
   * Gallery-frame expansion (one card per images[]) is ONLY for traditional
   * handloom/powerloom saree category browsing.
   */
  const expandImages =
    !isChhabili &&
    Boolean(category) &&
    !category.parentSlug &&
    category.groupSlug === 'handloom-powerloom'

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
            ...(parent
              ? [
                  {
                    label: parent.name,
                    href: `/collections/${parent.slug}`,
                  },
                ]
              : []),
            { label: title },
          ]
        : [{ label: title }]),
  ]

  return (
    <>
      {isChhabili ? (
        <ChhabiliCollectionHero breadcrumbs={breadcrumbs} />
      ) : (
        <PageBanner
          title={title}
          subtitle={
            ownCollection?.description?.trim() || getCatalogSubtitle(slug, category)
          }
          breadcrumbs={breadcrumbs}
        />
      )}
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

        {childMeta.filter((c) => c.active).length > 0 ? (
          <div className="mb-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {childMeta
              .filter((c) => c.active)
              .map(({ category: child, image, description }) => (
                <Link
                  key={child.slug}
                  href={`/collections/${child.slug}`}
                  className="group overflow-hidden rounded-sm border border-border bg-background transition-colors hover:border-primary"
                >
                  <div className="relative aspect-[4/5] bg-muted">
                    {image ? (
                      <Image
                        src={image}
                        alt={child.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-6 text-center font-serif text-2xl tracking-[0.18em] text-muted-foreground">
                        {child.name}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 px-5 py-5">
                    <h2 className="font-serif text-xl tracking-[0.12em] text-foreground">
                      {child.name}
                    </h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                    <span className="inline-block pt-1 text-xs uppercase tracking-[0.16em] text-primary">
                      Explore {child.name}
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        ) : null}

        {ownCollection?.image &&
        category &&
        !children.length &&
        !isChhabili &&
        !ownCollection.image.startsWith('/images/collection-') ? (
          <div className="relative mb-10 hidden aspect-[21/9] overflow-hidden rounded-sm bg-muted md:block">
            <Image
              src={ownCollection.image}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1408px) 100vw, 1408px"
              priority
            />
          </div>
        ) : null}

        {items.length > 0 ? (
          <ProductGrid
            products={items}
            columns="three"
            expandImages={expandImages}
          />
        ) : (
          <p className="py-20 text-center font-serif text-xl text-muted-foreground">
            {category || isLegacyCollectionSlug(slug)
              ? children.length > 0
                ? 'Explore a sub-collection above, or check back soon for more sarees.'
                : category?.slug === 'lehanga'
                  ? 'No pieces in this collection yet. Check back soon.'
                  : 'No sarees in this category yet. Check back soon.'
              : 'No sarees in this group yet. Select a type above or check back soon.'}
          </p>
        )}
      </section>
    </>
  )
}
