import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export function PageBanner({
  title,
  subtitle,
  breadcrumbs,
}: {
  title: string
  subtitle?: string
  breadcrumbs: { label: string; href?: string }[]
}) {
  return (
    <section className="border-b border-border bg-secondary/50 pb-12 pt-32 md:pt-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-1.5 font-sans text-xs uppercase tracking-wider text-muted-foreground">
            {breadcrumbs.map((crumb, i) => (
              <li key={crumb.label} className="flex items-center gap-1.5">
                {crumb.href ? (
                  <Link href={crumb.href} className="transition-colors hover:text-primary">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{crumb.label}</span>
                )}
                {i < breadcrumbs.length - 1 ? (
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                ) : null}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="font-serif text-4xl text-foreground text-balance md:text-5xl">{title}</h1>
        {subtitle ? (
          <p className="mt-3 max-w-xl font-sans text-sm leading-relaxed text-muted-foreground text-pretty md:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  )
}
