import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductById, getProductFilterOptions } from '@/lib/admin/products'
import { ProductDuplicateFormHost } from '@/components/admin/product-form'
import { buildDuplicateInitialForm } from '@/lib/admin/product-duplicate'
import { AdminEmptyState } from '@/components/admin/empty-state'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export default async function DuplicateProductPage({ params }: Params) {
  const { id } = await params

  let product
  let filters
  try {
    ;[product, filters] = await Promise.all([getProductById(id), getProductFilterOptions()])
  } catch {
    return (
      <AdminEmptyState title="Unable to load product" description="Please try again." />
    )
  }

  if (!product) notFound()

  // Precompute plain JSON on the server so the client form never boots blank then "fills later".
  const initialForm = buildDuplicateInitialForm(product)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/admin/products/${product.id}`}
          className="text-xs text-muted-foreground hover:text-wine"
        >
          ← Back to original
        </Link>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-wine">
          Create Similar Product
        </p>
        <h1 className="mt-1 font-serif text-3xl text-charcoal">Duplicate Product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Template from <span className="font-medium text-charcoal">{product.name}</span>. Adjust
          details if needed, then save — a new product is created; the original is unchanged.
        </p>
      </div>
      <ProductDuplicateFormHost
        product={product}
        initialForm={initialForm}
        categories={filters.categories}
        collections={filters.collections}
      />
    </div>
  )
}
