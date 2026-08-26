'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type Product, formatINR } from '@/lib/products'
import { useCart } from '@/components/cart/cart-provider'

export function QuickViewModal({
  product,
  onClose,
}: {
  product: Product | null
  onClose: () => void
}) {
  const { addItem, toggleWishlist, isWishlisted } = useCart()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {product ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-charcoal/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative grid max-h-[90vh] w-full max-w-3xl grid-cols-1 overflow-hidden rounded-sm bg-background shadow-2xl sm:grid-cols-2"
              role="dialog"
              aria-label={`Quick view: ${product.name}`}
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="Close quick view"
                className="absolute right-3 top-3 z-10 rounded-full bg-background/80 p-1.5 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
              >
                <X className="size-5" />
              </button>
              <div className="relative aspect-[2/3] bg-ivory p-4 sm:aspect-auto sm:min-h-[28rem] sm:p-6">
                <div className="relative h-full min-h-[18rem] w-full sm:min-h-full">
                  <Image
                    src={product.image || '/placeholder.svg'}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 384px"
                    className="object-contain object-center"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4 overflow-y-auto p-6 sm:p-8">
                <span className="text-xs uppercase tracking-luxe text-accent">
                  {product.category}
                </span>
                <h3 className="font-serif text-2xl leading-tight text-foreground">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium text-foreground">
                    {formatINR(product.price)}
                  </span>
                  {product.originalPrice ? (
                    <span className="text-muted-foreground line-through">
                      {formatINR(product.originalPrice)}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
                <dl className="flex flex-col gap-1 text-sm">
                  <div className="flex gap-2">
                    <dt className="text-muted-foreground">Fabric:</dt>
                    <dd className="text-foreground">{product.fabric}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-muted-foreground">Weave:</dt>
                    <dd className="text-foreground">{product.weave}</dd>
                  </div>
                </dl>
                <div className="mt-auto flex flex-col gap-3 pt-2">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        addItem(product)
                        onClose()
                      }}
                      className="h-11 flex-1 rounded-none bg-primary text-xs uppercase tracking-luxe text-primary-foreground hover:bg-primary/90"
                    >
                      Add to Bag
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toggleWishlist(product.slug)}
                      aria-label="Add to wishlist"
                      className="size-11 rounded-none border-border p-0"
                    >
                      <Heart
                        className={isWishlisted(product.slug) ? 'fill-primary text-primary' : ''}
                      />
                    </Button>
                  </div>
                  <Button
                    variant="link"
                    render={<Link href={`/product/${product.slug}`} onClick={onClose} />}
                    className="text-xs uppercase tracking-wide text-muted-foreground"
                  >
                    View Full Details
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
