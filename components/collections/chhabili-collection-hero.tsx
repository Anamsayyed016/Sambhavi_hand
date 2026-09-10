import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/** CHHABILI / Navratri 2026 campaign collage — category hero visual only. */
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
      <ol className="flex flex-wrap items-center gap-1.5 font-sans text-[0.65rem] uppercase tracking-[0.14em] text-ivory/65 sm:text-xs">
        {breadcrumbs.map((crumb, i) => (
          <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
            {crumb.href ? (
              <Link href={crumb.href} className="transition-colors hover:text-accent">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-ivory">{crumb.label}</span>
            )}
            {i < breadcrumbs.length - 1 ? (
              <ChevronRight className="h-3 w-3 text-ivory/40" aria-hidden="true" />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}

function HeroCopy({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <p className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-accent">
        NEW · NAVRATRI 2026
      </p>
      <h1 className="text-hero-display text-balance text-ivory">CHHABILI</h1>
      <p className="font-sans text-xs font-medium uppercase tracking-[0.16em] text-ivory/75">
        Festive Edition
      </p>
      <p className="max-w-md font-sans text-sm leading-relaxed text-ivory/70 text-pretty md:text-[0.9375rem]">
        Explore the Chhabili festive collection.
      </p>
    </div>
  )
}

/**
 * Replaces the plain category PageBanner for CHHABILI —
 * collage lives inside the category-title hero, not as a separate section.
 */
export function ChhabiliCollectionHero({ breadcrumbs }: { breadcrumbs: Crumb[] }) {
  return (
    <section
      aria-label="CHHABILI collection"
      className="relative overflow-hidden border-b border-border/30 bg-charcoal"
    >
      {/* —— Mobile: title stack, then full collage (no crop / no overflow) —— */}
      <div className="md:hidden">
        <div className="px-5 pb-6 pt-28">
          <HeroBreadcrumbs breadcrumbs={breadcrumbs} />
          <HeroCopy className="mt-7" />
        </div>
        <div className="bg-[#241c18] px-4 pb-10">
          <div className="overflow-hidden rounded-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={CHHABILI_HERO_IMAGE}
              alt="CHHABILI Navratri 2026 festive collection"
              className="h-auto w-full object-contain"
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>

      {/* —— Desktop: collage is the category hero; copy sits in a soft top veil —— */}
      <div className="relative hidden md:block">
        <div className="mx-auto max-w-[88rem] px-8 pb-14 pt-32 lg:px-10">
          <div className="relative overflow-hidden rounded-sm bg-[#241c18]">
            <div className="flex justify-center px-6 pb-8 pt-2 lg:px-10 lg:pb-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={CHHABILI_HERO_IMAGE}
                alt="CHHABILI Navratri 2026 festive collection"
                className="mx-auto h-auto max-h-[min(72vh,54rem)] w-auto max-w-full object-contain"
                decoding="async"
                fetchPriority="high"
              />
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-charcoal/92 via-charcoal/55 to-transparent pb-28 pt-8 lg:pb-32 lg:pt-10">
              <div className="pointer-events-auto px-8 lg:px-12">
                <HeroBreadcrumbs breadcrumbs={breadcrumbs} />
                <HeroCopy className="mt-8 max-w-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
