'use client'

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const VIDEO_SRC =
  'https://res.cloudinary.com/tcjtyr02/video/upload/v1789119210/homepage.mp4'

const POSTER_SRC =
  'https://res.cloudinary.com/tcjtyr02/video/upload/so_0,f_jpg,q_auto:eco/v1789119210/homepage.jpg'

const CTA_HREF = '/collections/navratri-collection'

type Parallax = { x: number; y: number }

/**
 * Homepage-only decorative stills — not product/category media.
 * Depth: back < video < front for overlapping editorial layers.
 */
const PANELS = [
  {
    id: 'back',
    src: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1789120676/nav3.png',
    alt: 'Editorial fashion photograph',
    floatClass: 'editorial-float-a',
    /** Parallax strength in px at full cursor offset */
    parallaxPx: 6,
    /** Desktop: overlaps video top-left, sits behind video */
    className:
      'z-[2] left-[4%] top-[-2%] w-[min(18.5rem,28%)] md:left-[6%] md:top-0 xl:left-[8%]',
    pose: 'rotateY(4deg) rotateX(2deg) translateZ(-36px) scale(0.96)',
  },
  {
    id: 'front-left',
    src: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1789120674/nav2.png',
    alt: 'Editorial fashion photograph',
    floatClass: 'editorial-float-b',
    parallaxPx: 12,
    /** Desktop: overlaps lower-left of video, in front */
    className:
      'z-[8] bottom-[-4%] left-[8%] w-[min(17rem,26%)] md:bottom-[-2%] md:left-[10%] xl:left-[12%]',
    pose: 'rotateY(-5deg) rotateX(-1.5deg) translateZ(28px)',
  },
  {
    id: 'front-right',
    src: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1789120670/nav1.png',
    alt: 'Editorial fashion photograph',
    floatClass: 'editorial-float-c',
    parallaxPx: 14,
    /** Desktop: overlaps right edge of video, closest to viewer */
    className:
      'z-[9] right-[2%] top-[18%] w-[min(16.5rem,25%)] md:right-[4%] md:top-[16%] xl:right-[6%]',
    pose: 'rotateY(-3.5deg) rotateX(1deg) translateZ(42px)',
  },
] as const

function FloatingStill({
  src,
  alt,
  floatClass,
  parallaxPx,
  className,
  pose,
  parallax,
  reducedMotion,
  revealed,
  delayMs,
}: {
  src: string
  alt: string
  floatClass: string
  parallaxPx: number
  className: string
  pose: string
  parallax: Parallax
  reducedMotion: boolean
  revealed: boolean
  delayMs: number
}) {
  const px = reducedMotion ? 0 : parallax.x * parallaxPx
  const py = reducedMotion ? 0 : parallax.y * (parallaxPx * 0.75)

  return (
    <div
      className={cn(
        'pointer-events-none absolute will-change-transform',
        className,
      )}
      style={{
        transform: `translate3d(${px}px, ${py}px, 0)`,
        transition: reducedMotion
          ? undefined
          : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div
        className={cn(
          'origin-center transition-[opacity,transform] duration-1000 ease-out',
          revealed ? 'opacity-100' : 'opacity-0 translate-y-6',
          !reducedMotion && revealed && floatClass,
        )}
        style={{ transitionDelay: `${delayMs}ms` }}
      >
        <div
          className="overflow-hidden bg-ivory shadow-[0_22px_50px_-28px_rgba(36,28,20,0.55)] ring-1 ring-charcoal/8"
          style={{
            transform: pose,
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 768px) 45vw, 300px"
              className="object-cover object-center"
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Immersive 3D editorial composition — one visual space for film, stills & type.
 * Homepage-only; does not touch product or category data.
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
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.18
        setInView(visible)
        if (visible) setRevealed(true)
      },
      { threshold: [0, 0.18, 0.35], rootMargin: '40px 0px' },
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
      const nextX = prev.x + (targetParallax.current.x - prev.x) * 0.1
      const nextY = prev.y + (targetParallax.current.y - prev.y) * 0.1
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
      className="relative overflow-hidden border-y border-border/35 bg-secondary/30"
    >
      <div className="mx-auto max-w-[92rem] px-4 py-12 md:px-8 md:py-16 lg:py-20">
        {/* —— Desktop immersive stage —— */}
        <div
          ref={stageRef}
          onMouseMove={onPointerMove}
          onMouseLeave={onPointerLeave}
          className="relative mx-auto hidden min-h-[36rem] w-full max-w-7xl md:block md:h-[70vh] md:max-h-[46rem]"
          style={{ perspective: '1600px', perspectiveOrigin: '48% 42%' }}
        >
          <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
            {/* Vertical editorial mark */}
            <p
              aria-hidden
              className={cn(
                'pointer-events-none absolute right-0 top-1/2 z-[1] hidden -translate-y-1/2 select-none font-sans text-[0.625rem] uppercase tracking-[0.45em] text-foreground/25 lg:block',
                'origin-center rotate-90',
                'transition-opacity duration-1000',
                revealed ? 'opacity-100' : 'opacity-0',
              )}
              style={{ transitionDelay: '700ms' }}
            >
              Sambhavi
            </p>

            {/* Upper-left label */}
            <div
              className={cn(
                'absolute left-[2%] top-[6%] z-[10] max-w-[14rem] transition-[opacity,transform] duration-1000 ease-out xl:left-[3%]',
                revealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3',
              )}
              style={{ transitionDelay: '520ms' }}
            >
              <p className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.28em] text-accent">
                01 — The Art of Indian Craft
              </p>
              <span className="mt-3 block h-px w-8 bg-accent/60" aria-hidden />
            </div>

            {/* Back / middle / front stills */}
            {PANELS.map((panel, index) => (
              <FloatingStill
                key={panel.id}
                src={panel.src}
                alt={panel.alt}
                floatClass={panel.floatClass}
                parallaxPx={panel.parallaxPx}
                className={panel.className}
                pose={panel.pose}
                parallax={parallax}
                reducedMotion={reducedMotion}
                revealed={revealed}
                delayMs={180 + index * 160}
              />
            ))}

            {/* Central video — middle depth plane */}
            <div
              className={cn(
                'absolute left-1/2 top-1/2 z-[5] h-[78%] w-[62%] max-w-[46rem] overflow-hidden bg-charcoal/5',
                'shadow-[0_32px_70px_-40px_rgba(36,28,20,0.55)] ring-1 ring-charcoal/10',
                'transition-[opacity,transform] duration-1000 ease-out',
                revealed ? 'opacity-100' : 'opacity-0',
              )}
              style={{
                transitionDelay: '40ms',
                transformStyle: 'preserve-3d',
                transform: revealed
                  ? `translate(calc(-50% + ${reducedMotion ? 0 : parallax.x * 2}px), calc(-50% + ${reducedMotion ? 0 : parallax.y * 1.5}px)) translateZ(0) scale(1)`
                  : 'translate(-50%, -50%) translateZ(0) scale(0.985)',
              }}
            >
              {reducedMotion ? (
                <Image
                  src={POSTER_SRC}
                  alt="Sambhavi Handloom editorial film still"
                  fill
                  sizes="(max-width: 1280px) 62vw, 736px"
                  className="object-cover object-[center_35%]"
                  unoptimized
                />
              ) : (
                <>
                  <Image
                    src={POSTER_SRC}
                    alt=""
                    fill
                    sizes="(max-width: 1280px) 62vw, 736px"
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
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-charcoal/10 via-transparent to-charcoal/15"
                aria-hidden
              />
            </div>

            {/* Lower-left editorial headline */}
            <div
              className={cn(
                'absolute bottom-[8%] left-[3%] z-[10] max-w-[16rem] transition-[opacity,transform] duration-1000 ease-out xl:left-[4%] xl:bottom-[10%]',
                revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
              )}
              style={{ transitionDelay: '640ms' }}
            >
              <h2 className="font-serif text-[2.75rem] leading-[0.95] tracking-[0.02em] text-foreground xl:text-[3.25rem]">
                Woven
                <br />
                Stories
              </h2>
              <p className="mt-3 max-w-[13rem] font-sans text-xs leading-relaxed text-muted-foreground">
                Where heritage meets movement.
              </p>
              <Link
                href={CTA_HREF}
                className="mt-5 inline-flex items-center gap-2 font-sans text-[0.6875rem] font-semibold uppercase tracking-btn text-primary transition-colors hover:text-wine"
              >
                Explore Navratri
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* —— Mobile editorial composition —— */}
        <div className="relative md:hidden">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.24em] text-accent">
                01 — Indian Craft
              </p>
              <h2 className="mt-2 font-serif text-[2.15rem] leading-[0.95] tracking-[0.02em] text-foreground">
                Woven
                <br />
                Stories
              </h2>
            </div>
            <div
              className={cn(
                'relative z-[3] w-[38%] max-w-[8.5rem] shrink-0 overflow-hidden bg-ivory shadow-md ring-1 ring-charcoal/10',
                'transition-opacity duration-700',
                revealed ? 'opacity-100' : 'opacity-0',
                !reducedMotion && 'editorial-float-a',
              )}
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={PANELS[0].src}
                  alt={PANELS[0].alt}
                  fill
                  sizes="38vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>

          <div className="relative mx-auto max-w-md">
            {/* Side overlaps */}
            <div
              className={cn(
                'absolute -left-1 bottom-6 z-[6] w-[32%] max-w-[7.5rem] overflow-hidden bg-ivory shadow-lg ring-1 ring-charcoal/10',
                'transition-opacity duration-700',
                revealed ? 'opacity-100' : 'opacity-0',
                !reducedMotion && 'editorial-float-b',
              )}
              style={{ transitionDelay: '120ms' }}
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={PANELS[1].src}
                  alt={PANELS[1].alt}
                  fill
                  sizes="32vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
            <div
              className={cn(
                'absolute -right-1 top-8 z-[6] w-[32%] max-w-[7.5rem] overflow-hidden bg-ivory shadow-lg ring-1 ring-charcoal/10',
                'transition-opacity duration-700',
                revealed ? 'opacity-100' : 'opacity-0',
                !reducedMotion && 'editorial-float-c',
              )}
              style={{ transitionDelay: '180ms' }}
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={PANELS[2].src}
                  alt={PANELS[2].alt}
                  fill
                  sizes="32vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>

            <div
              className={cn(
                'relative z-[4] aspect-[16/11] overflow-hidden bg-charcoal/5 shadow-lg ring-1 ring-charcoal/10',
                'transition-[opacity,transform] duration-1000',
                revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]',
              )}
            >
              {reducedMotion ? (
                <Image
                  src={POSTER_SRC}
                  alt="Sambhavi Handloom editorial film still"
                  fill
                  sizes="100vw"
                  className="object-cover object-[center_35%]"
                  unoptimized
                />
              ) : (
                <>
                  <Image
                    src={POSTER_SRC}
                    alt=""
                    fill
                    sizes="100vw"
                    className="object-cover object-[center_35%]"
                    unoptimized
                    aria-hidden
                  />
                  <video
                    className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
                    poster={POSTER_SRC}
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="metadata"
                    controls={false}
                    disablePictureInPicture
                    src={VIDEO_SRC}
                    aria-label="Sambhavi Handloom editorial film"
                  />
                </>
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="font-sans text-xs text-muted-foreground">
              Where heritage meets movement.
            </p>
            <Link
              href={CTA_HREF}
              className="mt-4 inline-flex items-center gap-2 font-sans text-[0.6875rem] font-semibold uppercase tracking-btn text-primary"
            >
              Explore Navratri
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
