'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { heroSlides } from '@/lib/content'
import { cn } from '@/lib/utils'

const AUTOPLAY_MS = 8000
const SLIDE_EASE = [0.22, 1, 0.36, 1] as const
const SLIDE_DURATION = 0.9

const primaryCtaClass =
  'h-12 rounded-none border border-charcoal/10 bg-ivory px-8 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-charcoal shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_28px_-14px_rgba(0,0,0,0.65)] transition-[background-color,box-shadow,transform] duration-300 hover:bg-ivory/95 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_14px_32px_-12px_rgba(0,0,0,0.7)] hover:-translate-y-px'

const secondaryCtaClass =
  'h-12 rounded-none border border-ivory/75 bg-charcoal/30 px-8 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-ivory shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_28px_-16px_rgba(0,0,0,0.55)] backdrop-blur-[2px] transition-[background-color,border-color,box-shadow,transform] duration-300 hover:border-ivory hover:bg-charcoal/40 hover:text-ivory hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_14px_32px_-14px_rgba(0,0,0,0.6)] hover:-translate-y-px'

export function Hero() {
  const total = heroSlides.length
  const [index, setIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

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

  const slide = heroSlides[index]
  const useVideo = Boolean(slide.video) && !reducedMotion

  useEffect(() => {
    const video = videoRef.current
    if (!video || !useVideo) return
    video.muted = true
    void video.play().catch(() => {
      /* Autoplay may be blocked; muted + playsInline usually succeeds. */
    })
    return () => {
      video.pause()
    }
  }, [useVideo, index, slide.video])

  const headlineLines = slide.headline.split('\n')
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
      className="relative min-h-[78vh] overflow-hidden bg-charcoal md:min-h-[82vh]"
      aria-roledescription="carousel"
      aria-label="Featured saree collections"
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={`hero-bg-${index}`}
          initial={imageMotion.initial}
          animate={imageMotion.animate}
          exit={imageMotion.exit}
          transition={{ duration: motionDuration, ease: SLIDE_EASE }}
          className="absolute inset-0"
        >
          {useVideo && slide.video ? (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: slide.objectPosition ?? 'center center' }}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              controls={false}
              aria-label={slide.alt}
            >
              <source src={slide.video} type="video/mp4" />
            </video>
          ) : (
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: slide.objectPosition ?? 'center center' }}
            />
          )}

          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-r from-charcoal/78 via-charcoal/42 to-charcoal/10',
              useVideo && 'from-charcoal/82 via-charcoal/48 to-charcoal/18',
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex min-h-[78vh] flex-col justify-center md:min-h-[82vh]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-[5.5rem] pb-28 md:px-8 md:pt-28 md:pb-32">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`hero-copy-${index}`}
              initial={copyMotion.initial}
              animate={copyMotion.animate}
              exit={copyMotion.exit}
              transition={{ duration: reducedMotion ? 0.15 : 0.65, ease: SLIDE_EASE }}
              className="flex max-w-2xl flex-col gap-6"
            >
              <span className="font-sans text-xs font-semibold uppercase tracking-luxe text-accent drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
                {slide.eyebrow}
              </span>

              <h1 className="text-hero-display text-balance text-ivory [text-shadow:0_1px_0_rgba(255,255,255,0.12),0_10px_28px_rgba(0,0,0,0.45)]">
                {headlineLines.map((line, i) => (
                  <span key={`${index}-${line}`}>
                    {line}
                    {i < headlineLines.length - 1 ? <br /> : null}
                  </span>
                ))}
              </h1>

              <p className="max-w-md text-pretty font-sans text-sm font-normal leading-relaxed text-ivory/85 drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)] sm:text-[0.9375rem]">
                {slide.description}
              </p>

              <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  size="lg"
                  render={<Link href={slide.primaryHref} />}
                  className={primaryCtaClass}
                >
                  {slide.primaryLabel}
                </Button>
                {slide.secondaryLabel && slide.secondaryHref ? (
                  <Button
                    size="lg"
                    variant="outline"
                    render={<Link href={slide.secondaryHref} />}
                    className={secondaryCtaClass}
                  >
                    {slide.secondaryLabel}
                  </Button>
                ) : null}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
        aria-hidden
      >
        <span className="font-sans text-[0.65rem] uppercase tracking-luxe text-ivory/60">Scroll</span>
        <motion.span
          animate={reducedMotion ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY }}
          className="h-8 w-px bg-ivory/40"
        />
      </motion.div>
    </section>
  )
}
