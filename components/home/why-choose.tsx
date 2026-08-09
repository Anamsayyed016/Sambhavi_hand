import { Sparkles, Gem, HandHeart, Truck, ShieldCheck } from 'lucide-react'
import { whyPoints } from '@/lib/content'
import { Reveal } from '@/components/motion/reveal'

const icons = [Sparkles, Gem, HandHeart, Truck, ShieldCheck]

export function WhyChoose() {
  return (
    <section className="border-y border-border bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {whyPoints.map((point, i) => {
            const Icon = icons[i % icons.length]
            return (
              <Reveal key={point.title} delay={i * 0.08}>
                <div className="flex flex-col items-center text-center">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-serif text-lg text-foreground">{point.title}</h3>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground text-pretty">
                    {point.description}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
