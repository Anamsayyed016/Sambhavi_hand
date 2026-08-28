import type { Metadata } from 'next'
import Link from 'next/link'
import { PageBanner } from '@/components/layout/page-banner'
import { CategoryGroupPanel } from '@/components/category/category-group-panel'
import { Reveal } from '@/components/motion/reveal'
import { categoryGroups } from '@/lib/categories'

export const metadata: Metadata = {
  title: 'Saree Categories',
  description:
    'Browse Sambhavi Handloom sarees by type — digital print, kota, handloom & powerloom, festive edition, and more.',
}

export default function CollectionsPage() {
  return (
    <>
      <PageBanner
        title="Saree Categories"
        subtitle="Explore our full range by weave, fabric, and occasion."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Categories' }]}
      />
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {categoryGroups.map((group, i) => (
            <Reveal key={group.slug} delay={(i % 5) * 0.08}>
              <CategoryGroupPanel group={group} />
            </Reveal>
          ))}
        </div>
        <p className="mt-14 text-center font-sans text-sm text-muted-foreground">
          <Link href="/shop" className="transition-colors hover:text-primary">
            View all sarees
          </Link>
        </p>
      </section>
    </>
  )
}
