'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, ShoppingBag, Truck, RefreshCw, ShieldCheck, Minus, Plus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Product, formatINR } from '@/lib/products'
import { useCart } from '@/components/cart/cart-provider'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/layout/back-button'

const detailRows = (product: Product) => [
  { label: 'Fabric', value: product.fabric },
  { label: 'Weave', value: product.weave },
  { label: 'Length', value: product.length },
  { label: 'Blouse', value: product.blouse },
  { label: 'Care', value: product.care },
]

export function ProductDetail({ product }: { product: Product }) {
  const { addItem, toggleWishlist, isWishlisted, openCart } = useCart()
  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty] = useState(1)

  const wishlisted = isWishlisted(product.slug)
  const gallery = product.images.length > 0 ? product.images : [product.image]
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const handleAdd = () => {
    addItem(product, qty)
    openCart()
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <BackButton fallbackHref="/shop" />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        {/* gallery */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          {gallery.length > 1 ? (
            <div className="flex gap-3 sm:flex-col">
              {gallery.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    'relative h-20 w-16 shrink-0 overflow-hidden rounded-sm border bg-muted transition-colors sm:h-24 sm:w-20',
                    activeImage === i ? 'border-primary' : 'border-border',
                  )}
                >
                  <Image src={img || '/placeholder.svg'} alt="" fill sizes="80px" className="object-contain object-center" />
                </button>
              ))}
            </div>
          ) : null}
          <div className="relative aspect-[2/3] flex-1 overflow-hidden rounded-md bg-ivory p-4 sm:p-6">
            <div className="relative h-full w-full">
              <Image
                src={gallery[activeImage] || '/placeholder.svg'}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-contain object-center"
              />
            </div>            {discount > 0 ? (
              <span className="absolute left-4 top-4 bg-primary px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-luxe text-primary-foreground">
                Save {discount}%
              </span>
            ) : null}
          </div>
        </div>

        {/* info */}
        <div className="flex flex-col">
          <span className="font-sans text-xs uppercase tracking-luxe text-accent">
            {product.category}
          </span>
          <h1 className="mt-3 font-serif text-3xl text-foreground text-balance md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="font-sans text-2xl font-medium text-foreground">
              {formatINR(product.price)}
            </span>
            {product.originalPrice ? (
              <span className="font-sans text-lg text-muted-foreground line-through">
                {formatINR(product.originalPrice)}
              </span>
            ) : null}
          </div>

          <p className="mt-2 font-sans text-sm text-muted-foreground">
            Inclusive of all taxes
          </p>

          <span
            className={cn(
              'mt-5 w-fit rounded-full px-3 py-1 font-sans text-xs font-medium',
              product.availability === 'In Stock' && 'bg-secondary text-primary',
              product.availability === 'Low Stock' && 'bg-accent/25 text-accent-foreground',
              product.availability === 'Made to Order' && 'bg-muted text-muted-foreground',
            )}
          >
            {product.availability}
          </span>

          <p className="mt-6 font-sans text-sm leading-relaxed text-foreground/85 text-pretty">
            {product.description}
          </p>

          {/* quantity + actions */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-md border border-border">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="flex h-11 w-11 items-center justify-center text-foreground transition-colors hover:bg-secondary"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-sans text-sm font-medium" aria-live="polite">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                aria-label="Increase quantity"
                className="flex h-11 w-11 items-center justify-center text-foreground transition-colors hover:bg-secondary"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button size="lg" onClick={handleAdd} className="h-11 flex-1 min-w-40">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Add to Bag
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => toggleWishlist(product.slug)}
              aria-pressed={wishlisted}
              className="h-11 w-11 shrink-0 px-0"
            >
              <Heart
                className={cn('h-4 w-4', wishlisted && 'fill-primary text-primary')}
                aria-hidden="true"
              />
              <span className="sr-only">
                {wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              </span>
            </Button>
          </div>

          {/* trust icons */}
          <ul className="mt-8 grid grid-cols-3 gap-3 border-y border-border py-5">
            {[
              { icon: Truck, label: 'Free shipping over ₹5,000' },
              { icon: RefreshCw, label: '7-day easy returns' },
              { icon: ShieldCheck, label: 'Secure checkout' },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col items-center gap-2 text-center">
                <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} aria-hidden="true" />
                <span className="font-sans text-xs leading-tight text-muted-foreground text-pretty">
                  {label}
                </span>
              </li>
            ))}
          </ul>

          {/* details */}
          <dl className="mt-8 flex flex-col divide-y divide-border">
            {detailRows(product).map((row) => (
              <div key={row.label} className="flex gap-4 py-3">
                <dt className="w-28 shrink-0 font-sans text-xs uppercase tracking-wider text-muted-foreground">
                  {row.label}
                </dt>
                <dd className="font-sans text-sm text-foreground text-pretty">{row.value}</dd>
              </div>
            ))}
          </dl>

          <ul className="mt-6 flex flex-col gap-2">
            {['Handcrafted by master weavers', 'Directly supports weaving communities', 'Ships in premium gift packaging'].map(
              (point) => (
                <li key={point} className="flex items-center gap-2 font-sans text-sm text-foreground/85">
                  <Check className="h-4 w-4 text-primary" strokeWidth={2} aria-hidden="true" />
                  {point}
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}
