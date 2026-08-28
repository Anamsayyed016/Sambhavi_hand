'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/products'
import { ProductCard } from '@/components/product/product-card'
import { QuickViewModal } from '@/components/product/quick-view-modal'

export type ProductGridItem = {
  product: Product
  displayImage: string
  key: string
}

export function expandProductsForGrid(products: Product[]): ProductGridItem[] {
  return products.flatMap((product) => {
    const images = product.images?.filter(Boolean) ?? []
    const gallery =
      images.length > 0 ? images : [product.image || '/placeholder.svg']
    return gallery.map((displayImage, imageIndex) => ({
      product,
      displayImage,
      key: `${product.slug}-${imageIndex}-${displayImage}`,
    }))
  })
}

export function ProductGrid({
  products,
  className,
  columns = 'four',
  expandImages = false,
}: {
  products: Product[]
  className?: string
  columns?: 'three' | 'four'
  /** When true, each entry in product.images[] renders as its own card. */
  expandImages?: boolean
}) {
  const [quickView, setQuickView] = useState<Product | null>(null)

  const items = useMemo(
    () => (expandImages ? expandProductsForGrid(products) : products.map((product) => ({
        product,
        displayImage: product.image || product.images?.[0] || '/placeholder.svg',
        key: product.slug,
      }))),
    [products, expandImages],
  )

  const cols =
    columns === 'four'
      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      : 'grid-cols-2 md:grid-cols-3'

  return (
    <>
      <div
        className={cn(
          'grid gap-x-4 gap-y-10 sm:gap-x-6 lg:gap-x-8 lg:gap-y-12',
          cols,
          className,
        )}
      >
        {items.map((item, i) => (
          <motion.div
            key={item.key}
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductCard
              product={item.product}
              displayImage={item.displayImage}
              onQuickView={setQuickView}
              priority={i < 4}
            />
          </motion.div>
        ))}
      </div>
      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </>
  )
}
