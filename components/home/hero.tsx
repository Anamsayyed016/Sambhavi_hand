'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-charcoal md:min-h-screen">
      {/* background image with slow scale */}
      <motion.div
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0"
      >
        <Image
          src="/images/hero-saree.png"
          alt="Model wearing a deep maroon handloom silk saree"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/45 to-charcoal/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />

      {/* content */}
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-[5.5rem] md:px-8 md:pt-28">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-sans text-xs font-semibold uppercase tracking-luxe text-accent"
        >
          Sambhavi Handloom
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-hero-display max-w-2xl text-balance text-ivory"
        >
          Timeless Handloom.
          <br />
          Modern Elegance.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="max-w-md text-pretty font-sans text-sm font-normal leading-relaxed text-ivory/80 sm:text-[0.9375rem] sm:leading-relaxed"
        >
          Discover beautifully crafted sarees that celebrate Indian heritage, artistry and
          effortless elegance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.65 }}
          className="mt-2 flex flex-col gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            render={<Link href="/shop" />}
            className="h-12 rounded-none bg-ivory px-8 font-sans text-xs font-semibold uppercase tracking-btn text-charcoal hover:bg-ivory/90"
          >
            Shop Sarees
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={<Link href="/collections" />}
            className="h-12 rounded-none border-ivory/50 bg-transparent px-8 font-sans text-xs font-semibold uppercase tracking-btn text-ivory hover:bg-ivory/10 hover:text-ivory"
          >
            Explore Collection
          </Button>
        </motion.div>
      </div>

      {/* scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="text-[0.65rem] uppercase tracking-luxe text-ivory/60">Scroll</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY }}
          className="h-8 w-px bg-ivory/40"
        />
      </motion.div>
    </section>
  )
}
