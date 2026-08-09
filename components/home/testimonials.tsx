import { Star } from 'lucide-react'
import { testimonials } from '@/lib/content'
import { SectionHeader } from '@/components/layout/section-header'
import { Reveal } from '@/components/motion/reveal'

export function Testimonials() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow="Loved by Thousands"
          title="Stories From Our Patrons"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <figure className="flex h-full flex-col rounded-md border border-border bg-card p-6">
                <div className="mb-4 flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="flex-1 font-sans text-sm leading-relaxed text-foreground/90 text-pretty">
                  {`"${t.quote}"`}
                </blockquote>
                <figcaption className="mt-5 border-t border-border pt-4">
                  <p className="font-serif text-base text-foreground">{t.name}</p>
                  <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">
                    {t.location}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
