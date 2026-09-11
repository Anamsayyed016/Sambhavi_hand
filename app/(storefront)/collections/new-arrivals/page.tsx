import type { Metadata } from 'next'
import { PageBanner } from '@/components/layout/page-banner'
import { NewArrivalsShowcase } from '@/components/collections/new-arrivals-showcase'
import { getNewArrivalsCatalogCards } from '@/lib/new-arrivals-catalogs'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'New Arrivals | Sambhavi Handloom',
  description: 'New products and collections, thoughtfully curated.',
}

/**
 * Dedicated New Arrivals route — category/collection showcase only.
 * Takes precedence over /collections/[slug] so ProductGrid can never render here.
 */
export default function NewArrivalsPage() {
  const catalogs = getNewArrivalsCatalogCards()

  return (
    <>
      <PageBanner
        title="New Arrivals"
        subtitle="New products and collections, thoughtfully curated."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'New Arrivals' },
        ]}
      />
      <section className="mx-auto max-w-[88rem] px-5 py-12 md:px-8 md:py-16">
        <NewArrivalsShowcase catalogs={catalogs} />
      </section>
    </>
  )
}
