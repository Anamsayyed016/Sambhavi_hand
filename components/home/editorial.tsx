'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { editorialSlides } from '@/lib/content'

const AUTOPLAY_MS = 8000
const SLIDE_EASE = [0.22, 1, 0.36, 1] as const
const SLIDE_DURATION = 0.9

export function Editorial() {
  const total = editorialSlides.length
  const [index, setIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % total)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [total])

  const slide = editorialSlides[index]
  const motionDuration = reducedMotion ? 0.15 : SLIDE_DURATION
  const imageMotion = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 1.04 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.02 },
      }
  const copyMotion = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      }

  return (
    <section
      className="relative grid grid-cols-1 overflow-hidden lg:grid-cols-2"
      aria-roledescription="carousel"
      aria-label="Editorial saree collections"
    >
      <div className="relative h-[58vh] overflow-hidden bg-muted sm:h-[62vh] lg:h-auto lg:min-h-[38rem]">
        <AnimatePresence initial={false}>
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

      <div className="flex items-center bg-wine px-6 py-14 md:px-14 lg:min-h-[38rem] lg:py-20">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`editorial-copy-${index}`}
            initial={copyMotion.initial}
            animate={copyMotion.animate}
            exit={copyMotion.exit}
            transition={{ duration: reducedMotion ? 0.15 : 0.65, ease: SLIDE_EASE }}
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
      </div>
    </section>
  )
}
