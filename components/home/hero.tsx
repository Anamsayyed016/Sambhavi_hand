'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { heroSlides } from '@/lib/content'

const AUTOPLAY_MS = 6000
const SLIDE_EASE = [0.22, 1, 0.36, 1] as const
const SLIDE_DURATION = 0.75

function padSlide(n: number): string {
  return String(n).padStart(2, '0')
}

export function Hero() {
  const total = heroSlides.length
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % total) + total) % total)
    },
    [total],
  )

  const step = useCallback(
    (dir: -1 | 1) => {
      goTo(index + dir)
    },
    [goTo, index],
  )

  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % total)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [paused, total])

  const slide = heroSlides[index]
  const headlineLines = slide.headline.split('\n')

  return (
    <section
      className="relative min-h-[78vh] overflow-hidden bg-charcoal md:min-h-[82vh]"
      aria-roledescription="carousel"
      aria-label="Featured saree collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current == null) return
        const endX = e.changedTouches[0]?.clientX ?? touchStartX.current
        const delta = endX - touchStartX.current
        if (Math.abs(delta) > 48) step(delta > 0 ? -1 : 1)
        touchStartX.current = null
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={slide.image + index}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -28 }}
          transition={{ duration: SLIDE_DURATION, ease: SLIDE_EASE }}
          className="absolute inset-0"
          aria-hidden={false}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: slide.objectPosition ?? 'center center' }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/78 via-charcoal/42 to-charcoal/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* editorial overlay */}
      <div className="relative z-10 flex min-h-[78vh] flex-col justify-center md:min-h-[82vh]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-[5.5rem] pb-28 md:px-8 md:pt-28 md:pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={`copy-${index}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.55, ease: SLIDE_EASE }}
              className="flex max-w-2xl flex-col gap-6"
            >
              <span className="font-sans text-xs font-semibold uppercase tracking-luxe text-accent">
                {slide.eyebrow}
              </span>

              <h1 className="text-hero-display text-balance text-ivory">
                {headlineLines.map((line, i) => (
                  <span key={line}>
                    {line}
                    {i < headlineLines.length - 1 ? <br /> : null}
                  </span>
                ))}
              </h1>

              <p className="max-w-md text-pretty font-sans text-sm font-normal leading-relaxed text-ivory/80 sm:text-[0.9375rem]">
                {slide.description}
              </p>

              <div className="mt-1 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  render={<Link href={slide.primaryHref} />}
                  className="h-12 rounded-none bg-ivory px-8 font-sans text-xs font-semibold uppercase tracking-btn text-charcoal hover:bg-ivory/90"
                >
                  {slide.primaryLabel}
                </Button>
                {slide.secondaryLabel && slide.secondaryHref ? (
                  <Button
                    size="lg"
                    variant="outline"
                    render={<Link href={slide.secondaryHref} />}
                    className="h-12 rounded-none border-ivory/50 bg-transparent px-8 font-sans text-xs font-semibold uppercase tracking-btn text-ivory hover:bg-ivory/10 hover:text-ivory"
                  >
                    {slide.secondaryLabel}
                  </Button>
                ) : null}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* slide indicator */}
      <div
        className="pointer-events-none absolute bottom-8 left-4 z-20 flex items-center gap-3 font-sans text-xs tracking-wide text-ivory/70 md:left-8"
        aria-live="polite"
      >
        <span className="tabular-nums text-ivory">{padSlide(index + 1)}</span>
        <span className="h-px w-16 bg-ivory/35 md:w-24" aria-hidden />
        <span className="tabular-nums text-ivory/45">{padSlide(total)}</span>
      </div>

      {/* navigation */}
      <div className="absolute bottom-8 right-4 z-20 flex items-center gap-2 md:right-8">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous slide"
          className="flex size-10 items-center justify-center rounded-full border border-ivory/35 bg-charcoal/20 text-ivory/90 backdrop-blur-[2px] transition-colors hover:border-ivory/60 hover:bg-charcoal/35 hover:text-ivory"
        >
          <ChevronLeft className="size-4" strokeWidth={1.25} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next slide"
          className="flex size-10 items-center justify-center rounded-full border border-ivory/35 bg-charcoal/20 text-ivory/90 backdrop-blur-[2px] transition-colors hover:border-ivory/60 hover:bg-charcoal/35 hover:text-ivory"
        >
          <ChevronRight className="size-4" strokeWidth={1.25} aria-hidden />
        </button>
      </div>
    </section>
  )
}
