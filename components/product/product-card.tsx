'use client'

import { useCallback, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Heart, ShoppingBag, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Product, formatINR } from '@/lib/products'
import { useCart } from '@/components/cart/cart-provider'

function productGallery(product: Product): string[] {
  const images = product.images?.filter(Boolean) ?? []
  if (images.length > 0) return images
  return [product.image || '/placeholder.svg']
}

export function ProductCard({
  product,
  onQuickView,
  priority = false,
}: {
  product: Product
  onQuickView?: (product: Product) => void
  priority?: boolean
}) {
  const { addItem, toggleWishlist, isWishlisted } = useCart()
  const wishlisted = isWishlisted(product.slug)
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const gallery = productGallery(product)
  const hasMultiple = gallery.length > 1
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const didSwipe = useRef(false)

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(((index % gallery.length) + gallery.length) % gallery.length)
    },
    [gallery.length],
  )

  const step = useCallback(
    (direction: -1 | 1) => {
      goTo(activeIndex + direction)
    },
    [activeIndex, goTo],
  )

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    didSwipe.current = false
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy)) {
      didSwipe.current = true
      step(dx > 0 ? -1 : 1)
    }
    touchStart.current = null
  }

  const onImageLinkClick = (e: React.MouseEvent) => {
    if (didSwipe.current) {
      e.preventDefault()
      didSwipe.current = false
    }
  }

  return (
    <div className="group flex flex-col">
      <div
        className="relative aspect-[2/3] overflow-hidden rounded-sm bg-ivory p-4 sm:p-5"
        onTouchStart={hasMultiple ? onTouchStart : undefined}
        onTouchEnd={hasMultiple ? onTouchEnd : undefined}
      >
        <div className="relative h-full w-full">
          {gallery.map((src, i) => (
            <Image
              key={`${product.slug}-${src}`}
              src={src}
              alt={i === 0 ? product.name : `${product.name} — view ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1408px) 30vw, 28vw"
              priority={priority && i === 0}
              className={cn(
                'object-contain object-center transition-opacity duration-500 ease-out',
                i === activeIndex ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
              aria-hidden={i !== activeIndex}
            />
          ))}
        </div>

        <Link
          href={`/product/${product.slug}`}
          aria-label={product.name}
          onClick={onImageLinkClick}
          className="absolute inset-0 z-[1]"
        />

        {hasMultiple ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                step(-1)
              }}
              className="absolute left-2 top-1/2 z-[2] flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/75 text-foreground/80 opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-background hover:text-primary group-hover:opacity-100 md:left-3"
            >
              <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                step(1)
              }}
              className="absolute right-2 top-1/2 z-[2] flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/75 text-foreground/80 opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-background hover:text-primary group-hover:opacity-100 md:right-3"
            >
              <ChevronRight className="size-4" strokeWidth={1.5} aria-hidden />
            </button>
            <div className="absolute inset-x-0 bottom-14 z-[2] flex justify-center gap-2.5 px-10">
              {gallery.map((src, i) => (
                <button
                  key={`nav-${src}`}
                  type="button"
                  aria-label={`Show image ${i + 1} of ${gallery.length}`}
                  aria-current={i === activeIndex ? 'true' : undefined}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    goTo(i)
                  }}
                  className="flex h-4 w-4 items-center justify-center"
                >
                  <span
                    className={cn(
                      'block rounded-full transition-all duration-300',
                      i === activeIndex ? 'size-1.5 bg-primary' : 'size-1 bg-foreground/30',
                    )}
                  />
                </button>
              ))}
            </div>
          </>
        ) : null}

        {/* badges */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {product.isNew ? (
            <span className="w-fit bg-charcoal px-2 py-1 text-[0.6rem] font-medium uppercase tracking-luxe text-ivory">
              New
            </span>
          ) : null}
          {discount > 0 ? (
            <span className="w-fit bg-primary px-2 py-1 text-[0.6rem] font-medium uppercase tracking-luxe text-primary-foreground">
              -{discount}%
            </span>
          ) : null}
        </div>

        {/* wishlist */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.slug)}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wishlisted}
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-all duration-300 hover:bg-background"
        >
          <Heart
            className={cn('size-4 transition-all', wishlisted && 'scale-110 fill-primary text-primary')}
            strokeWidth={1.5}
          />
        </button>

        {/* quick actions */}
        <div className="absolute inset-x-3 bottom-3 z-10 flex translate-y-3 gap-2 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => addItem(product)}
            className="flex h-10 flex-1 items-center justify-center gap-2 bg-primary text-xs font-medium uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ShoppingBag className="size-4" strokeWidth={1.5} />
            Add to Bag
          </button>
          {onQuickView ? (
            <button
              type="button"
              onClick={() => onQuickView(product)}
              aria-label="Quick view"
              className="flex size-10 items-center justify-center bg-background text-foreground transition-colors hover:bg-secondary"
            >
              <Eye className="size-4" strokeWidth={1.5} />
            </button>
          ) : null}
        </div>
      </div>

      {/* info */}
      <div className="flex flex-col gap-1 pt-4">
        <span className="text-[0.65rem] uppercase tracking-luxe text-accent">
          {product.category}
        </span>
        <Link
          href={`/product/${product.slug}`}
          className="font-serif text-lg leading-tight text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-sm font-medium text-foreground">{formatINR(product.price)}</span>
          {product.originalPrice ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatINR(product.originalPrice)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
