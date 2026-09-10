import { SectionHeader } from '@/components/layout/section-header'
import { NewArrivalsShowcase } from '@/components/collections/new-arrivals-showcase'
import { getNewArrivalsCatalogCards } from '@/lib/new-arrivals-catalogs'
import Link from 'next/link'

/** Homepage — curated category/collection New Arrivals (never product cards). */
export function NewArrivals() {
  const catalogs = getNewArrivalsCatalogCards()

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Just In"
            title="New Arrivals"
            subtitle="New products and collections, thoughtfully curated."
            align="left"
          />
          <Link
            href="/collections/new-arrivals"
            className="hidden shrink-0 font-sans text-[0.65rem] font-medium uppercase tracking-[0.18em] text-accent transition-colors hover:text-primary md:inline-block"
          >
            View All
          </Link>
        </div>
        <NewArrivalsShowcase catalogs={catalogs} />
      </div>
    </section>
  )
}
