'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const selectClass =
  'rounded-md border border-border bg-white px-2.5 py-2 text-sm outline-none focus:border-ring'

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
      className="flex flex-col gap-3 rounded-md border border-border bg-[#faf8f4] p-4 lg:flex-row lg:flex-wrap lg:items-end"
      onSubmit={(e) => {
        e.preventDefault()
        apply({})
      }}
    >
      <div className="min-w-[200px] flex-1">
        <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Search</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name or slug…"
          className="mt-1.5 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-ring"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Status</label>
        <select
          className={`mt-1.5 block ${selectClass}`}
          value={active}
          onChange={(e) => apply({ active: e.target.value })}
        >
          <option value="all">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Sort</label>
        <select
          className={`mt-1.5 block ${selectClass}`}
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

      <button
        type="submit"
        className="rounded-md bg-wine px-3 py-2 text-sm text-primary-foreground hover:bg-wine/90"
      >
        Search
      </button>
    </form>
  )
}
