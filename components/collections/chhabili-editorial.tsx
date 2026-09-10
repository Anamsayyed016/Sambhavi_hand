'use client'

import { useState } from 'react'
import { formatINR, type Product } from '@/lib/products'
import { Button } from '@/components/ui/button'
import { ProductImageZoom } from '@/components/product/product-image-zoom'
import { ProductLink } from '@/components/product/product-link'

/** Supporting collage for the CHHABILI collection story — not a separate product. */
export const CHHABILI_EDITORIAL_IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789022728/WhatsApp_Image_2026-09-10_at_11.16.48_AM_1.jpg'

const SPEC_LINES = [
  'Pure Cotton',
  '8 meter flair',
  'Length: 41"',
  'Waist: Fits up to 42"',
  'Top: 38" standard sizing',
  'Adjustable margin: 36"–40"',
  'Top Length: 25"',
] as const

export function ChhabiliEditorialFeature({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState(0)

  return (
    <section
      aria-label="CHHABILI collection feature"
      className="mb-14 border-b border-border/60 pb-14 md:mb-16 md:pb-16"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:items-stretch lg:gap-x-12 lg:gap-y-8 xl:gap-x-16">
        {/* Intro + specs — first on mobile, top-right on desktop */}
        <div className="order-1 space-y-5 lg:col-start-2 lg:row-start-1">
          <div className="space-y-3">
            <p className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-accent">
              NEW · NAVRATRI 2026
            </p>
            <h2 className="font-serif text-3xl tracking-[0.04em] text-foreground md:text-4xl">
              CHHABILI
            </h2>
            <p className="max-w-md font-sans text-sm leading-relaxed text-muted-foreground md:text-base">
              Designed for festive celebrations, Garba nights and special occasions.
            </p>
          </div>

          <ul className="space-y-1.5 font-sans text-sm leading-relaxed text-foreground/85">
            {SPEC_LINES.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <div className="space-y-3 border-t border-border/50 pt-5">
            <div>
              <p className="font-sans text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                Package Contains
              </p>
              <p className="mt-1 font-sans text-sm text-foreground">Lehenga · Top · Purse</p>
            </div>
            <div>
              <p className="font-sans text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                Weight
              </p>
              <p className="mt-1 font-sans text-sm text-foreground">1.300 Kg</p>
            </div>
          </div>
        </div>

        {/* Collage — below intro on mobile, full left column on desktop */}
        <div className="order-2 flex items-start justify-center lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:justify-start lg:self-stretch">
          <ProductImageZoom
            images={[CHHABILI_EDITORIAL_IMAGE]}
            alt="CHHABILI Navratri 2026 collection collage"
            activeIndex={activeImage}
            onActiveIndexChange={setActiveImage}
            variant="editorial"
          />
        </div>

        {/* Price + CTA — after image on mobile, bottom-right on desktop */}
        <div className="order-3 space-y-4 border-t border-border/50 pt-5 lg:col-start-2 lg:row-start-2 lg:flex lg:flex-col lg:justify-end lg:border-t-0 lg:pt-0">
          <div>
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
              Price
            </p>
            <p className="mt-1 font-serif text-2xl text-foreground md:text-3xl">
              {formatINR(product.price)}
            </p>
          </div>
          <Button
            size="lg"
            render={<ProductLink href={`/product/${product.slug}`} />}
            className="h-11 w-fit rounded-none bg-primary px-8 font-sans text-xs font-semibold uppercase tracking-luxe text-primary-foreground hover:bg-primary/90"
          >
            View CHHABILI
          </Button>
        </div>
      </div>
    </section>
  )
}
