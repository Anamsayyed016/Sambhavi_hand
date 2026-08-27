'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { reels, type Reel } from '@/lib/content'
import { getProduct } from '@/lib/products'
import { SectionHeader } from '@/components/layout/section-header'

function ReelCaption({
  reel,
  productName,
}: {
  reel: Reel
  productName?: string
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 p-4">
      <p className="font-sans text-sm font-medium text-background text-pretty">{reel.caption}</p>
      {productName ? (
        <p className="mt-1 font-sans text-xs text-background/80">Shop {productName}</p>
      ) : null}
    </div>
  )
}

function ReelCard({ reel, index }: { reel: Reel; index: number }) {
  const product = getProduct(reel.productSlug)
  const productHref = product ? `/product/${product.slug}` : '/shop'
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      void video.play()
    } else {
      video.pause()
    }
  }

  const playOverlay = (
    <div
      className={`absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 ${
        playing ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <Play className="h-5 w-5 translate-x-0.5 fill-primary text-primary" aria-hidden="true" />
    </div>
  )

  const gradient = (
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
  )

  if (reel.video) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, delay: index * 0.08 }}
      >
        <div className="group relative aspect-[9/16] overflow-hidden rounded-md bg-foreground/5">
          <video
            ref={videoRef}
            src={reel.video}
            poster={reel.poster}
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
          />
          {gradient}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? 'Pause video' : 'Play video'}
            className="absolute inset-0 z-10 cursor-pointer"
          >
            {playOverlay}
          </button>
          <Link
            href={productHref}
            className="absolute inset-x-0 bottom-0 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <ReelCaption reel={reel} productName={product?.name} />
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
    >
      <Link
        href={productHref}
        className="group relative block aspect-[9/16] overflow-hidden rounded-md bg-foreground/5"
      >
        <Image
          src={reel.poster || '/placeholder.svg'}
          alt={reel.caption}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {gradient}
        {playOverlay}
        <ReelCaption reel={reel} productName={product?.name} />
      </Link>
    </motion.div>
  )
}

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
          {reels.map((reel, i) => (
            <ReelCard key={reel.video ?? reel.poster} reel={reel} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
