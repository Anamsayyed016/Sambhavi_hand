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
import { ChevronLeft, ChevronRight, Play, Plus, X, ZoomIn, ZoomOut } from 'lucide-react'
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

/** Gallery media may include Cloudinary videos (.mp4 / /video/upload/). */
export function isGalleryVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return /\.mp4(\?|$)/i.test(url) || /\/video\/upload\//i.test(url)
}

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
  const inlineVideoRef = useRef<HTMLVideoElement | null>(null)
  const lightboxVideoRef = useRef<HTMLVideoElement | null>(null)

  const gallery = images.length > 0 ? images : ['/placeholder.svg']
  const safeIndex = Math.min(Math.max(activeIndex, 0), gallery.length - 1)
  const safeViewerIndex = Math.min(Math.max(viewerIndex, 0), gallery.length - 1)
  const activeSrc = gallery[safeIndex] || '/placeholder.svg'
  const viewerSrc = gallery[safeViewerIndex] || '/placeholder.svg'
  const activeIsVideo = isGalleryVideoUrl(activeSrc)
  const viewerIsVideo = isGalleryVideoUrl(viewerSrc)

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
      inlineVideoRef.current?.pause()
    },
    [resetZoom, safeIndex],
  )

  const closeViewer = useCallback(() => {
    lightboxVideoRef.current?.pause()
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
      if (!viewerIsVideo) {
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
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [closeViewer, open, showNext, showPrev, viewerIsVideo])

  useEffect(() => {
    if (!open || !viewerIsVideo) return
    const video = lightboxVideoRef.current
    if (!video) return
    void video.play().catch(() => {
      /* Autoplay may be blocked; user can press play. */
    })
  }, [open, viewerIsVideo, safeViewerIndex])

  function zoomIn() {
    if (viewerIsVideo) return
    setScale((value) => Math.min(MAX_SCALE, Number((value + 0.4).toFixed(2))))
  }

  function zoomOut() {
    if (viewerIsVideo) return
    setScale((value) => {
      const next = Math.max(MIN_SCALE, Number((value - 0.4).toFixed(2)))
      if (next === MIN_SCALE) setOffset({ x: 0, y: 0 })
      return next
    })
  }

  function onWheel(event: ReactWheelEvent<HTMLDivElement>) {
    if (viewerIsVideo) return
    event.preventDefault()
    const delta = event.deltaY > 0 ? -0.2 : 0.2
    setScale((value) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number((value + delta).toFixed(2))))
      if (next === MIN_SCALE) setOffset({ x: 0, y: 0 })
      return next
    })
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (viewerIsVideo || scale <= MIN_SCALE) return
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
    if (viewerIsVideo) return
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
    if (viewerIsVideo) return
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

  function renderThumb(src: string, i: number, selected: boolean, size: 'rail' | 'strip') {
    const video = isGalleryVideoUrl(src)
    return (
      <button
        key={`${src}-${i}`}
        type="button"
        onClick={() => {
          if (size === 'rail') onActiveIndexChange(i)
          else {
            setViewerIndex(i)
            resetZoom()
          }
        }}
        aria-label={video ? `View video ${i + 1}` : `View image ${i + 1}`}
        className={cn(
          'relative shrink-0 overflow-hidden rounded-sm border bg-muted transition-colors',
          size === 'rail' && 'h-20 w-16 sm:h-24 sm:w-20',
          size === 'strip' && 'h-14 w-11',
          selected
            ? size === 'strip'
              ? 'border-ivory'
              : 'border-primary'
            : size === 'strip'
              ? 'border-ivory/25 opacity-70'
              : 'border-border',
        )}
      >
        {video ? (
          <>
            <video
              src={src}
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
              aria-hidden
            />
            <span className="absolute inset-0 flex items-center justify-center bg-charcoal/35">
              <Play className="size-3.5 fill-ivory text-ivory" aria-hidden />
            </span>
          </>
        ) : (
          <Image
            src={src || '/placeholder.svg'}
            alt=""
            fill
            sizes={size === 'rail' ? '80px' : '44px'}
            className={size === 'strip' ? 'object-cover' : 'object-contain object-center'}
          />
        )}
      </button>
    )
  }

  const preview =
    variant === 'editorial' ? (
      <div className={cn('relative mx-auto w-full max-w-full lg:mx-0 lg:max-w-[28rem]', className)}>
        <button
          type="button"
          onClick={() => openViewer(safeIndex)}
          aria-label={activeIsVideo ? `Open ${alt} video` : `Open ${alt} image zoom`}
          className="group/main relative block w-full cursor-zoom-in overflow-hidden rounded-sm bg-secondary/40 p-2 sm:p-4"
        >
          {activeIsVideo ? (
            <video
              ref={inlineVideoRef}
              src={activeSrc}
              className="h-auto w-full object-contain"
              muted
              playsInline
              preload="metadata"
              controls={false}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeSrc}
              alt={alt}
              className="h-auto w-full object-contain transition-transform duration-500 ease-out group-hover/main:scale-[1.015]"
              draggable={false}
            />
          )}
          <span className="absolute bottom-4 right-4 z-10 flex size-10 items-center justify-center rounded-full border border-border/70 bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition-colors group-hover/main:bg-background">
            {activeIsVideo ? (
              <Play className="size-4 fill-current" strokeWidth={1.75} aria-hidden />
            ) : (
              <Plus className="size-4" strokeWidth={1.75} aria-hidden />
            )}
          </span>
        </button>
      </div>
    ) : (
      <div className={cn('flex flex-col-reverse gap-4 sm:flex-row', className)}>
        {gallery.length > 1 ? (
          <div className="flex gap-3 sm:flex-col">
            {gallery.map((img, i) => renderThumb(img, i, safeIndex === i, 'rail'))}
          </div>
        ) : null}

        <div className="relative aspect-[2/3] flex-1 overflow-hidden rounded-md bg-ivory p-4 sm:p-6">
          {activeIsVideo ? (
            <div className="relative h-full w-full">
              <video
                ref={inlineVideoRef}
                key={activeSrc}
                src={activeSrc}
                className="h-full w-full object-contain object-center"
                controls
                playsInline
                preload="metadata"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openViewer(safeIndex)}
              aria-label="Open image zoom"
              className="group/main relative h-full w-full cursor-zoom-in"
            >
              <Image
                src={activeSrc}
                alt={alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-contain object-center transition-transform duration-500 ease-out group-hover/main:scale-[1.03]"
              />
            </button>
          )}

          {!activeIsVideo ? (
            <button
              type="button"
              onClick={() => openViewer(safeIndex)}
              aria-label="Zoom product image"
              className="absolute bottom-4 right-4 z-10 flex size-10 items-center justify-center rounded-full border border-border/70 bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
            >
              <Plus className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
          ) : null}

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
            aria-label={viewerIsVideo ? `${alt} video viewer` : `${alt} image viewer`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[80] flex flex-col bg-[#1a1410]/95 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 text-ivory md:px-6">
              <p className="font-sans text-xs uppercase tracking-[0.16em] text-ivory/70">
                {safeViewerIndex + 1} / {gallery.length}
                {viewerIsVideo ? ' · Video' : ''}
              </p>
              <div className="flex items-center gap-2">
                {!viewerIsVideo ? (
                  <>
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
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={closeViewer}
                  aria-label="Close media viewer"
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
                    aria-label="Previous media"
                    className="absolute left-2 z-10 flex size-11 items-center justify-center rounded-full border border-ivory/20 bg-[#1a1410]/55 text-ivory transition-colors hover:bg-ivory/10 md:left-4"
                  >
                    <ChevronLeft className="size-5" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    aria-label="Next media"
                    className="absolute right-2 z-10 flex size-11 items-center justify-center rounded-full border border-ivory/20 bg-[#1a1410]/55 text-ivory transition-colors hover:bg-ivory/10 md:right-4"
                  >
                    <ChevronRight className="size-5" strokeWidth={1.5} />
                  </button>
                </>
              ) : null}

              {viewerIsVideo ? (
                <div className="relative flex h-full w-full max-w-5xl items-center justify-center">
                  <video
                    ref={lightboxVideoRef}
                    key={viewerSrc}
                    src={viewerSrc}
                    className="max-h-full max-w-full object-contain"
                    controls
                    playsInline
                    preload="metadata"
                  />
                </div>
              ) : (
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
                      src={viewerSrc}
                      alt={alt}
                      className="h-full w-full object-contain"
                      draggable={false}
                    />
                  </motion.div>
                </div>
              )}
            </div>

            {gallery.length > 1 ? (
              <div className="flex justify-center gap-2 px-4 pb-5">
                {gallery.map((img, i) => renderThumb(img, i, safeViewerIndex === i, 'strip'))}
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
