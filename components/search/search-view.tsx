'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import type { StorefrontSearchResult } from '@/lib/catalog/storefront-search'
import { ProductGrid } from '@/components/product/product-grid'

const SEARCH_HINTS = ['silk', 'cotton', 'Banarasi', 'handloom', 'digital print']

export function SearchView({
  initialQuery = '',
  initialResults = null,
}: {
  initialQuery?: string
  initialResults?: StorefrontSearchResult | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<StorefrontSearchResult | null>(initialResults)

  useEffect(() => {
    const nextQuery = searchParams.get('q')?.trim() ?? ''
    setQuery(nextQuery)
  }, [searchParams])

  useEffect(() => {
    setResults(initialResults)
  }, [initialResults])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next = query.trim()
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : '/search')
  }

  const activeQuery = results?.query ?? query.trim()
  const page = results?.page ?? 1

  function pageHref(nextPage: number) {
    const params = new URLSearchParams()
    params.set('q', activeQuery)
    if (nextPage > 1) params.set('page', String(nextPage))
    return `/search?${params.toString()}`
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
        {!activeQuery ? (
          <p className="text-center text-sm text-muted-foreground">
            Enter a term to search the Sambhavi Handloom catalog.
          </p>
        ) : !results || results.items.length === 0 ? (
          <div className="mx-auto max-w-lg text-center">
            <p className="text-sm text-foreground">
              No products found for &ldquo;{activeQuery}&rdquo;.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Try searching for {SEARCH_HINTS.join(', ')}…
            </p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Search results for &ldquo;{activeQuery}&rdquo; — {results.total} result
              {results.total === 1 ? '' : 's'}
            </p>
            <ProductGrid products={results.items} />
            {results.pageCount > 1 ? (
              <nav
                className="mt-10 flex items-center justify-center gap-4 text-sm"
                aria-label="Search results pagination"
              >
                {page > 1 ? (
                  <Link href={pageHref(page - 1)} className="text-foreground hover:text-primary">
                    Previous
                  </Link>
                ) : (
                  <span className="text-muted-foreground">Previous</span>
                )}
                <span className="text-muted-foreground">
                  Page {page} of {results.pageCount}
                </span>
                {page < results.pageCount ? (
                  <Link href={pageHref(page + 1)} className="text-foreground hover:text-primary">
                    Next
                  </Link>
                ) : (
                  <span className="text-muted-foreground">Next</span>
                )}
              </nav>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
