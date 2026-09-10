import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { NewArrivalsCatalogCard } from '@/lib/new-arrivals-catalogs'

/**
 * New Arrivals category/collection cards.
 *
 * CHHABILI: full-bleed lifestyle cover (unchanged).
 * Digital Print / Kota Handloom: product flat-lay presentation matching
 * storefront product cards (ivory well + object-contain) — avoids empty
 * dark letterboxing / overlay artifacts from object-cover on flat-lays.
 *
 * No charcoal badges, gradients, or absolute overlays on any card.
 */
export function NewArrivalsShowcase({
  catalogs,
}: {
  catalogs: NewArrivalsCatalogCard[]
}) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
      {catalogs.map((catalog) => {
        const isChhabili = catalog.slug === 'chhabili'

        return (
          <Link
            key={catalog.slug}
            href={catalog.href}
            className="group flex flex-col"
          >
            {isChhabili ? (
              <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                <Image
                  src={catalog.image}
                  alt={catalog.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>
            ) : (
              <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-ivory p-4 sm:p-5">
                <div className="relative h-full w-full">
                  <Image
                    src={catalog.image}
                    alt={catalog.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    style={{ backgroundColor: 'transparent' }}
                  />
                </div>
              </div>
            )}

            <div className="mt-5 space-y-2">
              <h2
                className={cn(
                  'font-serif tracking-[0.1em] text-foreground transition-colors group-hover:text-primary',
                  'text-2xl md:text-[1.65rem]',
                )}
              >
                {catalog.name}
              </h2>
              <p className="max-w-sm font-sans text-sm leading-relaxed text-muted-foreground">
                {catalog.blurb}
              </p>
              <span className="inline-block pt-1 font-sans text-[0.65rem] font-medium uppercase tracking-[0.18em] text-accent">
                Explore Collection
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
