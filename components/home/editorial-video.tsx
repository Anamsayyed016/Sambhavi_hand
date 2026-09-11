'use client'

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const VIDEO_SRC =
  'https://res.cloudinary.com/tcjtyr02/video/upload/v1789119210/homepage.mp4'

const POSTER_SRC =
  'https://res.cloudinary.com/tcjtyr02/video/upload/so_0,f_jpg,q_auto:eco/v1789119210/homepage.jpg'

/** Homepage-only decorative editorial stills — not product media. */
const PANEL_IMAGES = [
  {
    src: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1789120676/nav3.png',
    alt: 'Editorial fashion photograph',
    floatClass: 'editorial-float-a',
    depth: 0.35,
    /** Desktop absolute placement + base 3D pose */
    desktop:
      'left-[2%] top-[4%] z-[1] w-[26%] max-w-[15rem] xl:left-[4%] xl:w-[24%]',
    desktopPose: 'rotateY(5deg) rotateX(2deg) translateZ(-48px)',
    mobile: 'order-1 mx-auto w-[42%] max-w-[9.5rem]',
  },
  {
    src: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1789120674/nav2.png',
    alt: 'Editorial fashion photograph',
    floatClass: 'editorial-float-b',
    depth: 0.7,
    desktop:
      'bottom-[2%] left-[0%] z-[3] w-[30%] max-w-[17rem] xl:left-[1%] xl:w-[28%]',
    desktopPose: 'rotateY(-6deg) rotateX(-1deg) translateZ(28px)',
    mobile: 'order-3 w-[38%] max-w-[8.5rem]',
  },
  {
    src: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1789120670/nav1.png',
    alt: 'Editorial fashion photograph',
    floatClass: 'editorial-float-c',
    depth: 0.55,
    desktop:
      'right-[1%] top-[14%] z-[2] w-[28%] max-w-[16rem] xl:right-[3%] xl:w-[26%]',
    desktopPose: 'rotateY(-4deg) rotateX(1.5deg) translateZ(-20px)',
    mobile: 'order-3 ml-auto w-[38%] max-w-[8.5rem]',
  },
] as const

const CTA_HREF = '/collections/navratri-collection'

type Parallax = { x: number; y: number }

function EditorialPanel({
  src,
  alt,
  floatClass,
  depth,
  desktop,
  desktopPose,
  mobile,
  parallax,
  reducedMotion,
  revealed,
  delayMs,
}: {
  src: string
  alt: string
  floatClass: string
  depth: number
  desktop: string
  desktopPose: string
  mobile: string
  parallax: Parallax
  reducedMotion: boolean
  revealed: boolean
  delayMs: number
}) {
  const px = reducedMotion ? 0 : parallax.x * depth * 10
  const py = reducedMotion ? 0 : parallax.y * depth * 8

  return (
    <div
      className={cn(
        'pointer-events-none will-change-transform',
        'md:absolute',
        desktop,
        mobile,
      )}
      style={{
        transform: `translate3d(${px}px, ${py}px, 0)`,
        transition: reducedMotion
          ? undefined
          : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div
        className={cn(
          'origin-center transition-[opacity,transform] duration-1000 ease-out',
          !reducedMotion && floatClass,
          revealed ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          transform: revealed
            ? undefined
            : 'translate3d(0, 24px, -40px) scale(0.96)',
          transitionDelay: `${delayMs}ms`,
        }}
      >
        <div
          className="overflow-hidden border border-border/50 bg-ivory shadow-[0_18px_40px_-24px_rgba(36,28,20,0.45)]"
          style={{
            transform: desktopPose,
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 768px) 42vw, 280px"
              className="object-cover object-center"
              unoptimized
              priority={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Premium 3D editorial stage — video focal, three floating stills for depth.
 * Homepage-only; does not touch product or category media.
 */
export function EditorialVideo() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const rafRef = useRef<number | null>(null)
  const targetParallax = useRef<Parallax>({ x: 0, y: 0 })

  const [reducedMotion, setReducedMotion] = useState(false)
  const [canParallax, setCanParallax] = useState(false)
  const [inView, setInView] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [parallax, setParallax] = useState<Parallax>({ x: 0, y: 0 })

  useEffect(() => {
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mqFine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => {
      setReducedMotion(mqMotion.matches)
      setCanParallax(mqFine.matches && !mqMotion.matches)
    }
    sync()
    mqMotion.addEventListener('change', sync)
    mqFine.addEventListener('change', sync)
    return () => {
      mqMotion.removeEventListener('change', sync)
      mqFine.removeEventListener('change', sync)
    }
  }, [])

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.2
        setInView(visible)
        if (visible) setRevealed(true)
      },
      { threshold: [0, 0.2, 0.4], rootMargin: '60px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || reducedMotion) return

    if (inView) {
      video.muted = true
      void video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [inView, reducedMotion])

  const tickParallax = useCallback(() => {
    rafRef.current = null
    setParallax((prev) => {
      const nextX = prev.x + (targetParallax.current.x - prev.x) * 0.12
      const nextY = prev.y + (targetParallax.current.y - prev.y) * 0.12
      if (Math.abs(nextX - prev.x) < 0.001 && Math.abs(nextY - prev.y) < 0.001) {
        return prev
      }
      rafRef.current = window.requestAnimationFrame(tickParallax)
      return { x: nextX, y: nextY }
    })
  }, [])

  const onPointerMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!canParallax || !stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    targetParallax.current = {
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    }
    if (rafRef.current == null) {
      rafRef.current = window.requestAnimationFrame(tickParallax)
    }
  }

  const onPointerLeave = () => {
    if (!canParallax) return
    targetParallax.current = { x: 0, y: 0 }
    if (rafRef.current == null) {
      rafRef.current = window.requestAnimationFrame(tickParallax)
    }
  }

  useEffect(() => {
    return () => {
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-label="Editorial brand film"
      className="border-y border-border/40 bg-secondary/35"
    >
      <div className="mx-auto max-w-[88rem] px-5 py-14 md:px-8 md:py-20">
        <div className="mx-auto mb-8 max-w-xl text-center md:mb-11">
          <p className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-accent">
            The Art of Handloom
          </p>
          <span className="mx-auto mt-4 block h-px w-10 bg-accent/70" aria-hidden="true" />
          <p className="mt-5 font-serif text-lg tracking-[0.03em] text-foreground/80 md:text-xl">
            Woven stories, timeless beauty.
          </p>
        </div>

        {/* 3D editorial stage */}
        <div
          ref={stageRef}
          onMouseMove={onPointerMove}
          onMouseLeave={onPointerLeave}
          className={cn(
            'relative mx-auto max-w-6xl',
            'flex flex-col items-center gap-5 md:block',
            'md:h-[68vh] md:max-h-[42rem]',
            'min-h-[22rem]',
          )}
          style={{ perspective: '1400px', perspectiveOrigin: '50% 45%' }}
        >
          <div
            className="relative h-full w-full md:[transform-style:preserve-3d]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Desktop floating panels */}
            <div className="hidden md:contents">
              {PANEL_IMAGES.map((panel, index) => (
                <EditorialPanel
                  key={panel.src}
                  {...panel}
                  parallax={parallax}
                  reducedMotion={reducedMotion}
                  revealed={revealed}
                  delayMs={120 + index * 140}
                />
              ))}
            </div>

            {/* Mobile: top image */}
            <div className="md:hidden">
              <EditorialPanel
                {...PANEL_IMAGES[0]}
                parallax={{ x: 0, y: 0 }}
                reducedMotion={reducedMotion}
                revealed={revealed}
                delayMs={80}
              />
            </div>

            {/* Center video — stable focal plane */}
            <div
              className={cn(
                'relative z-[4] w-full overflow-hidden border border-border/55 bg-charcoal/5 shadow-[0_28px_60px_-36px_rgba(36,28,20,0.5)]',
                'aspect-[16/10] max-h-[22rem] sm:max-h-[26rem]',
                'md:absolute md:left-1/2 md:top-1/2 md:aspect-auto md:h-[72%] md:w-[58%] md:max-h-none md:-translate-x-1/2 md:-translate-y-1/2',
                'order-2 transition-[opacity,transform] duration-1000 ease-out',
                revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]',
              )}
              style={{ transformStyle: 'preserve-3d', transitionDelay: '60ms' }}
            >
              {reducedMotion ? (
                <Image
                  src={POSTER_SRC}
                  alt="Sambhavi Handloom editorial film still"
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover object-[center_35%]"
                  unoptimized
                />
              ) : (
                <>
                  <Image
                    src={POSTER_SRC}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="object-cover object-[center_35%]"
                    unoptimized
                    aria-hidden
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
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/20 via-transparent to-charcoal/5"
                aria-hidden
              />
            </div>

            {/* Mobile: bottom pair */}
            <div className="order-3 flex w-full items-end justify-between gap-3 px-1 md:hidden">
              <EditorialPanel
                {...PANEL_IMAGES[1]}
                parallax={{ x: 0, y: 0 }}
                reducedMotion={reducedMotion}
                revealed={revealed}
                delayMs={160}
              />
              <EditorialPanel
                {...PANEL_IMAGES[2]}
                parallax={{ x: 0, y: 0 }}
                reducedMotion={reducedMotion}
                revealed={revealed}
                delayMs={220}
              />
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center md:mt-12">
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
