'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/products'
import { isGalleryVideoUrl } from '@/lib/gallery-media'
import { ProductCard } from '@/components/product/product-card'
import { QuickViewModal } from '@/components/product/quick-view-modal'

export type ProductGridItem = {
  product: Product
  displayImage: string
  key: string
}

/**
 * LEGACY saree browse UX only: one grid card per gallery frame.
 * Do NOT use for New Arrivals, CHHABILI, LEHANGA, or any product/catalog listing.
 * Video URLs are skipped — next/image cannot render mp4 and would show a broken icon.
 */
export function expandProductsForGrid(products: Product[]): ProductGridItem[] {
  return products.flatMap((product) => {
    const images = (product.images?.filter(Boolean) ?? []).filter(
      (url) => !isGalleryVideoUrl(url),
    )
    const gallery =
      images.length > 0
        ? images
        : [product.image || '/placeholder.svg'].filter((url) => !isGalleryVideoUrl(url))
    const frames =
      gallery.length > 0 ? gallery : ['/placeholder.svg']
    return frames.map((displayImage, imageIndex) => ({
      product,
      displayImage,
      key: `${product.slug}-${imageIndex}-${displayImage}`,
    }))
  })
}

/** One card per unique product/catalog — primary image only (`product.image` / images[0]). */
export function toProductCatalogCards(products: Product[]): ProductGridItem[] {
  const seen = new Set<string>()
  const items: ProductGridItem[] = []
  for (const product of products) {
    if (seen.has(product.slug)) continue
    seen.add(product.slug)
    items.push({
      product,
      displayImage: product.image || product.images?.[0] || '/placeholder.svg',
      key: product.slug,
    })
  }
  return items
}

export function ProductGrid({
  products,
  className,
  columns = 'four',
  expandImages = false,
}: {
  products: Product[]
  className?: string
  /** `featured` = larger editorial cards for sparse catalogs (e.g. DHARVI). */
  columns?: 'three' | 'four' | 'featured'
  /**
   * When true, each gallery image becomes its own card (legacy saree browse).
   * Default false = one card per product using the primary image.
   * New Arrivals must always leave this false.
   */
  expandImages?: boolean
}) {
  const [quickView, setQuickView] = useState<Product | null>(null)

  const items = useMemo(
    () =>
      expandImages ? expandProductsForGrid(products) : toProductCatalogCards(products),
    [products, expandImages],
  )

  const cols =
    columns === 'four'
      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      : columns === 'featured'
        ? items.length <= 1
          ? 'grid-cols-1 max-w-[min(100%,22rem)] sm:max-w-[26rem] md:max-w-[30rem] lg:max-w-[32rem]'
          : items.length === 2
            ? 'grid-cols-1 sm:grid-cols-2 max-w-5xl'
            : // 3+ products: one desktop row, 2 on tablet, 1 on mobile — full content width
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
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
