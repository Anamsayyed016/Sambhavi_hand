'use client'

import { useMemo, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { products, categories, type Product } from '@/lib/products'
import { ProductGrid } from '@/components/product/product-grid'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'newest'

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'newest', label: 'Newest' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
]

export function ShopView({ initialCategory }: { initialCategory?: string }) {
  const [activeCategories, setActiveCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : [],
  )
  const [sort, setSort] = useState<SortKey>('featured')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const toggleCategory = (cat: string) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    )
  }

  const filtered = useMemo(() => {
    let result: Product[] =
      activeCategories.length === 0
        ? [...products]
        : products.filter((p) => activeCategories.includes(p.category))

    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        result.sort((a, b) => Number(b.isNew ?? 0) - Number(a.isNew ?? 0))
        break
      default:
        break
    }
    return result
  }, [activeCategories, sort])

  const FilterPanel = (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-4 font-serif text-lg text-foreground">Category</h3>
        <ul className="flex flex-col gap-2.5">
          {categories.map((cat) => {
            const active = activeCategories.includes(cat)
            return (
              <li key={cat}>
                <button
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className="flex w-full items-center gap-3 text-left font-sans text-sm"
                >
                  <span
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-sm border transition-colors',
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-transparent',
                    )}
                    aria-hidden="true"
                  >
                    {active ? <X className="h-3 w-3" strokeWidth={3} /> : null}
                  </span>
                  <span className={cn(active ? 'text-foreground' : 'text-muted-foreground')}>
                    {cat}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      {activeCategories.length > 0 ? (
        <button
          type="button"
          onClick={() => setActiveCategories([])}
          className="w-fit font-sans text-xs uppercase tracking-wider text-primary underline underline-offset-4"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  )

  return (
    <section className="mx-auto max-w-[88rem] px-5 py-12 md:px-8 md:py-16">
      <div className="grid gap-10 lg:grid-cols-[200px_1fr] lg:gap-12">
        {/* desktop filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-28">{FilterPanel}</div>
        </aside>

        <div>
          {/* toolbar */}
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4">
            <p className="font-sans text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? 'saree' : 'sarees'}
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setFiltersOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Filters
              </Button>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="sr-only">
                  Sort by
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="h-9 rounded-md border border-border bg-background px-3 font-sans text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {filtered.length > 0 ? (
            <ProductGrid products={filtered} columns="three" />
          ) : (
            <p className="py-20 text-center font-serif text-xl text-muted-foreground">
              No sarees match your filters.
            </p>
          )}
        </div>
      </div>

      {/* mobile filter drawer */}
      {filtersOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-background p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-xl text-foreground">Filters</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {FilterPanel}
          </div>
        </div>
      ) : null}
    </section>
  )
}
