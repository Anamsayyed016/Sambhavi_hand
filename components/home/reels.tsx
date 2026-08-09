'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { reels } from '@/lib/content'
import { getProduct } from '@/lib/products'
import { SectionHeader } from '@/components/layout/section-header'

export function Reels() {
  return (
    <section className="bg-secondary py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow="Watch & Shop"
          title="Sarees in Motion"
          subtitle="See how our drapes come alive. Tap a reel to shop the look."
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {reels.map((reel, i) => {
            const product = getProduct(reel.productSlug)
            return (
              <motion.div
                key={reel.poster}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                <Link
                  href={product ? `/product/${product.slug}` : '/shop'}
                  className="group relative block aspect-[9/16] overflow-hidden rounded-md bg-foreground/5"
                >
                  <Image
                    src={reel.poster || '/placeholder.svg'}
                    alt={reel.caption}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                  <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                    <Play className="h-5 w-5 translate-x-0.5 fill-primary text-primary" aria-hidden="true" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="font-sans text-sm font-medium text-background text-pretty">{reel.caption}</p>
                    {product ? (
                      <p className="mt-1 font-sans text-xs text-background/80">
                        Shop {product.name}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
