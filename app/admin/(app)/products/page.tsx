import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ProductAvailability } from '@prisma/client'
import { getProductFilterOptions, listProducts } from '@/lib/admin/products'
import { AdminEmptyState } from '@/components/admin/empty-state'
import { ProductFilters } from '@/components/admin/product-filters'
import { ProductTable } from '@/components/admin/product-table'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const q = one(sp.q) ?? ''
  const category = one(sp.category) ?? 'all'
  const collection = one(sp.collection) ?? 'all'
  const active = (one(sp.active) as 'true' | 'false' | 'all' | undefined) ?? 'all'
  const availability = (one(sp.availability) as ProductAvailability | 'all' | undefined) ?? 'all'
  const sort = (one(sp.sort) as 'updated' | 'name' | 'price_asc' | 'price_desc' | 'stock' | undefined) ?? 'updated'
  const page = Number(one(sp.page) ?? 1)

  let result
  let filters
  let loadError: string | null = null

  try {
    ;[result, filters] = await Promise.all([
      listProducts({ q, category, collection, active, availability, sort, page, pageSize: 20 }),
      getProductFilterOptions(),
    ])
  } catch {
    loadError = 'Unable to load products. Please try again.'
  }

  if (loadError || !result || !filters) {
    return <AdminEmptyState title="Unable to load products" description={loadError ?? undefined} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.total} product{result.total === 1 ? '' : 's'} in catalog
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-wine px-3 py-2 text-sm text-primary-foreground hover:bg-wine/90"
        >
          <Plus className="size-4" />
          Add Product
        </Link>
      </div>

      <ProductFilters
        q={q}
        category={category}
        collection={collection}
        active={active}
        availability={availability}
        sort={sort}
        categories={filters.categories}
        collections={filters.collections}
      />

      {result.items.length === 0 ? (
        <AdminEmptyState
          title="No products yet"
          description="Add your first saree to start selling."
          action={
            <Link
              href="/admin/products/new"
              className="rounded-md bg-wine px-3 py-2 text-sm text-primary-foreground"
            >
              Add Product
            </Link>
          }
        />
      ) : (
        <>
          <ProductTable products={result.items} />
          {result.pageCount > 1 ? (
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Page {result.page} of {result.pageCount}
              </p>
              <div className="flex gap-2">
                {result.page > 1 ? (
                  <Link
                    href={`/admin/products?${new URLSearchParams({
                      ...(q ? { q } : {}),
                      category,
                      collection,
                      active,
                      availability,
                      sort,
                      page: String(result.page - 1),
                    }).toString()}`}
                    className="rounded-md border border-border bg-white px-3 py-1.5 hover:bg-beige/60"
                  >
                    Previous
                  </Link>
                ) : null}
                {result.page < result.pageCount ? (
                  <Link
                    href={`/admin/products?${new URLSearchParams({
                      ...(q ? { q } : {}),
                      category,
                      collection,
                      active,
                      availability,
                      sort,
                      page: String(result.page + 1),
                    }).toString()}`}
                    className="rounded-md border border-border bg-white px-3 py-1.5 hover:bg-beige/60"
                  >
                    Next
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
