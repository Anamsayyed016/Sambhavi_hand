import Image from 'next/image'
import Link from 'next/link'
import type { NewArrivalsCatalogCard } from '@/lib/new-arrivals-catalogs'

/**
 * New Arrivals = category/collection cards only.
 * Never ProductCard (no wishlist hearts, no NEW badges, no price row).
 * Never renders <Image> with an invalid/missing src (no giant broken media well).
 */
export function NewArrivalsShowcase({
  catalogs,
}: {
  catalogs: NewArrivalsCatalogCard[]
}) {
  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {catalogs.map((catalog) => (
        <Link
          key={catalog.slug}
          href={catalog.href}
          className="group flex flex-col"
        >
          {catalog.image ? (
            <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
              <Image
                src={catalog.image}
                alt={catalog.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center bg-secondary px-6">
              <span className="text-center font-serif text-2xl tracking-[0.14em] text-foreground">
                {catalog.name}
              </span>
            </div>
          )}

          <div className="mt-5 space-y-2">
            <h2 className="font-serif text-2xl tracking-[0.1em] text-foreground transition-colors group-hover:text-primary md:text-[1.65rem]">
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
      ))}
    </div>
  )
}
