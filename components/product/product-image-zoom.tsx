'use client'

import Image from 'next/image'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, X, ZoomIn, ZoomOut } from 'lucide-react'
import { cn } from '@/lib/utils'

type ProductImageZoomProps = {
  images: string[]
  alt: string
  activeIndex: number
  onActiveIndexChange: (index: number) => void
  discountPercent?: number
  /** Editorial campaign stills: preserve natural aspect, no product-card crop. */
  variant?: 'gallery' | 'editorial'
  className?: string
}

const MIN_SCALE = 1
const MAX_SCALE = 4

export function ProductImageZoom({
  images,
  alt,
  activeIndex,
  onActiveIndexChange,
  discountPercent = 0,
  variant = 'gallery',
  className,
}: ProductImageZoomProps) {
  const [open, setOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(activeIndex)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null)
  const swipeRef = useRef<{ x: number; y: number } | null>(null)

  const gallery = images.length > 0 ? images : ['/placeholder.svg']
  const safeIndex = Math.min(Math.max(activeIndex, 0), gallery.length - 1)
  const safeViewerIndex = Math.min(Math.max(viewerIndex, 0), gallery.length - 1)

  const resetZoom = useCallback(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
    dragRef.current = null
    pinchRef.current = null
  }, [])

  const openViewer = useCallback(
    (index = safeIndex) => {
      setViewerIndex(index)
      resetZoom()
      setOpen(true)
    },
    [resetZoom, safeIndex],
  )

  const closeViewer = useCallback(() => {
    setOpen(false)
    resetZoom()
  }, [resetZoom])

  const showPrev = useCallback(() => {
    setViewerIndex((current) => {
      const next = (current - 1 + gallery.length) % gallery.length
      resetZoom()
      return next
    })
  }, [gallery.length, resetZoom])

  const showNext = useCallback(() => {
    setViewerIndex((current) => {
      const next = (current + 1) % gallery.length
      resetZoom()
      return next
    })
  }, [gallery.length, resetZoom])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeViewer()
      if (event.key === 'ArrowLeft') showPrev()
      if (event.key === 'ArrowRight') showNext()
      if (event.key === '+' || event.key === '=') {
        setScale((value) => Math.min(MAX_SCALE, Number((value + 0.35).toFixed(2))))
      }
      if (event.key === '-') {
        setScale((value) => {
          const next = Math.max(MIN_SCALE, Number((value - 0.35).toFixed(2)))
          if (next === MIN_SCALE) setOffset({ x: 0, y: 0 })
          return next
        })
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [closeViewer, open, showNext, showPrev])

  function zoomIn() {
    setScale((value) => Math.min(MAX_SCALE, Number((value + 0.4).toFixed(2))))
  }

  function zoomOut() {
    setScale((value) => {
      const next = Math.max(MIN_SCALE, Number((value - 0.4).toFixed(2)))
      if (next === MIN_SCALE) setOffset({ x: 0, y: 0 })
      return next
    })
  }

  function onWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault()
    const delta = event.deltaY > 0 ? -0.2 : 0.2
    setScale((value) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number((value + delta).toFixed(2))))
      if (next === MIN_SCALE) setOffset({ x: 0, y: 0 })
      return next
    })
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (scale <= MIN_SCALE) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      ox: offset.x,
      oy: offset.y,
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current || scale <= MIN_SCALE) return
    setOffset({
      x: dragRef.current.ox + (event.clientX - dragRef.current.x),
      y: dragRef.current.oy + (event.clientY - dragRef.current.y),
    })
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    dragRef.current = null
  }

  function touchDistance(touches: ReactTouchEvent['touches']) {
    if (touches.length < 2) return 0
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.hypot(dx, dy)
  }

  function onTouchStart(event: ReactTouchEvent<HTMLDivElement>) {
    if (event.touches.length === 2) {
      pinchRef.current = {
        distance: touchDistance(event.touches),
        scale,
      }
      swipeRef.current = null
      return
    }
    if (event.touches.length === 1 && scale <= MIN_SCALE) {
      swipeRef.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      }
    }
  }

  function onTouchMove(event: ReactTouchEvent<HTMLDivElement>) {
    if (event.touches.length === 2 && pinchRef.current) {
      event.preventDefault()
      const distance = touchDistance(event.touches)
      if (!pinchRef.current.distance) return
      const next = Math.min(
        MAX_SCALE,
        Math.max(
          MIN_SCALE,
          Number(((pinchRef.current.scale * distance) / pinchRef.current.distance).toFixed(2)),
        ),
      )
      setScale(next)
      if (next === MIN_SCALE) setOffset({ x: 0, y: 0 })
    }
  }

  function onTouchEnd(event: ReactTouchEvent<HTMLDivElement>) {
    if (event.touches.length < 2) pinchRef.current = null

    if (event.changedTouches.length === 1 && swipeRef.current && scale <= MIN_SCALE) {
      const dx = event.changedTouches[0].clientX - swipeRef.current.x
      const dy = event.changedTouches[0].clientY - swipeRef.current.y
      if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        if (dx < 0) showNext()
        else showPrev()
      }
    }

    if (event.touches.length === 0) swipeRef.current = null
  }

  const preview =
    variant === 'editorial' ? (
      <div className={cn('relative mx-auto w-full max-w-full lg:mx-0 lg:max-w-[28rem]', className)}>
        <button
          type="button"
          onClick={() => openViewer(safeIndex)}
          aria-label={`Open ${alt} image zoom`}
          className="group/main relative block w-full cursor-zoom-in overflow-hidden rounded-sm bg-secondary/40 p-2 sm:p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gallery[safeIndex] || '/placeholder.svg'}
            alt={alt}
            className="h-auto w-full object-contain transition-transform duration-500 ease-out group-hover/main:scale-[1.015]"
            draggable={false}
          />
          <span className="absolute bottom-4 right-4 z-10 flex size-10 items-center justify-center rounded-full border border-border/70 bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition-colors group-hover/main:bg-background">
            <Plus className="size-4" strokeWidth={1.75} aria-hidden />
          </span>
        </button>
      </div>
    ) : (
      <div className={cn('flex flex-col-reverse gap-4 sm:flex-row', className)}>
        {gallery.length > 1 ? (
          <div className="flex gap-3 sm:flex-col">
            {gallery.map((img, i) => (
              <button
                key={`${img}-${i}`}
                type="button"
                onClick={() => onActiveIndexChange(i)}
                aria-label={`View image ${i + 1}`}
                className={cn(
                  'relative h-20 w-16 shrink-0 overflow-hidden rounded-sm border bg-muted transition-colors sm:h-24 sm:w-20',
                  safeIndex === i ? 'border-primary' : 'border-border',
                )}
              >
                <Image
                  src={img || '/placeholder.svg'}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain object-center"
                />
              </button>
            ))}
          </div>
        ) : null}

        <div className="relative aspect-[2/3] flex-1 overflow-hidden rounded-md bg-ivory p-4 sm:p-6">
          <button
            type="button"
            onClick={() => openViewer(safeIndex)}
            aria-label="Open image zoom"
            className="group/main relative h-full w-full cursor-zoom-in"
          >
            <Image
              src={gallery[safeIndex] || '/placeholder.svg'}
              alt={alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-contain object-center transition-transform duration-500 ease-out group-hover/main:scale-[1.03]"
            />
          </button>

          <button
            type="button"
            onClick={() => openViewer(safeIndex)}
            aria-label="Zoom product image"
            className="absolute bottom-4 right-4 z-10 flex size-10 items-center justify-center rounded-full border border-border/70 bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
          >
            <Plus className="size-4" strokeWidth={1.75} aria-hidden />
          </button>

          {discountPercent > 0 ? (
            <span className="absolute left-4 top-4 bg-primary px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-luxe text-primary-foreground">
              Save {discountPercent}%
            </span>
          ) : null}
        </div>
      </div>
    )

  return (
    <>
      {preview}

      <AnimatePresence>
        {open ? (
          <motion.div
            key="product-image-viewer"
            role="dialog"
            aria-modal="true"
            aria-label={`${alt} image viewer`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[80] flex flex-col bg-[#1a1410]/95 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 text-ivory md:px-6">
              <p className="font-sans text-xs uppercase tracking-[0.16em] text-ivory/70">
                {safeViewerIndex + 1} / {gallery.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={zoomOut}
                  aria-label="Zoom out"
                  className="flex size-10 items-center justify-center rounded-full border border-ivory/20 text-ivory transition-colors hover:bg-ivory/10"
                >
                  <ZoomOut className="size-4" strokeWidth={1.6} />
                </button>
                <button
                  type="button"
                  onClick={zoomIn}
                  aria-label="Zoom in"
                  className="flex size-10 items-center justify-center rounded-full border border-ivory/20 text-ivory transition-colors hover:bg-ivory/10"
                >
                  <ZoomIn className="size-4" strokeWidth={1.6} />
                </button>
                <button
                  type="button"
                  onClick={closeViewer}
                  aria-label="Close image viewer"
                  className="flex size-10 items-center justify-center rounded-full border border-ivory/20 text-ivory transition-colors hover:bg-ivory/10"
                >
                  <X className="size-4" strokeWidth={1.6} />
                </button>
              </div>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-6 md:px-10">
              {gallery.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={showPrev}
                    aria-label="Previous image"
                    className="absolute left-2 z-10 flex size-11 items-center justify-center rounded-full border border-ivory/20 bg-[#1a1410]/55 text-ivory transition-colors hover:bg-ivory/10 md:left-4"
                  >
                    <ChevronLeft className="size-5" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    aria-label="Next image"
                    className="absolute right-2 z-10 flex size-11 items-center justify-center rounded-full border border-ivory/20 bg-[#1a1410]/55 text-ivory transition-colors hover:bg-ivory/10 md:right-4"
                  >
                    <ChevronRight className="size-5" strokeWidth={1.5} />
                  </button>
                </>
              ) : null}

              <div
                className={cn(
                  'relative h-full w-full max-w-5xl touch-none select-none overflow-hidden',
                  scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in',
                )}
                onWheel={onWheel}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onDoubleClick={() => {
                  if (scale > 1) {
                    resetZoom()
                  } else {
                    setScale(2.2)
                  }
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    scale,
                    x: offset.x,
                    y: offset.y,
                  }}
                  transition={{ type: 'spring', stiffness: 260, damping: 28, mass: 0.7 }}
                >
                  {/* Native img preserves full Cloudinary resolution inside the viewer */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gallery[safeViewerIndex] || '/placeholder.svg'}
                    alt={alt}
                    className="h-full w-full object-contain"
                    draggable={false}
                  />
                </motion.div>
              </div>
            </div>

            {gallery.length > 1 ? (
              <div className="flex justify-center gap-2 px-4 pb-5">
                {gallery.map((img, i) => (
                  <button
                    key={`viewer-thumb-${img}-${i}`}
                    type="button"
                    onClick={() => {
                      setViewerIndex(i)
                      resetZoom()
                    }}
                    aria-label={`Show image ${i + 1}`}
                    className={cn(
                      'relative h-14 w-11 overflow-hidden rounded-sm border transition-colors',
                      safeViewerIndex === i ? 'border-ivory' : 'border-ivory/25 opacity-70',
                    )}
                  >
                    <Image
                      src={img || '/placeholder.svg'}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
