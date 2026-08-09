import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageBanner } from '@/components/layout/page-banner'
import { ProductDetail } from '@/components/product/product-detail'
import { ProductGrid } from '@/components/product/product-grid'
import { SectionHeader } from '@/components/layout/section-header'
import { products, getProduct, getRelatedProducts } from '@/lib/products'

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return { title: 'Saree Not Found' }
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image }],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) notFound()

  const related = getRelatedProducts(slug, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability:
        product.availability === 'In Stock'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/PreOrder',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageBanner
        title={product.name}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Sarees', href: '/shop' },
          { label: product.name },
        ]}
      />
      <ProductDetail product={product} />

      {related.length > 0 ? (
        <section className="border-t border-border bg-secondary/40 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <SectionHeader eyebrow="You May Also Love" title="Complete the Look" className="mb-12" />
            <ProductGrid products={related} columns="three" />
          </div>
        </section>
      ) : null}
    </>
  )
}
