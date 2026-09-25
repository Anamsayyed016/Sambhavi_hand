import Link from 'next/link'
import Image from 'next/image'
import {
  listCollections,
  getCollectionProductCounts,
  getCollectionStorefrontProductCounts,
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
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover"
        sizes="72px"
      />
    )
  }

  return (
    <div
      className="flex h-full w-full items-center justify-center bg-beige px-2 text-center"
      aria-hidden="true"
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        No image
      </span>
    </div>
  )
}

function StorefrontCount({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span className="text-xs tabular-nums text-muted-foreground" title="No storefront catalog route for this slug">
        Storefront: —
      </span>
    )
  }
  return (
    <span className="text-xs font-medium tabular-nums text-charcoal/85">
      Storefront:{' '}
      <span className="text-charcoal">
        {value} product{value === 1 ? '' : 's'}
      </span>
    </span>
  )
}

function ExplicitCount({ value }: { value: number }) {
  return (
    <span className="text-xs tabular-nums text-muted-foreground">
      Explicit:{' '}
      <span className="text-charcoal/80">
        {value} assigned
      </span>
    </span>
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
  let explicitCounts
  let storefrontCounts
  try {
    ;[collections, explicitCounts] = await Promise.all([
      listCollections({ q, active, sort }),
      getCollectionProductCounts(),
    ])
    storefrontCounts = await getCollectionStorefrontProductCounts(collections.map((c) => c.slug))
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
    explicitCount: explicitCounts.get(c.slug) ?? 0,
    storefrontCount: storefrontCounts.get(c.slug) ?? null,
  }))

  // Product sorts: primary key = storefront M when available; else explicit N.
  if (sort === 'products_desc' || sort === 'products_asc') {
    const dir = sort === 'products_desc' ? -1 : 1
    withCounts.sort((a, b) => {
      const aKey = a.storefrontCount ?? a.explicitCount
      const bKey = b.storefrontCount ?? b.explicitCount
      return (aKey - bKey) * dir || a.name.localeCompare(b.name)
    })
  }

  const filtered = Boolean(q || active !== 'all')

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-xl">
          <h1 className="font-serif text-3xl tracking-tight text-charcoal md:text-[2.15rem]">
            Collections
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Manage catalog collections used across the store.
          </p>
          <p className="mt-1.5 text-xs tracking-wide text-muted-foreground/80">
            {withCounts.length} collection{withCounts.length === 1 ? '' : 's'}
            {filtered ? ' matching filters' : ''}
            {' · '}
            Storefront vs explicit membership
          </p>
        </div>
        <Link
          href="/admin/collections/new"
          className="inline-flex items-center rounded-md bg-wine px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-wine/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Add Collection
        </Link>
      </div>

      <CollectionFilters q={q} active={active} sort={sort} />

      {withCounts.length === 0 ? (
        <AdminEmptyState
          title={filtered ? 'No collections match' : 'No collections yet'}
          description={
            filtered
              ? 'Try a different search or filter.'
              : 'Create your first collection to organize products.'
          }
          action={
            !filtered ? (
              <Link
                href="/admin/collections/new"
                className="inline-flex items-center rounded-md bg-wine px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-wine/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Add Collection
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-md border border-border/80 bg-[#faf8f4] shadow-[0_1px_0_rgba(40,30,20,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-[780px] w-full text-sm">
              <thead>
                <tr className="border-b border-border/80 bg-beige/40">
                  <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Collection
                  </th>
                  <th className="hidden px-4 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground lg:table-cell">
                    Slug
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Products
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Status
                  </th>
                  <th className="hidden px-4 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:table-cell">
                    Updated
                  </th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {withCounts.map((c) => (
                  <tr
                    key={c.id}
                    className="group transition-colors hover:bg-beige/25"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/collections/${c.id}`}
                        className="flex items-center gap-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <span className="relative size-[72px] shrink-0 overflow-hidden rounded-md border border-border/70 bg-beige shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]">
                          <CollectionCover image={c.image} name={c.name} />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-serif text-[1.05rem] leading-snug tracking-tight text-charcoal transition-colors group-hover:text-wine">
                            {c.name}
                          </span>
                          <span className="mt-1 block truncate font-sans text-xs tracking-wide text-muted-foreground lg:hidden">
                            {c.slug}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="hidden px-4 py-4 align-middle lg:table-cell">
                      <span className="font-mono text-xs tracking-wide text-muted-foreground">
                        {c.slug}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <div className="flex flex-col gap-1">
                        <StorefrontCount value={c.storefrontCount} />
                        <ExplicitCount value={c.explicitCount} />
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      {c.active ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-wine/10 px-2.5 py-1 text-xs font-medium text-wine">
                          <span
                            className="size-1.5 rounded-full bg-wine"
                            aria-hidden="true"
                          />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          <span
                            className="size-1.5 rounded-full bg-muted-foreground/50"
                            aria-hidden="true"
                          />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="hidden px-4 py-4 align-middle sm:table-cell">
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {formatDate(c.updatedAt)}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-middle text-right">
                      <Link
                        href={`/admin/collections/${c.id}`}
                        className="inline-flex items-center rounded-md border border-transparent px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:bg-white hover:text-wine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
