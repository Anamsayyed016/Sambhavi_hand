import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCollectionById } from '@/lib/admin/collections'
import { prisma } from '@/lib/prisma'
import { CollectionForm } from '@/components/admin/collection-form'
import { AdminEmptyState } from '@/components/admin/empty-state'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export default async function EditCollectionPage({ params }: Params) {
  const { id } = await params
  const collection = await getCollectionById(id).catch(() => null)
  if (!collection) notFound()

  const products = await prisma.product.findMany({
    where: { collections: { has: collection.slug } },
    select: { id: true, name: true, sku: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <Link href="/admin/collections" className="text-xs text-muted-foreground hover:text-wine">← Collections</Link>
      <h1 className="font-serif text-3xl text-charcoal">Edit collection</h1>
      <CollectionForm mode="edit" initial={{ ...collection, id: collection.id }} />
      <section className="rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="text-sm font-medium">Products in this collection ({products.length})</h2>
        {products.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No products linked. Assign collection slugs on product edit pages.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border text-sm">
            {products.map((p) => (
              <li key={p.id} className="flex justify-between py-2">
                <Link href={`/admin/products/${p.id}`} className="hover:text-wine">{p.name}</Link>
                <span className="text-muted-foreground">{p.sku}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
