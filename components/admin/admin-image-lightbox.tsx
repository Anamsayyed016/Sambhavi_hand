'use client'

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Maximize2, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const MIN_SCALE = 1
const MAX_SCALE = 5
const ZOOM_STEP = 0.35

type AdminImageLightboxProps = {
  images: string[]
  index: number
  open: boolean
  onClose: () => void
  onIndexChange: (index: number) => void
  /** Optional product name for accessible alt text. */
  altPrefix?: string
}

/**
 * Admin-only product image inspection lightbox.
 * Images only — never pass video URLs.
 */
export function AdminImageLightbox({
  images,
  index,
  open,
  onClose,
  onIndexChange,
  altPrefix = 'Product image',
}: AdminImageLightboxProps) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null)

  const [scale, setScale] = useState(MIN_SCALE)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)

  const count = images.length
  const safeIndex = count === 0 ? 0 : Math.min(Math.max(index, 0), count - 1)
  const src = count > 0 ? images[safeIndex] : ''

  const resetZoom = useCallback(() => {
    setScale(MIN_SCALE)
    setOffset({ x: 0, y: 0 })
    dragRef.current = null
    pinchRef.current = null
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    resetZoom()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open, resetZoom])

  useEffect(() => {
    if (!open) return
    resetZoom()
  }, [safeIndex, open, resetZoom])

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key === 'ArrowLeft' && count > 1) {
        event.preventDefault()
        onIndexChange((safeIndex - 1 + count) % count)
        return
      }
      if (event.key === 'ArrowRight' && count > 1) {
        event.preventDefault()
        onIndexChange((safeIndex + 1) % count)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, onIndexChange, safeIndex, count])

  function zoomIn() {
    setScale((value) => Math.min(MAX_SCALE, Number((value + ZOOM_STEP).toFixed(2))))
  }

  function zoomOut() {
    setScale((value) => {
      const next = Math.max(MIN_SCALE, Number((value - ZOOM_STEP).toFixed(2)))
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

  function onTouchEnd() {
    pinchRef.current = null
  }

  if (!mounted || !open || !src) return null

  const toolbarBtn =
    'inline-flex size-10 items-center justify-center rounded-md border border-white/20 bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-40'

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 px-3 py-3 sm:px-5">
        <p id={titleId} className="font-sans text-sm text-white/90">
          Image {safeIndex + 1} of {count}
        </p>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <button type="button" className={toolbarBtn} onClick={zoomOut} aria-label="Zoom out">
            <ZoomOut className="size-5" aria-hidden="true" />
          </button>
          <button type="button" className={toolbarBtn} onClick={zoomIn} aria-label="Zoom in">
            <ZoomIn className="size-5" aria-hidden="true" />
          </button>
          <button type="button" className={toolbarBtn} onClick={resetZoom} aria-label="Reset zoom">
            <RotateCcw className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={toolbarBtn}
            onClick={resetZoom}
            aria-label="Fit to screen"
            title="Fit to screen"
          >
            <Maximize2 className="size-4" aria-hidden="true" />
          </button>
          <button
            ref={closeRef}
            type="button"
            className={toolbarBtn}
            onClick={onClose}
            aria-label="Close image preview"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <button
          type="button"
          className="absolute inset-0 z-0 cursor-default"
          aria-label="Close image preview"
          onClick={onClose}
        />

        {count > 1 ? (
          <>
            <button
              type="button"
              className={cn(toolbarBtn, 'absolute left-2 top-1/2 z-20 -translate-y-1/2 sm:left-4')}
              onClick={(e) => {
                e.stopPropagation()
                onIndexChange((safeIndex - 1 + count) % count)
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={cn(toolbarBtn, 'absolute right-2 top-1/2 z-20 -translate-y-1/2 sm:right-4')}
              onClick={(e) => {
                e.stopPropagation()
                onIndexChange((safeIndex + 1) % count)
              }}
              aria-label="Next image"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </>
        ) : null}

        <div
          className={cn(
            'absolute inset-0 z-10 flex items-center justify-center overflow-hidden px-12 py-2 sm:px-16',
            scale > MIN_SCALE ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in',
          )}
          onClick={(e) => e.stopPropagation()}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onDoubleClick={() => {
            if (scale > MIN_SCALE) resetZoom()
            else setScale(2)
          }}
        >
          {/* Native img: original URL, no crop, not forced to thumbnail resolution */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={`${altPrefix} ${safeIndex + 1} of ${count}`}
            draggable={false}
            className="max-h-full max-w-full select-none object-contain"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: dragRef.current ? undefined : 'transform 120ms ease-out',
            }}
          />
        </div>
      </div>

      <p className="shrink-0 px-3 py-2 text-center font-sans text-[11px] text-white/55 sm:px-5">
        Scroll to zoom · Drag when zoomed · Esc to close
      </p>
    </div>,
    document.body,
  )
}
