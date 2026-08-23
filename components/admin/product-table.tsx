'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { Product } from '@prisma/client'
import { Eye, Pencil, Archive } from 'lucide-react'
import { formatDate, formatINR } from '@/lib/admin/format'
import { Button } from '@/components/ui/button'

const LOW_STOCK = 3

export function ProductTable({ products }: { products: Product[] }) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const allSelected = products.length > 0 && selected.size === products.length

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(products.map((p) => p.id)))
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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

  function bulkSetActive(active: boolean) {
    if (selected.size === 0) return
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/products/bulk', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: Array.from(selected), active }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data.error ?? 'Bulk update failed.')
          return
        }
        setSelected(new Set())
        router.refresh()
      } catch {
        setError('Bulk update failed.')
      }
    })
  }

  function isLowStock(product: Product) {
    return product.stock <= LOW_STOCK || product.availability === 'LOW_STOCK'
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-beige/40 px-3 py-2 text-sm">
          <span>{selected.size} selected</span>
          <button
            type="button"
            className="rounded border border-border bg-white px-2 py-1 text-xs hover:bg-beige/60"
            disabled={isPending}
            onClick={() => bulkSetActive(true)}
          >
            Activate
          </button>
          <button
            type="button"
            className="rounded border border-border bg-white px-2 py-1 text-xs hover:bg-beige/60"
            disabled={isPending}
            onClick={() => bulkSetActive(false)}
          >
            Deactivate
          </button>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-charcoal"
            onClick={() => setSelected(new Set())}
          >
            Clear
          </button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-md border border-border bg-[#faf8f4]">
        <table className="min-w-[960px] w-full text-left text-sm">
          <thead className="border-b border-border bg-beige/50 text-xs uppercase tracking-[0.1em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all"
                />
              </th>
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
                  <input
                    type="checkbox"
                    checked={selected.has(product.id)}
                    onChange={() => toggleOne(product.id)}
                    aria-label={`Select ${product.name}`}
                  />
                </td>
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
                  <span className={isLowStock(product) ? 'font-medium text-wine' : ''}>
                    {product.stock}
                  </span>
                  {isLowStock(product) ? (
                    <span className="ml-1 rounded bg-wine/10 px-1.5 py-0.5 text-[10px] uppercase text-wine">
                      Low
                    </span>
                  ) : null}
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
