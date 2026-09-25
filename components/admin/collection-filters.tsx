'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const selectClass =
  'h-10 w-full rounded-md border border-border/80 bg-white px-3 text-sm text-charcoal outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30'

export function CollectionFilters({
  q,
  active,
  sort,
}: {
  q: string
  active: string
  sort: string
}) {
  const router = useRouter()
  const [query, setQuery] = useState(q)

  function apply(next: Record<string, string>) {
    const params = new URLSearchParams()
    const nextQ = next.q !== undefined ? next.q : query
    const nextActive = next.active ?? active
    const nextSort = next.sort ?? sort

    if (nextQ.trim()) params.set('q', nextQ.trim())
    if (nextActive && nextActive !== 'all') params.set('active', nextActive)
    if (nextSort && nextSort !== 'name_asc') params.set('sort', nextSort)

    const qs = params.toString()
    router.push(qs ? `/admin/collections?${qs}` : '/admin/collections')
  }

  return (
    <form
      className="rounded-md border border-border/80 bg-[#faf8f4] p-4 shadow-[0_1px_0_rgba(40,30,20,0.03)] sm:p-5"
      onSubmit={(e) => {
        e.preventDefault()
        apply({})
      }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-3">
        <div className="min-w-0 flex-1">
          <label
            htmlFor="collections-search"
            className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
          >
            Search
          </label>
          <input
            id="collections-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or slug…"
            className="mt-1.5 h-10 w-full rounded-md border border-border/80 bg-white px-3.5 text-sm text-charcoal outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:shrink-0 sm:gap-3">
          <div className="min-w-0 sm:w-[9.5rem]">
            <label
              htmlFor="collections-status"
              className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
            >
              Status
            </label>
            <select
              id="collections-status"
              className={`mt-1.5 ${selectClass}`}
              value={active}
              onChange={(e) => apply({ active: e.target.value })}
            >
              <option value="all">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="min-w-0 sm:w-[11.5rem]">
            <label
              htmlFor="collections-sort"
              className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
            >
              Sort
            </label>
            <select
              id="collections-sort"
              className={`mt-1.5 ${selectClass}`}
              value={sort}
              onChange={(e) => apply({ sort: e.target.value })}
            >
              <option value="name_asc">Name A–Z</option>
              <option value="name_desc">Name Z–A</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="products_desc">Products high → low</option>
              <option value="products_asc">Products low → high</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="h-10 shrink-0 rounded-md bg-wine px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-wine/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Search
        </button>
      </div>
    </form>
  )
}
