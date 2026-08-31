'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { editorialSlides } from '@/lib/content'

const AUTOPLAY_MS = 7500
const SLIDE_EASE = [0.22, 1, 0.36, 1] as const
const SLIDE_DURATION = 0.8

function padSlide(n: number): string {
  return String(n).padStart(2, '0')
}

export function Editorial() {
  const total = editorialSlides.length
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

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
    if (paused || reducedMotion) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % total)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [paused, reducedMotion, total, index])

  const slide = editorialSlides[index]
  const motionDuration = reducedMotion ? 0 : SLIDE_DURATION
  const imageMotion = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
      }
  const copyMotion = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
      }

  return (
    <section
      className="relative grid grid-cols-1 overflow-hidden lg:grid-cols-2"
      aria-roledescription="carousel"
      aria-label="Editorial saree collections"
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
      {/* image panel */}
      <div className="relative h-[58vh] overflow-hidden bg-muted sm:h-[62vh] lg:h-auto lg:min-h-[38rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`editorial-image-${index}`}
            initial={imageMotion.initial}
            animate={imageMotion.animate}
            exit={imageMotion.exit}
            transition={{ duration: motionDuration, ease: SLIDE_EASE }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              style={{ objectPosition: slide.objectPosition ?? 'center center' }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* editorial panel */}
      <div className="flex min-h-[22rem] flex-col justify-between bg-wine px-6 py-14 md:px-14 lg:min-h-[38rem] lg:py-20">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`editorial-copy-${index}`}
            initial={copyMotion.initial}
            animate={copyMotion.animate}
            exit={copyMotion.exit}
            transition={{ duration: reducedMotion ? 0 : 0.55, ease: SLIDE_EASE }}
            className="flex max-w-lg flex-col gap-6"
          >
            <span className="font-sans text-xs font-semibold uppercase tracking-luxe text-accent">
              {slide.eyebrow}
            </span>
            <h2 className="text-editorial-serif text-balance text-3xl leading-tight text-ivory sm:text-4xl md:text-[2.75rem]">
              {slide.headline}
            </h2>
            <p className="text-pretty font-sans text-base font-normal leading-relaxed text-ivory/80 sm:text-lg">
              {slide.description}
            </p>
            <div className="mt-1">
              <Button
                size="lg"
                render={<Link href={slide.ctaHref} />}
                className="h-12 rounded-none bg-ivory px-10 font-sans text-xs font-semibold uppercase tracking-btn text-charcoal hover:bg-ivory/90"
              >
                {slide.ctaLabel}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-ivory/15 pt-6">
          <div
            className="flex items-center gap-3 font-sans text-xs tracking-wide text-ivory/70"
            aria-live="polite"
          >
            <span className="tabular-nums text-ivory">{padSlide(index + 1)}</span>
            <span className="h-px w-12 bg-ivory/35 sm:w-16" aria-hidden />
            <span className="tabular-nums text-ivory/45">{padSlide(total)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous editorial slide"
              className="flex size-9 items-center justify-center rounded-full border border-ivory/35 text-ivory/90 transition-colors hover:border-ivory/60 hover:bg-ivory/10 hover:text-ivory"
            >
              <ChevronLeft className="size-4" strokeWidth={1.25} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next editorial slide"
              className="flex size-9 items-center justify-center rounded-full border border-ivory/35 text-ivory/90 transition-colors hover:border-ivory/60 hover:bg-ivory/10 hover:text-ivory"
            >
              <ChevronRight className="size-4" strokeWidth={1.25} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
