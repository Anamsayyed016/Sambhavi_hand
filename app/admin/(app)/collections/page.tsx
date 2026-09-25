import Link from 'next/link'
import Image from 'next/image'
import {
  listCollections,
  getCollectionProductCounts,
  type CollectionSort,
} from '@/lib/admin/collections'
import { formatDate } from '@/lib/admin/format'
import { AdminEmptyState } from '@/components/admin/empty-state'
import { CollectionFilters } from '@/components/admin/collection-filters'
import { isValidCoverImageUrl } from '@/lib/new-arrivals-catalogs'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

function CollectionCover({
  image,
  name,
}: {
  image: string
  name: string
}) {
  if (isValidCoverImageUrl(image)) {
    return (
      <Image src={image} alt="" fill className="object-cover" sizes="80px" />
    )
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 bg-beige px-1 text-center">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        No image
      </p>
      <p className="line-clamp-2 text-[9px] text-muted-foreground/80">{name}</p>
    </div>
  )
}

const SORT_VALUES = new Set<CollectionSort>([
  'name_asc',
  'name_desc',
  'newest',
  'oldest',
  'products_desc',
  'products_asc',
])

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const q = one(sp.q) ?? ''
  const active = (one(sp.active) as 'true' | 'false' | 'all' | undefined) ?? 'all'
  const sortRaw = one(sp.sort) ?? 'name_asc'
  const sort: CollectionSort = SORT_VALUES.has(sortRaw as CollectionSort)
    ? (sortRaw as CollectionSort)
    : 'name_asc'

  let collections
  let counts
  try {
    ;[collections, counts] = await Promise.all([
      listCollections({ q, active, sort }),
      getCollectionProductCounts(),
    ])
  } catch {
    return (
      <AdminEmptyState
        title="Unable to load collections"
        description="The collections list could not be loaded. Please try again."
      />
    )
  }

  const withCounts = collections.map((c) => ({
    ...c,
    productCount: counts.get(c.slug) ?? 0,
  }))

  if (sort === 'products_desc') {
    withCounts.sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name))
  } else if (sort === 'products_asc') {
    withCounts.sort((a, b) => a.productCount - b.productCount || a.name.localeCompare(b.name))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">Collections</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {withCounts.length} collection{withCounts.length === 1 ? '' : 's'}
            {q || active !== 'all' ? ' matching filters' : ' in catalog'}
          </p>
        </div>
        <Link
          href="/admin/collections/new"
          className="rounded-md bg-wine px-3 py-2 text-sm text-primary-foreground"
        >
          Add Collection
        </Link>
      </div>

      <CollectionFilters q={q} active={active} sort={sort} />

      {withCounts.length === 0 ? (
        <AdminEmptyState
          title={q || active !== 'all' ? 'No collections match' : 'No collections yet'}
          description={
            q || active !== 'all'
              ? 'Try a different search or filter.'
              : 'Create your first collection.'
          }
          action={
            !(q || active !== 'all') ? (
              <Link
                href="/admin/collections/new"
                className="rounded-md bg-wine px-3 py-2 text-sm text-primary-foreground"
              >
                Add Collection
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-[#faf8f4]">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="border-b border-border bg-beige/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Collection</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Products</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {withCounts.map((c) => (
                <tr key={c.id} className="hover:bg-beige/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/collections/${c.id}`}
                      className="flex items-center gap-3 hover:text-wine"
                    >
                      <span className="relative size-12 shrink-0 overflow-hidden rounded bg-beige">
                        <CollectionCover image={c.image} name={c.name} />
                      </span>
                      <span className="font-medium">{c.name}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.slug}</td>
                  <td className="px-4 py-3">
                    {c.productCount} product{c.productCount === 1 ? '' : 's'}
                  </td>
                  <td className="px-4 py-3">{c.active ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(c.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
