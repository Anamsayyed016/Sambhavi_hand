'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { getStorefrontProduct, formatINR } from '@/lib/products'
import { useCart } from '@/components/cart/cart-provider'
import { Button } from '@/components/ui/button'

export function WishlistView() {
  const { wishlist, toggleWishlist, addItem } = useCart()
  const items = wishlist.map((slug) => getStorefrontProduct(slug)).filter(Boolean)

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center md:py-24">
        <Heart className="mx-auto size-10 text-muted-foreground" strokeWidth={1.25} aria-hidden />
        <h1 className="mt-6 font-serif text-3xl text-foreground">Your wishlist is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Save sarees you love and return to them anytime. Your list is stored on this device.
        </p>
        <Button className="mt-8 rounded-none" render={<Link href="/shop" />}>
          Continue Shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-foreground md:text-4xl">Wishlist</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {items.length} saved item{items.length === 1 ? '' : 's'} · stored on this device
        </p>
      </div>

      <ul className="divide-y divide-border border-y border-border">
        {items.map((product) => {
          if (!product) return null
          return (
            <li key={product.slug} className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center">
              <Link
                href={`/product/${product.slug}`}
                className="relative aspect-3/4 w-28 shrink-0 overflow-hidden rounded-sm bg-muted"
              >
                <Image
                  src={product.image || '/placeholder.svg'}
                  alt=""
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${product.slug}`}
                  className="font-serif text-lg text-foreground hover:text-primary"
                >
                  {product.name}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
                <p className="mt-2 text-sm font-medium">{formatINR(product.price)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="rounded-none"
                  onClick={() => addItem(product)}
                >
                  <ShoppingBag className="size-4" strokeWidth={1.5} />
                  Add to Bag
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-none"
                  onClick={() => toggleWishlist(product.slug)}
                  aria-label={`Remove ${product.name} from wishlist`}
                >
                  <Trash2 className="size-4" strokeWidth={1.5} />
                  Remove
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
