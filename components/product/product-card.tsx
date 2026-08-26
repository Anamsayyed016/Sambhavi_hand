'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Product, formatINR } from '@/lib/products'
import { useCart } from '@/components/cart/cart-provider'

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

  return (
    <div className="group flex flex-col">
      <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-ivory">
        <Link
          href={`/product/${product.slug}`}
          aria-label={product.name}
          className="absolute inset-0 p-3 sm:p-4"
        >
          <span className="relative block h-full w-full">
            <Image
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              className="object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
          </span>
        </Link>

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
