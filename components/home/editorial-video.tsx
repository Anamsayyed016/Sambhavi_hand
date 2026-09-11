'use client'

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const VIDEO_SRC =
  'https://res.cloudinary.com/tcjtyr02/video/upload/v1789119210/homepage.mp4'

const POSTER_SRC =
  'https://res.cloudinary.com/tcjtyr02/video/upload/so_0,f_jpg,q_auto:eco/v1789119210/homepage.jpg'

/** Existing Navratri category route — not the generic /collections index. */
const CTA_HREF = '/collections/navratri-collection'

type Parallax = { x: number; y: number }

/**
 * Homepage-only decorative stills — not product/category media.
 * Positioned inside the STAGE column only (never over the text column).
 */
const PANELS = [
  {
    id: 'back',
    src: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1789120676/nav3.png',
    alt: 'Editorial fashion photograph',
    floatClass: 'editorial-float-a',
    parallaxPx: 6,
    className:
      'z-[2] left-[-4%] top-[-6%] w-[min(17.5rem,36%)] xl:left-[-2%] xl:w-[min(18rem,34%)]',
    pose: 'rotateY(4deg) rotateX(2deg) translateZ(-36px) scale(0.97)',
  },
  {
    id: 'front-left',
    src: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1789120674/nav2.png',
    alt: 'Editorial fashion photograph',
    floatClass: 'editorial-float-b',
    parallaxPx: 12,
    className:
      'z-[8] bottom-[-8%] left-[-2%] w-[min(18.5rem,38%)] xl:bottom-[-6%] xl:left-[0%] xl:w-[min(19.5rem,36%)]',
    pose: 'rotateY(-5deg) rotateX(-1.5deg) translateZ(28px)',
  },
  {
    id: 'front-right',
    src: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1789120670/nav1.png',
    alt: 'Editorial fashion photograph',
    floatClass: 'editorial-float-c',
    parallaxPx: 14,
    className:
      'z-[9] right-[-2%] top-[12%] w-[min(17rem,34%)] xl:right-[-1%] xl:top-[10%] xl:w-[min(18rem,32%)]',
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
      className={cn('pointer-events-none absolute will-change-transform', className)}
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
          className="overflow-hidden bg-ivory shadow-[0_22px_50px_-28px_rgba(36,28,20,0.55)] ring-1 ring-charcoal/10"
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
              sizes="(max-width: 768px) 30vw, 300px"
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
 * Immersive Navratri editorial composition.
 * Text column is compositionally separate from the image/video stage.
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
      aria-label="Navratri editorial film"
      className="relative overflow-hidden border-y border-border/35 bg-secondary/30"
    >
      {/* Subtle Navratri atmosphere — decorative only */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="editorial-navratri-dots absolute inset-0 opacity-[0.4]" />
        <div className="editorial-dandiya-lines absolute inset-0 opacity-[0.28]" />
        <div className="absolute left-[14%] top-[16%] h-36 w-36 rounded-full border border-accent/20 md:left-[22%] md:top-[12%]" />
        <div className="absolute bottom-[14%] right-[8%] h-24 w-24 rounded-full border border-wine/15" />
      </div>

      <div className="relative mx-auto max-w-[92rem] px-4 py-12 md:px-8 md:py-16">
        {/* Desktop: protected text column + image/video stage */}
        <div className="mx-auto hidden max-w-7xl md:grid md:h-[70vh] md:max-h-[46rem] md:grid-cols-[minmax(15rem,26%)_minmax(0,1fr)] md:items-center md:gap-8 lg:gap-10 xl:gap-12">
          {/* ZONE A — typography never overlapped by images */}
          <div
            className={cn(
              'relative z-20 flex max-w-[17rem] flex-col justify-center transition-[opacity,transform] duration-1000 ease-out',
              revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
            )}
            style={{ transitionDelay: '480ms' }}
          >
            <p className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.28em] text-accent">
              01 — Navratri Edition
            </p>
            <span
              className="mt-3 block h-px w-12 bg-gradient-to-r from-accent via-wine/50 to-transparent"
              aria-hidden
            />
            <h2 className="mt-6 font-serif text-[2.85rem] leading-[0.95] tracking-[0.02em] text-foreground lg:text-[3.35rem]">
              Woven
              <br />
              Stories
            </h2>
            <p className="mt-4 max-w-[14rem] font-sans text-xs leading-relaxed text-muted-foreground">
              A celebration of colour, craft &amp; movement.
            </p>
            <Link
              href={CTA_HREF}
              className="mt-7 inline-flex w-fit items-center gap-2 border-b border-primary/40 pb-1 font-sans text-[0.6875rem] font-semibold uppercase tracking-btn text-primary transition-colors hover:border-primary hover:text-wine"
            >
              Explore Navratri
              <span aria-hidden>→</span>
            </Link>
          </div>

          {/* ZONE B + C — video + stills only */}
          <div
            ref={stageRef}
            onMouseMove={onPointerMove}
            onMouseLeave={onPointerLeave}
            className="relative h-full min-h-[32rem] w-full"
            style={{ perspective: '1600px', perspectiveOrigin: '45% 42%' }}
          >
            <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
              <p
                aria-hidden
                className={cn(
                  'pointer-events-none absolute right-0 top-1/2 z-[1] hidden -translate-y-1/2 select-none font-sans text-[0.625rem] uppercase tracking-[0.45em] text-wine/30 lg:block',
                  'origin-center rotate-90 transition-opacity duration-1000',
                  revealed ? 'opacity-100' : 'opacity-0',
                )}
                style={{ transitionDelay: '700ms' }}
              >
                Garba
              </p>

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

              <div
                className={cn(
                  'absolute left-[52%] top-1/2 z-[5] h-[82%] w-[72%] max-w-[42rem] overflow-hidden bg-charcoal/5',
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
                    sizes="(max-width: 1280px) 50vw, 672px"
                    className="object-cover object-[center_35%]"
                    unoptimized
                  />
                ) : (
                  <>
                    <Image
                      src={POSTER_SRC}
                      alt=""
                      fill
                      sizes="(max-width: 1280px) 50vw, 672px"
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
                      aria-label="Sambhavi Handloom Navratri editorial film"
                    />
                  </>
                )}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-wine/12 via-transparent to-accent/12"
                  aria-hidden
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: label → heading → video → images → CTA */}
        <div className="relative md:hidden">
          <div
            className={cn(
              'transition-[opacity,transform] duration-700',
              revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3',
            )}
          >
            <p className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.24em] text-accent">
              01 — Navratri Edition
            </p>
            <span className="mt-3 block h-px w-10 bg-accent/60" aria-hidden />
            <h2 className="mt-4 font-serif text-[2.25rem] leading-[0.95] tracking-[0.02em] text-foreground">
              Woven
              <br />
              Stories
            </h2>
            <p className="mt-3 max-w-[16rem] font-sans text-xs leading-relaxed text-muted-foreground">
              A celebration of colour, craft &amp; movement.
            </p>
          </div>

          <div className="relative mx-auto mt-8 max-w-md">
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
                    aria-label="Sambhavi Handloom Navratri editorial film"
                  />
                </>
              )}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-wine/15 via-transparent to-transparent"
                aria-hidden
              />
            </div>

            <div className="mt-5 flex items-start justify-center gap-4 px-1">
              {PANELS.map((panel, index) => (
                <div
                  key={panel.id}
                  className={cn(
                    'w-[30%] max-w-[6.75rem] overflow-hidden bg-ivory shadow-md ring-1 ring-charcoal/10',
                    'transition-opacity duration-700',
                    revealed ? 'opacity-100' : 'opacity-0',
                    !reducedMotion && panel.floatClass,
                  )}
                  style={{ transitionDelay: `${120 + index * 80}ms` }}
                >
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={panel.src}
                      alt={panel.alt}
                      fill
                      sizes="30vw"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 text-center">
            <Link
              href={CTA_HREF}
              className="inline-flex items-center gap-2 border-b border-primary/40 pb-1 font-sans text-[0.6875rem] font-semibold uppercase tracking-btn text-primary"
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
