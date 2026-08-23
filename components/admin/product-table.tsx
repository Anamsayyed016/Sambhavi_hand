'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { Product } from '@prisma/client'
import { Eye, Pencil, Archive } from 'lucide-react'
import { formatDate, formatINR } from '@/lib/admin/format'
import { Button } from '@/components/ui/button'

export function ProductTable({ products }: { products: Product[] }) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function archive(id: string) {
    if (!confirm('Archive this product? It will be deactivated, not deleted.')) return
    setError(null)
    setPendingId(id)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data.error ?? 'Unable to archive product.')
          return
        }
        router.refresh()
      } catch {
        setError('Unable to archive product.')
      } finally {
        setPendingId(null)
      }
    })
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-md border border-border bg-[#faf8f4]">
        <table className="min-w-[960px] w-full text-left text-sm">
          <thead className="border-b border-border bg-beige/50 text-xs uppercase tracking-[0.1em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Image</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product.id} className="align-middle">
                <td className="px-4 py-3">
                  <div className="relative size-12 overflow-hidden rounded bg-beige">
                    <Image
                      src={product.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-charcoal">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.slug}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{product.sku}</td>
                <td className="px-4 py-3">{product.category}</td>
                <td className="px-4 py-3">{formatINR(product.price)}</td>
                <td className="px-4 py-3">
                  <span className={product.stock <= 3 ? 'text-wine' : ''}>{product.stock}</span>
                  <span className="ml-1 text-xs text-muted-foreground">
                    {product.availability.replaceAll('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      product.active
                        ? 'rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800'
                        : 'rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground'
                    }
                  >
                    {product.active ? 'Active' : 'Archived'}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(product.updatedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      render={<Link href={`/admin/products/${product.id}`} />}
                      aria-label="Edit"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      render={<Link href={`/product/${product.slug}`} target="_blank" />}
                      aria-label="View on storefront"
                    >
                      <Eye />
                    </Button>
                    {product.active ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => archive(product.id)}
                        disabled={isPending && pendingId === product.id}
                        aria-label="Archive"
                      >
                        <Archive />
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
