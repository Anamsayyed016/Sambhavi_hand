'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SectionHeader } from '@/components/layout/section-header'
import { ProductCard } from '@/components/product/product-card'
import { QuickViewModal } from '@/components/product/quick-view-modal'
import { products, type Product } from '@/lib/products'

export function NewArrivals() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [quickView, setQuickView] = useState<Product | null>(null)
  const newProducts = products.filter((p) => p.isNew)
  // duplicate so the carousel feels full on wide screens
  const items = [...newProducts, ...products].slice(0, 8)

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.8
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Just In"
            title="New Arrivals"
            subtitle="The latest weaves to join our atelier."
            align="left"
          />
          <div className="hidden shrink-0 gap-2 md:flex">
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Previous"
              className="flex size-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              <ChevronLeft className="size-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Next"
              className="flex size-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              <ChevronRight className="size-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:gap-6 md:mx-0 md:px-0"
        >
          {items.map((product, i) => (
            <div
              key={`${product.slug}-${i}`}
              className="w-[62%] shrink-0 snap-start sm:w-[42%] md:w-[30%] lg:w-[23.5%]"
            >
              <ProductCard product={product} onQuickView={setQuickView} />
            </div>
          ))}
        </div>
      </div>
      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </section>
  )
}
