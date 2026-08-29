import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/layout/section-header'
import { ProductGrid } from '@/components/product/product-grid'
import { getStorefrontProducts } from '@/lib/products'

export function FeaturedCollection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <SectionHeader
        eyebrow="Featured Sarees"
        title="Curated Elegance"
        subtitle="Handpicked sarees crafted for timeless occasions."
        className="mb-14"
      />
      <ProductGrid products={getStorefrontProducts()} columns="three" />
      <div className="mt-14 flex justify-center">
        <Button
          size="lg"
          variant="outline"
          render={<Link href="/shop" />}
          className="h-12 rounded-none border-primary px-10 text-xs uppercase tracking-luxe text-primary hover:bg-primary hover:text-primary-foreground"
        >
          View All Sarees
        </Button>
      </div>
    </section>
  )
}
