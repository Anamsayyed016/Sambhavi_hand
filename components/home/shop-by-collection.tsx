import { SectionHeader } from '@/components/layout/section-header'
import { CollectionCard } from '@/components/collection/collection-card'
import { Reveal } from '@/components/motion/reveal'
import { collections } from '@/lib/content'

export function ShopByCollection() {
  return (
    <section className="bg-secondary/50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeader
          eyebrow="Explore"
          title="Shop by Collection"
          subtitle="From everyday handloom to heirloom weaves, find the drape for every moment."
          className="mb-14"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {collections.map((collection, i) => (
            <Reveal key={collection.slug} delay={(i % 3) * 0.08}>
              <CollectionCard collection={collection} priority={i < 3} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
