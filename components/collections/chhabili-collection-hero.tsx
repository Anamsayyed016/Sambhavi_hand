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
      <ol className="flex flex-wrap items-center justify-center gap-1 font-sans text-[0.625rem] uppercase tracking-[0.16em] text-ivory/55">
        {breadcrumbs.map((crumb, i) => (
          <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
            {crumb.href ? (
              <Link href={crumb.href} className="transition-colors hover:text-accent">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-ivory/85">{crumb.label}</span>
            )}
            {i < breadcrumbs.length - 1 ? (
              <ChevronRight className="h-2.5 w-2.5 text-ivory/35" aria-hidden="true" />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}

function HeroCopy({ className }: { className?: string }) {
  return (
    <div className={cn('mx-auto flex max-w-xl flex-col items-center text-center', className)}>
      <p className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.22em] text-accent sm:text-[0.6875rem]">
        NEW · NAVRATRI 2026
      </p>

      <span
        className="mt-4 h-px w-10 bg-accent/70"
        aria-hidden="true"
      />

      <h1 className="mt-4 font-serif text-[2.35rem] font-normal tracking-[0.08em] text-ivory sm:text-5xl md:text-[3.35rem] md:tracking-[0.1em]">
        CHHABILI
      </h1>

      <p className="mt-3 font-sans text-[0.625rem] font-medium uppercase tracking-[0.28em] text-ivory/70 sm:text-[0.6875rem]">
        Festive Edition
      </p>

      <span
        className="mt-4 h-px w-6 bg-ivory/25"
        aria-hidden="true"
      />

      <p className="mt-4 max-w-sm font-sans text-[0.8125rem] leading-relaxed text-ivory/65 text-pretty sm:text-sm">
        Explore the Chhabili festive collection.
      </p>
    </div>
  )
}

function CollageImage({ className }: { className?: string }) {
  return (
    // Native img preserves full Cloudinary resolution + natural aspect (no forced crop).
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={CHHABILI_HERO_IMAGE}
      alt="CHHABILI Navratri 2026 festive collection"
      className={cn(
        'mx-auto h-auto w-full object-contain object-center',
        className,
      )}
      decoding="async"
      fetchPriority="high"
    />
  )
}

/**
 * Refined CHHABILI category hero —
 * narrower centered collage, shorter banner height, decorative editorial type.
 */
export function ChhabiliCollectionHero({ breadcrumbs }: { breadcrumbs: Crumb[] }) {
  return (
    <section
      aria-label="CHHABILI collection"
      className="relative overflow-hidden border-b border-border/30 bg-[#1a1410]"
    >
      {/* Soft warm charcoal field — intentional campaign negative space */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(58,42,36,0.55)_0%,_transparent_68%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-[88rem] flex-col items-center px-5 pb-10 pt-28 md:px-8 md:pb-12 md:pt-32">
        <HeroBreadcrumbs breadcrumbs={breadcrumbs} />

        {/* Copy sits in the dark field above the collage — never over faces */}
        <HeroCopy className="mt-7 md:mt-8" />

        {/* Centered editorial still: ~900–1050px max, shorter banner height, aspect preserved */}
        <div className="mt-8 flex w-full justify-center md:mt-9">
          <div className="w-full max-w-[min(100%,980px)] px-1 sm:px-2">
            <CollageImage className="max-h-[17rem] sm:max-h-[19rem] md:max-h-[22rem] lg:max-h-[24rem]" />
          </div>
        </div>
      </div>
    </section>
  )
}
