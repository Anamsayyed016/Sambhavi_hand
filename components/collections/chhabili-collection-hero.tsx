import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { BackButton } from '@/components/layout/back-button'
import { cn } from '@/lib/utils'

/** CHHABILI campaign collage — category hero visual only. */
export const CHHABILI_HERO_IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789022728/WhatsApp_Image_2026-09-10_at_11.16.48_AM_1.jpg'

type Crumb = { label: string; href?: string }

function HeroBreadcrumbs({
  breadcrumbs,
  className,
}: {
  breadcrumbs: Crumb[]
  className?: string
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 font-sans text-[0.625rem] uppercase tracking-[0.16em] text-ivory/70">
        {breadcrumbs.map((crumb, i) => (
          <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
            {crumb.href ? (
              <Link href={crumb.href} className="transition-colors hover:text-accent">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-ivory">{crumb.label}</span>
            )}
            {i < breadcrumbs.length - 1 ? (
              <ChevronRight className="h-2.5 w-2.5 text-ivory/45" aria-hidden="true" />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}

function HeroCopy({ className }: { className?: string }) {
  return (
    <div className={cn('flex max-w-xl flex-col', className)}>
      <p className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.22em] text-accent sm:text-[0.6875rem]">
        Latest Collection
      </p>

      <span className="mt-4 h-px w-10 bg-accent/75" aria-hidden="true" />

      <h1 className="mt-4 font-serif text-[2.35rem] font-normal tracking-[0.08em] text-ivory sm:text-5xl md:text-[3.35rem] md:tracking-[0.1em]">
        CHHABILI
      </h1>

      <p className="mt-3 font-sans text-[0.625rem] font-medium uppercase tracking-[0.28em] text-ivory/80 sm:text-[0.6875rem]">
        Festive Edition
      </p>

      <span className="mt-4 h-px w-6 bg-ivory/30" aria-hidden="true" />

      <p className="mt-4 max-w-sm font-sans text-[0.8125rem] leading-relaxed text-ivory/75 text-pretty sm:text-sm">
        Explore the Chhabili festive collection.
      </p>
    </div>
  )
}

/**
 * Full-bleed CHHABILI campaign hero —
 * collage covers the entire hero area; copy sits in a soft top-left veil only.
 */
export function ChhabiliCollectionHero({ breadcrumbs }: { breadcrumbs: Crumb[] }) {
  return (
    <section
      aria-label="CHHABILI collection"
      className="relative h-[min(72vw,34rem)] min-h-[22rem] overflow-hidden border-b border-border/30 md:h-[38rem] md:min-h-0 lg:h-[40rem]"
    >
      {/* Full-bleed cover — no side gutters / empty panels */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={CHHABILI_HERO_IMAGE}
        alt="CHHABILI festive collection"
        className="absolute inset-0 h-full w-full object-cover object-[62%_center] sm:object-[58%_center] md:object-[55%_center]"
        decoding="async"
        fetchPriority="high"
      />

      {/* Soft veil only behind text — keeps collage bright elsewhere */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1a1410]/78 via-[#1a1410]/28 to-transparent md:bg-gradient-to-r md:from-[#1a1410]/72 md:via-[#1a1410]/28 md:to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-[#1a1410]/55 to-transparent md:h-[48%]"
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full flex-col px-5 pb-8 pt-28 md:px-8 md:pb-10 md:pt-32 lg:px-12">
        <BackButton
          fallbackHref="/collections/navratri-collection"
          className="mb-3 text-ivory/75 hover:text-accent"
        />
        <HeroBreadcrumbs breadcrumbs={breadcrumbs} />
        <HeroCopy className="mt-7 md:mt-9" />
      </div>
    </section>
  )
}
