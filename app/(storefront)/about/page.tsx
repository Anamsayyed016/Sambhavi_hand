import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { PageBanner } from '@/components/layout/page-banner'
import { SectionHeader } from '@/components/layout/section-header'
import { Reveal } from '@/components/motion/reveal'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    "The story of Sambhavi Handloom — preserving India's weaving heritage by working directly with master artisans and weaving communities.",
}

const values = [
  {
    title: 'Heritage',
    body: 'We preserve centuries-old weaving traditions, keeping ancestral techniques and motifs alive for generations to come.',
  },
  {
    title: 'Craftsmanship',
    body: 'Every saree is handwoven by master artisans, taking days or weeks to complete with meticulous attention to detail.',
  },
  {
    title: 'Community',
    body: 'We work directly with weaving clusters, ensuring fair wages and dignified livelihoods for the hands behind each drape.',
  },
  {
    title: 'Sustainability',
    body: 'Natural fibres, low-impact processes and timeless design — pieces made to be treasured, not discarded.',
  },
]

const stats = [
  { value: '200+', label: 'Weaver families' },
  { value: '15', label: 'Weaving clusters' },
  { value: '25k+', label: 'Sarees delivered' },
  { value: '4.9', label: 'Average rating' },
]

export default function AboutPage() {
  return (
    <>
      <PageBanner
        title="Our Story"
        subtitle="Where India's timeless weaving heritage meets the modern woman."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About Us' }]}
      />

      {/* intro */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="relative aspect-4/5 overflow-hidden rounded-md bg-muted">
            <Image
              src="/images/artisan-weaving.png"
              alt="A master weaver at a traditional handloom"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </Reveal>
          <Reveal className="flex flex-col gap-5">
            <span className="font-sans text-xs uppercase tracking-luxe text-accent">
              Since 2012
            </span>
            <h2 className="font-serif text-3xl text-foreground text-balance md:text-4xl">
              Woven with devotion, worn with pride
            </h2>
            <p className="font-sans leading-relaxed text-muted-foreground text-pretty">
              Sambhavi Handloom began with a simple belief — that a saree is not merely a garment,
              but a living heirloom carrying the soul of its maker. Founded out of a love for
              India&apos;s rich textile heritage, we set out to bring authentic handloom to women who
              value craftsmanship over fleeting trends.
            </p>
            <p className="font-sans leading-relaxed text-muted-foreground text-pretty">
              From the shimmering silks of Kanchipuram to the intricate brocades of Varanasi and the
              breathable cottons of Bengal, we travel to the source — working hand in hand with the
              weavers who breathe life into every thread.
            </p>
          </Reveal>
        </div>
      </section>

      {/* values */}
      <section className="bg-secondary/50 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeader
            eyebrow="What We Stand For"
            title="Our Values"
            className="mb-14"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <Reveal key={value.title} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-md border border-border bg-card p-6">
                  <span className="font-serif text-4xl text-primary/25">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-3 font-serif text-xl text-foreground">{value.title}</h3>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground text-pretty">
                    {value.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* stats */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <div className="text-center">
                <p className="font-serif text-4xl text-primary md:text-5xl">{stat.value}</p>
                <p className="mt-2 font-sans text-xs uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* cta */}
      <section className="relative overflow-hidden">
        <div className="relative h-[420px]">
          <Image
            src="/images/editorial-drape.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-charcoal/60" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-5 text-center">
            <h2 className="max-w-2xl font-serif text-3xl text-ivory text-balance md:text-4xl">
              Drape a piece of living heritage
            </h2>
            <Button
              size="lg"
              render={<Link href="/shop" />}
              className="h-12 rounded-none bg-ivory px-10 text-xs uppercase tracking-luxe text-charcoal hover:bg-ivory/90"
            >
              Explore Sarees
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
