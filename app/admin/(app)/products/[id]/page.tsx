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
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl text-charcoal">Edit Product</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.name} · {product.sku}
            </p>
          </div>
          <Link
            href={`/admin/products/${product.id}/duplicate`}
            className="inline-flex items-center rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-charcoal hover:border-wine/30 hover:text-wine"
          >
            Duplicate Product
          </Link>
        </div>
      </div>
      <ProductForm
        key={`admin-product-edit-${product.id}`}
        mode="edit"
        product={product}
        categories={filters.categories}
        collections={filters.collections}
      />
    </div>
  )
}
