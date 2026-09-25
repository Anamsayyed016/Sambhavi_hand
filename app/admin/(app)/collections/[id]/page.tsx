import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getCollectionById,
  getCollectionStorefrontProductCounts,
} from '@/lib/admin/collections'
import { prisma } from '@/lib/prisma'
import { CollectionForm } from '@/components/admin/collection-form'
import { CollectionProductsEditor } from '@/components/admin/collection-products-editor'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export default async function EditCollectionPage({ params }: Params) {
  const { id } = await params
  const collection = await getCollectionById(id).catch(() => null)
  if (!collection) notFound()

  const [products, storefrontCounts] = await Promise.all([
    prisma.product.findMany({
      where: { collections: { has: collection.slug } },
      select: { id: true, name: true, sku: true },
      orderBy: { name: 'asc' },
    }),
    getCollectionStorefrontProductCounts([collection.slug]),
  ])

  const storefrontCount = storefrontCounts.get(collection.slug) ?? null
  const explicitCount = products.length

  return (
    <div className="space-y-6">
      <Link href="/admin/collections" className="text-xs text-muted-foreground hover:text-wine">
        ← Collections
      </Link>
      <div>
        <h1 className="font-serif text-3xl text-charcoal">Edit collection</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {storefrontCount === null ? (
            <>Storefront: —</>
          ) : (
            <>
              Storefront: {storefrontCount} product{storefrontCount === 1 ? '' : 's'}
            </>
          )}
          {' · '}
          Explicit: {explicitCount} assigned
          {' · '}
          {collection.active ? 'Active' : 'Inactive'}
        </p>
      </div>
      <CollectionForm mode="edit" initial={{ ...collection, id: collection.id }} />
      <CollectionProductsEditor
        collectionId={collection.id}
        collectionSlug={collection.slug}
        initialProducts={products}
      />
    </div>
  )
}
