'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-provider'
import { formatINR } from '@/lib/products'

export function CartDrawer() {
  const { isCartOpen, closeCart, items, removeItem, updateQuantity, subtotal, count } = useCart()

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isCartOpen])

  const shipping = subtotal > 0 && subtotal < 9999 ? 149 : 0
  const total = subtotal + shipping

  return (
    <AnimatePresence>
      {isCartOpen ? (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-charcoal/50 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-background shadow-2xl"
            role="dialog"
            aria-label="Shopping bag"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <h2 className="font-serif text-xl text-foreground">
                Your Bag{' '}
                <span className="text-sm font-sans text-muted-foreground">({count})</span>
              </h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close bag"
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag className="size-10 text-muted-foreground" strokeWidth={1} />
                <p className="text-muted-foreground">Your bag is empty.</p>
                <Button variant="outline" render={<Link href="/shop" onClick={closeCart} />}>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto px-6 py-4">
                  {items.map((item) => (
                    <li key={item.slug} className="flex gap-4 border-b border-border/60 py-4">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={closeCart}
                        className="relative aspect-3/4 w-20 shrink-0 overflow-hidden rounded-sm bg-muted"
                      >
                        <Image
                          src={item.image || '/placeholder.svg'}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-accent">
                              {item.category}
                            </p>
                            <Link
                              href={`/product/${item.slug}`}
                              onClick={closeCart}
                              className="font-serif text-base leading-tight text-foreground hover:text-primary"
                            >
                              {item.name}
                            </Link>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.slug)}
                            aria-label={`Remove ${item.name}`}
                            className="text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center rounded-full border border-border">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {formatINR(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-border px-6 py-5">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="text-foreground">{formatINR(subtotal)}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-sm text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-foreground">
                      {shipping === 0 ? 'Free' : formatINR(shipping)}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-between border-t border-border pt-3 font-serif text-lg text-foreground">
                    <span>Total</span>
                    <span>{formatINR(total)}</span>
                  </div>
                  <Button
                    className="mt-4 h-12 w-full rounded-none bg-primary text-sm uppercase tracking-luxe text-primary-foreground hover:bg-primary/90"
                    size="lg"
                  >
                    Proceed to Checkout
                  </Button>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="mt-3 w-full text-center text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
