import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductLink } from '@/components/product/product-link'
import { getPricedStorefrontProducts } from '@/lib/catalog/db-pricing'
import { isChhabiliProduct } from '@/lib/product-badges'
import { CHHABILI_HERO_IMAGE } from '@/components/collections/chhabili-collection-hero'
import { formatINR } from '@/lib/products'

/**
 * Homepage editorial spotlight for the newest collection (CHHABILI).
 * Reuses existing catalog products — does not create duplicates.
 */
export async function LatestCollection() {
  const chhabiliProducts = (await getPricedStorefrontProducts())
    .filter(isChhabiliProduct)
    .slice(0, 4)

  const featureImage = chhabiliProducts[0]?.image || CHHABILI_HERO_IMAGE
  const showcase = chhabiliProducts.length > 0 ? chhabiliProducts : []

  return (
    <section
      aria-label="Latest collection"
      className="border-y border-border/40 bg-secondary/30"
    >
      <div className="mx-auto max-w-[88rem] px-5 py-16 md:px-8 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          {/* Editorial copy */}
          <div className="order-1 flex flex-col lg:col-span-5 lg:order-1">
            <p className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-accent">
              Latest Collection
            </p>
            <span className="mt-4 h-px w-10 bg-accent/70" aria-hidden="true" />
            <h2 className="mt-5 font-serif text-[2.5rem] tracking-[0.06em] text-foreground md:text-5xl lg:text-[3.25rem]">
              CHHABILI
            </h2>
            <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-muted-foreground md:text-base">
              Festive silhouettes crafted for Navratri celebrations.
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                render={<Link href="/collections/chhabili" />}
                className="h-12 rounded-none bg-primary px-10 font-sans text-xs font-semibold uppercase tracking-luxe text-primary-foreground hover:bg-primary/90"
              >
                Explore Collection
              </Button>
            </div>
          </div>

          {/* Large editorial feature image */}
          <div className="order-2 lg:col-span-7 lg:order-2">
            <Link
              href="/collections/chhabili"
              className="group relative block overflow-hidden bg-muted"
            >
              <div className="relative aspect-[4/5] w-full sm:aspect-[5/4] lg:aspect-[16/11]">
                <Image
                  src={featureImage}
                  alt="CHHABILI latest collection"
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  priority
                />
              </div>
            </Link>
          </div>
        </div>

        {/* Product showcase — existing CHHABILI catalog entries */}
        {showcase.length > 0 ? (
          <div className="mt-12 grid grid-cols-2 gap-3 md:mt-16 md:grid-cols-4 md:gap-5">
            {showcase.map((product) => (
              <ProductLink
                key={product.slug}
                href={`/product/${product.slug}`}
                className="group block"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  <Image
                    src={product.image || '/placeholder.svg'}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 22vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-3 space-y-1">
                  <p className="font-sans text-[0.65rem] uppercase tracking-[0.16em] text-accent">
                    New Collection
                  </p>
                  <p className="font-serif text-lg text-foreground">{product.name}</p>
                  <p className="font-sans text-sm text-muted-foreground">
                    {formatINR(product.price)}
                  </p>
                </div>
              </ProductLink>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
