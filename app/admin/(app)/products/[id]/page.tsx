import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductById, getProductFilterOptions } from '@/lib/admin/products'
import { ProductForm } from '@/components/admin/product-form'
import { AdminEmptyState } from '@/components/admin/empty-state'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: Params) {
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/products" className="text-xs text-muted-foreground hover:text-wine">
          ← Products
        </Link>
        <h1 className="mt-2 font-serif text-3xl text-charcoal">Edit product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {product.name} · {product.sku}
        </p>
      </div>
      <ProductForm
        mode="edit"
        product={product}
        categories={filters.categories}
        collections={filters.collections}
      />
    </div>
  )
}
