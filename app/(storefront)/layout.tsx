import type React from 'react'
import { Suspense } from 'react'
import { CartProvider } from '@/components/cart/cart-provider'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { BrowseScrollRestorer } from '@/components/layout/browse-scroll-restorer'
import { getPricedStorefrontProducts } from '@/lib/catalog/db-pricing'

export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let navProducts: Array<{
    slug: string
    image: string
    images: string[]
    category: string
    collections: string[]
  }> = []
  try {
    const products = await getPricedStorefrontProducts()
    navProducts = products.map((p) => ({
      slug: p.slug,
      image: p.image,
      images: p.images,
      category: p.category,
      collections: p.collections,
    }))
  } catch {
    navProducts = []
  }

  return (
    <CartProvider>
      <Navbar navProducts={navProducts} />
      <CartDrawer />
      <Suspense fallback={null}>
        <BrowseScrollRestorer />
      </Suspense>
      <main>{children}</main>
      <Footer />
    </CartProvider>
  )
}
