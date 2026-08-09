'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/products'
import { ProductCard } from '@/components/product/product-card'
import { QuickViewModal } from '@/components/product/quick-view-modal'

export function ProductGrid({
  products,
  className,
  columns = 'four',
}: {
  products: Product[]
  className?: string
  columns?: 'three' | 'four'
}) {
  const [quickView, setQuickView] = useState<Product | null>(null)

  const cols =
    columns === 'four'
      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      : 'grid-cols-2 md:grid-cols-3'

  return (
    <>
      <div className={cn('grid gap-x-4 gap-y-10 sm:gap-x-6', cols, className)}>
        {products.map((product, i) => (
          <motion.div
            key={product.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: (i % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductCard product={product} onQuickView={setQuickView} priority={i < 4} />
          </motion.div>
        ))}
      </div>
      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </>
  )
}
