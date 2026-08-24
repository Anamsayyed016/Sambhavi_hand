'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { searchProducts } from '@/lib/search-products'
import { ProductGrid } from '@/components/product/product-grid'

export function SearchView({ initialQuery = '' }: { initialQuery?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  const results = useMemo(() => searchProducts(query), [query])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next = query.trim()
    router.replace(next ? `/search?q=${encodeURIComponent(next)}` : '/search')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-serif text-3xl text-foreground md:text-4xl">Search</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Find sarees by name, category, fabric, weave, or collection.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-xl" role="search">
        <label htmlFor="storefront-search" className="sr-only">
          Search products
        </label>
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            id="storefront-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search silk, Banarasi, cotton…"
            autoComplete="off"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          <button
            type="submit"
            className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
          >
            Search
          </button>
        </div>
      </form>

      <div className="mt-10">
        {!query.trim() ? (
          <p className="text-center text-sm text-muted-foreground">
            Enter a term to search the Sambhavi Handloom catalog.
          </p>
        ) : results.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No products found for &ldquo;{query.trim()}&rdquo;.
          </p>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              {results.length} result{results.length === 1 ? '' : 's'} for &ldquo;{query.trim()}&rdquo;
            </p>
            <ProductGrid products={results} />
          </>
        )}
      </div>
    </div>
  )
}
