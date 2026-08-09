'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'

export function Editorial() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <section ref={ref} className="relative grid grid-cols-1 overflow-hidden lg:grid-cols-2">
      {/* image */}
      <div className="relative h-[60vh] overflow-hidden bg-muted lg:h-auto lg:min-h-[38rem]">
        <motion.div style={{ y }} className="absolute inset-0 scale-110">
          <Image
            src="/images/editorial-drape.png"
            alt="The art of handloom — a maroon silk saree pallu"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>
      </div>

      {/* content */}
      <div className="flex items-center bg-wine px-6 py-16 md:px-14 lg:py-24">
        <Reveal className="flex max-w-lg flex-col gap-6">
          <span className="text-xs font-medium uppercase tracking-luxe text-accent">
            Editorial
          </span>
          <h2 className="text-balance font-serif text-3xl font-medium leading-tight text-ivory sm:text-4xl md:text-5xl">
            The Art of Handloom
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-ivory/80">
            Every thread carries a story. Every weave reflects generations of craftsmanship,
            patience and quiet devotion to a timeless art.
          </p>
          <div className="mt-2">
            <Button
              size="lg"
              render={<Link href="/shop" />}
              className="h-12 rounded-none bg-ivory px-10 text-xs uppercase tracking-luxe text-charcoal hover:bg-ivory/90"
            >
              Shop the Look
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
