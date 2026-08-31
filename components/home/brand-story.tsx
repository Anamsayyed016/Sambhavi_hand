'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'

export function BrandStory() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* images */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-4/5 overflow-hidden rounded-sm"
          >
            <Image
              src="/images/artisan-weaving.png"
              alt="Artisan weaving a silk saree on a traditional handloom"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="absolute -bottom-8 -right-4 hidden aspect-square w-40 overflow-hidden rounded-sm border-4 border-background shadow-xl sm:block md:w-52"
          >
            <Image
              src="/images/editorial-drape.png"
              alt="Close-up of a handwoven saree drape"
              fill
              sizes="200px"
              className="object-cover"
            />
          </motion.div>
        </div>

        {/* text */}
        <Reveal className="flex flex-col gap-5">
          <span className="text-xs font-medium uppercase tracking-luxe text-accent">
            Our Story
          </span>
          <h2 className="text-editorial-serif text-balance text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl">
            Where Tradition Meets Timeless Beauty
          </h2>
          <p className="text-pretty leading-relaxed text-muted-foreground">
            Sambhavi Handloom was born from a deep reverence for India&apos;s weaving heritage. Each
            saree is crafted by skilled artisans who have inherited their craft across generations,
            using traditional techniques and the finest natural fabrics.
          </p>
          <p className="text-pretty leading-relaxed text-muted-foreground">
            From the pit looms of Varanasi to the silk clusters of Kanchipuram, we work directly
            with weaving communities — preserving authentic craftsmanship while reimagining it for
            the modern woman.
          </p>
          <div className="mt-2">
            <Button
              size="lg"
              render={<Link href="/about" />}
              className="h-12 rounded-none bg-primary px-10 text-xs uppercase tracking-luxe text-primary-foreground hover:bg-primary/90"
            >
              Discover Our Story
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
