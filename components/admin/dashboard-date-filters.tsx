'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { DASHBOARD_RANGE_OPTIONS, type DateRangeKey } from '@/lib/admin/analytics'
import { cn } from '@/lib/utils'

export function DashboardDateFilters({
  range,
  from,
  to,
  basePath = '/admin',
}: {
  range: DateRangeKey
  from?: string
  to?: string
  basePath?: string
}) {
  const router = useRouter()
  const [customFrom, setCustomFrom] = useState(from ?? '')
  const [customTo, setCustomTo] = useState(to ?? '')

  function hrefFor(key: DateRangeKey) {
    if (key === 'custom') return `${basePath}?range=custom`
    return `${basePath}?range=${key}`
  }

  function applyCustom(e: React.FormEvent) {
    e.preventDefault()
    if (!customFrom || !customTo) return
    const params = new URLSearchParams({
      range: 'custom',
      from: customFrom,
      to: customTo,
    })
    router.push(`${basePath}?${params.toString()}`)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {DASHBOARD_RANGE_OPTIONS.map((opt) => (
          <Link
            key={opt.key}
            href={hrefFor(opt.key)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-xs transition-colors',
              range === opt.key
                ? 'border-wine/40 bg-wine/10 font-medium text-wine'
                : 'border-border bg-white text-charcoal/80 hover:bg-beige/60',
            )}
          >
            {opt.label}
          </Link>
        ))}
      </div>
      {range === 'custom' ? (
        <form onSubmit={applyCustom} className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-muted-foreground">
            From
            <input
              type="date"
              required
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="mt-1 block rounded-md border border-border bg-white px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-muted-foreground">
            To
            <input
              type="date"
              required
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="mt-1 block rounded-md border border-border bg-white px-2 py-1.5 text-sm"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-wine px-3 py-2 text-xs text-primary-foreground hover:bg-wine/90"
          >
            Apply
          </button>
        </form>
      ) : null}
    </div>
  )
}
