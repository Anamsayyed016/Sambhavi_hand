import Link from 'next/link'
import { getProductFilterOptions } from '@/lib/admin/products'
import { ProductForm } from '@/components/admin/product-form'
import { AdminEmptyState } from '@/components/admin/empty-state'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  let filters
  try {
    filters = await getProductFilterOptions()
  } catch {
    return (
      <AdminEmptyState
        title="Unable to load form"
        description="Please try again."
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/products" className="text-xs text-muted-foreground hover:text-wine">
          ← Products
        </Link>
        <h1 className="mt-2 font-serif text-3xl text-charcoal">Add product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a catalog entry in the Sambhavi database.
        </p>
      </div>
      <ProductForm
        mode="create"
        categories={filters.categories}
        collections={filters.collections}
      />
    </div>
  )
}
