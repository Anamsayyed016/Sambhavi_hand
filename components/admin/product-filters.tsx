'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ProductAvailability } from '@prisma/client'

const selectClass =
  'rounded-md border border-border bg-white px-2.5 py-2 text-sm outline-none focus:border-ring'

export function ProductFilters({
  q,
  category,
  collection,
  active,
  availability,
  sort,
  categories,
  collections,
}: {
  q: string
  category: string
  collection: string
  active: string
  availability: string
  sort: string
  categories: string[]
  collections: { slug: string; name: string }[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState(q)

  function apply(next: Record<string, string>) {
    const params = new URLSearchParams({
      category,
      collection,
      active,
      availability,
      sort,
      ...(query ? { q: query } : {}),
      ...next,
    })
    // Drop defaults
    ;(['category', 'collection', 'active', 'availability', 'sort'] as const).forEach((key) => {
      if (params.get(key) === 'all' || (key === 'sort' && params.get(key) === 'updated')) {
        if (key !== 'sort' || next.sort === undefined) {
          if (params.get(key) === 'all') params.delete(key)
          if (key === 'sort' && params.get(key) === 'updated' && !next.sort) params.delete(key)
        }
      }
    })
    if (params.get('sort') === 'updated') params.delete('sort')
    ;(['category', 'collection', 'active', 'availability'] as const).forEach((key) => {
      if (params.get(key) === 'all') params.delete(key)
    })
    params.delete('page')
    router.push(`/admin/products?${params.toString()}`)
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
          placeholder="Name, SKU, slug…"
          className="mt-1.5 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-ring"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Category</label>
        <select
          className={`mt-1.5 block ${selectClass}`}
          value={category}
          onChange={(e) => apply({ category: e.target.value })}
        >
          <option value="all">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Collection</label>
        <select
          className={`mt-1.5 block ${selectClass}`}
          value={collection}
          onChange={(e) => apply({ collection: e.target.value })}
        >
          <option value="all">All</option>
          {collections.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
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
          <option value="false">Archived</option>
        </select>
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Stock</label>
        <select
          className={`mt-1.5 block ${selectClass}`}
          value={availability}
          onChange={(e) => apply({ availability: e.target.value })}
        >
          <option value="all">All</option>
          {Object.values(ProductAvailability).map((a) => (
            <option key={a} value={a}>
              {a.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Sort</label>
        <select
          className={`mt-1.5 block ${selectClass}`}
          value={sort}
          onChange={(e) => apply({ sort: e.target.value })}
        >
          <option value="updated">Updated</option>
          <option value="name">Name</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="stock">Stock</option>
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
