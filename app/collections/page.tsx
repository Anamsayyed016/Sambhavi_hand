import type { Metadata } from 'next'
import { PageBanner } from '@/components/layout/page-banner'
import { CollectionCard } from '@/components/collection/collection-card'
import { Reveal } from '@/components/motion/reveal'
import { collections } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Collections',
  description:
    'Discover Sambhavi Handloom saree collections — from everyday cotton handloom to opulent wedding and festive weaves.',
}

export default function CollectionsPage() {
  return (
    <>
      <PageBanner
        title="Collections"
        subtitle="Curated edits for every occasion, mood and milestone."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Collections' }]}
      />
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {collections.map((collection, i) => (
            <Reveal key={collection.slug} delay={(i % 3) * 0.08}>
              <CollectionCard collection={collection} priority={i < 3} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
