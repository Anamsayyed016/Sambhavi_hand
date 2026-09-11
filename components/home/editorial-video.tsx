'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const VIDEO_SRC =
  'https://res.cloudinary.com/tcjtyr02/video/upload/v1789119210/homepage.mp4'

/** Lightweight first-frame poster from the same Cloudinary asset. */
const POSTER_SRC =
  'https://res.cloudinary.com/tcjtyr02/video/upload/so_0,f_jpg,q_auto:eco/v1789119210/homepage.jpg'

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
      className="bg-background"
    >
      <div className="mx-auto max-w-[88rem] px-5 py-12 md:px-8 md:py-16">
        <div className="relative h-[48vh] max-h-[36rem] overflow-hidden bg-muted md:h-[56vh] md:max-h-[40rem]">
          {reducedMotion ? (
            <Image
              src={POSTER_SRC}
              alt="Sambhavi Handloom editorial film still"
              fill
              sizes="(max-width: 1408px) 100vw, 1408px"
              className="object-cover object-[center_35%]"
              unoptimized
              priority={false}
            />
          ) : (
            <>
              {/* Poster underneath avoids an empty flash before the first frame. */}
              <Image
                src={POSTER_SRC}
                alt=""
                fill
                sizes="(max-width: 1408px) 100vw, 1408px"
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

          {/* Soft bottom wash only — keeps CTA readable without covering the film. */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-charcoal/45 via-charcoal/10 to-transparent"
            aria-hidden
          />

          <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-7 md:pb-9">
            <Link
              href="/collections"
              className="inline-flex h-11 items-center justify-center border border-ivory/55 bg-charcoal/25 px-7 font-sans text-[0.6875rem] font-semibold uppercase tracking-btn text-ivory backdrop-blur-[2px] transition-colors hover:border-ivory hover:bg-charcoal/40"
            >
              Explore the Collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
