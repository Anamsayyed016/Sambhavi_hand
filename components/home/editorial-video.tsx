'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const VIDEO_SRC =
  'https://res.cloudinary.com/tcjtyr02/video/upload/v1789119210/homepage.mp4'

/** Lightweight first-frame poster from the same Cloudinary asset. */
const POSTER_SRC =
  'https://res.cloudinary.com/tcjtyr02/video/upload/so_0,f_jpg,q_auto:eco/v1789119210/homepage.jpg'

/** Existing festive category route — not the generic /collections index. */
const CTA_HREF = '/collections/navratri-collection'

/**
 * Cinematic editorial film — sits between Hero and Latest Collection.
 * Moderate height; muted autoplay when visible; static poster for reduced motion.
 */
export function EditorialVideo() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting && entry.intersectionRatio >= 0.25)
      },
      { threshold: [0, 0.25, 0.5], rootMargin: '80px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || reducedMotion) return

    if (inView) {
      video.muted = true
      void video.play().catch(() => {
        /* Autoplay may be blocked — poster remains visible. */
      })
    } else {
      video.pause()
    }
  }, [inView, reducedMotion])

  return (
    <section
      ref={sectionRef}
      aria-label="Editorial brand film"
      className="border-y border-border/40 bg-secondary/40"
    >
      <div className="mx-auto max-w-[88rem] px-5 py-14 md:px-8 md:py-20">
        {/* Editorial intro — sits above the film, never over important footage */}
        <div className="mx-auto mb-8 max-w-2xl text-center md:mb-10">
          <p className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-accent">
            The Art of Handloom
          </p>
          <span className="mx-auto mt-4 block h-px w-10 bg-accent/70" aria-hidden="true" />
          <h2 className="mt-5 font-serif text-[1.85rem] tracking-[0.04em] text-foreground md:text-[2.35rem]">
            Woven Into Every Moment
          </h2>
        </div>

        {/* Inset cinematic frame */}
        <div className="relative mx-auto max-w-6xl">
          <div className="pointer-events-none absolute -inset-px border border-border/60" aria-hidden />
          <div className="relative h-[48vh] max-h-[36rem] overflow-hidden bg-charcoal/5 md:h-[58vh] md:max-h-[40rem]">
            {reducedMotion ? (
              <Image
                src={POSTER_SRC}
                alt="Sambhavi Handloom editorial film still"
                fill
                sizes="(max-width: 1152px) 100vw, 1152px"
                className="object-cover object-[center_35%]"
                unoptimized
                priority={false}
              />
            ) : (
              <>
                <Image
                  src={POSTER_SRC}
                  alt=""
                  fill
                  sizes="(max-width: 1152px) 100vw, 1152px"
                  className="object-cover object-[center_35%]"
                  unoptimized
                  aria-hidden
                  priority={false}
                />
                <video
                  ref={videoRef}
                  className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
                  poster={POSTER_SRC}
                  muted
                  loop
                  playsInline
                  preload={inView ? 'auto' : 'none'}
                  controls={false}
                  disablePictureInPicture
                  src={inView ? VIDEO_SRC : undefined}
                  aria-label="Sambhavi Handloom editorial film"
                />
              </>
            )}

            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/35 via-transparent to-charcoal/10"
              aria-hidden
            />
          </div>
        </div>

        <div className="mt-8 flex justify-center md:mt-10">
          <Link
            href={CTA_HREF}
            className="inline-flex h-11 items-center justify-center border border-primary/80 bg-transparent px-8 font-sans text-[0.6875rem] font-semibold uppercase tracking-btn text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Explore Navratri
          </Link>
        </div>
      </div>
    </section>
  )
}
