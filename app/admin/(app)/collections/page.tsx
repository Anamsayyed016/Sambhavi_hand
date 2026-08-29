import Link from 'next/link'
import Image from 'next/image'
import { listCollections, getCollectionProductCounts } from '@/lib/admin/collections'
import { AdminEmptyState } from '@/components/admin/empty-state'

export const dynamic = 'force-dynamic'

export default async function CollectionsPage() {
  let collections
  let counts
  try {
    ;[collections, counts] = await Promise.all([listCollections(), getCollectionProductCounts()])
  } catch {
    return <AdminEmptyState title="Unable to load collections" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">Collections</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage catalog collections used across the store.
          </p>
        </div>
        <Link href="/admin/collections/new" className="rounded-md bg-wine px-3 py-2 text-sm text-primary-foreground">Add Collection</Link>
      </div>

      {collections.length === 0 ? (
        <AdminEmptyState title="No collections yet" description="Create your first collection." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {collections.map((c) => (
            <Link key={c.id} href={`/admin/collections/${c.id}`} className="rounded-md border border-border bg-[#faf8f4] p-4 hover:border-wine/30">
              <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded bg-beige">
                <Image src={c.image} alt="" fill className="object-cover" sizes="300px" />
              </div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">{counts.get(c.slug) ?? 0} products · {c.active ? 'Active' : 'Archived'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
