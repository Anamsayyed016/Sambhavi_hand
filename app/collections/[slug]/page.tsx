import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageBanner } from '@/components/layout/page-banner'
import { ProductGrid } from '@/components/product/product-grid'
import { collections, getCollection } from '@/lib/content'
import { products } from '@/lib/products'

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const collection = getCollection(slug)
  if (!collection) return { title: 'Collection Not Found' }
  return {
    title: collection.name,
    description: collection.description,
  }
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const collection = getCollection(slug)
  if (!collection) notFound()

  const items = products.filter((p) => p.collections.includes(slug))

  return (
    <>
      <PageBanner
        title={collection.name}
        subtitle={collection.description}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Collections', href: '/collections' },
          { label: collection.name },
        ]}
      />
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        {items.length > 0 ? (
          <ProductGrid products={items} columns="three" />
        ) : (
          <p className="py-20 text-center font-serif text-xl text-muted-foreground">
            New pieces for this collection are on the loom. Check back soon.
          </p>
        )}
      </section>
    </>
  )
}
