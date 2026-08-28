import { SectionHeader } from '@/components/layout/section-header'
import { CategoryGroupPanel } from '@/components/category/category-group-panel'
import { Reveal } from '@/components/motion/reveal'
import { categoryGroups } from '@/lib/categories'

export function ShopByCollection() {
  return (
    <section className="bg-secondary/50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeader
          eyebrow="Browse"
          title="Saree Categories"
          subtitle="Handloom, powerloom, festive edits, and more — find your weave by type."
          className="mb-14"
        />
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 lg:gap-8">
          {categoryGroups.map((group, i) => (
            <Reveal key={group.slug} delay={(i % 5) * 0.08}>
              <CategoryGroupPanel group={group} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
