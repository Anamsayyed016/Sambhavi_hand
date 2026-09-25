'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'

type MemberProduct = {
  id: string
  name: string
  sku: string
}

type SearchProduct = {
  id: string
  name: string
  sku: string
  collections: string[]
}

export function CollectionProductsEditor({
  collectionId,
  collectionSlug,
  initialProducts,
}: {
  collectionId: string
  collectionSlug: string
  initialProducts: MemberProduct[]
}) {
  const router = useRouter()
  const [members, setMembers] = useState<MemberProduct[]>(initialProducts)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchProduct[]>([])
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const memberIds = new Set(members.map((p) => p.id))

  const searchProducts = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) {
      setResults([])
      return
    }
    setSearching(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        q: trimmed,
        pageSize: '20',
        page: '1',
        active: 'all',
      })
      const res = await fetch(`/api/admin/products?${params.toString()}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Product search failed')
        setResults([])
        return
      }
      setResults(
        (data.items as SearchProduct[] | undefined)?.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          collections: p.collections ?? [],
        })) ?? [],
      )
    } catch {
      setError('Product search failed')
      setResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  function addProduct(product: MemberProduct) {
    setMembers((prev) => (prev.some((p) => p.id === product.id) ? prev : [...prev, product]))
    setMessage(null)
  }

  function removeProduct(productId: string) {
    setMembers((prev) => prev.filter((p) => p.id !== productId))
    setMessage(null)
  }

  async function saveMembership() {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/collections/${collectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: members.map((p) => p.id) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Failed to save product membership')
        return
      }
      setMessage('Product membership saved.')
      router.refresh()
    } catch {
      setError('Failed to save product membership')
    } finally {
      setSaving(false)
    }
  }

  async function removeOneImmediately(productId: string) {
    if (!confirm('Remove this product from the collection? The product itself will not be deleted.')) {
      return
    }
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/collections/${collectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ removeProductId: productId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Failed to remove product')
        return
      }
      setMembers((prev) => prev.filter((p) => p.id !== productId))
      setMessage('Product removed from collection.')
      router.refresh()
    } catch {
      setError('Failed to remove product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-4 rounded-md border border-border bg-[#faf8f4] p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">
            Explicitly assigned products ({members.length})
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            These products are explicitly assigned to this collection. Storefront pages may also
            include products through category and other catalog rules. Saving only adds or removes
            slug <span className="font-medium text-charcoal/80">{collectionSlug}</span> in{' '}
            <code className="text-[11px]">Product.collections</code>.
          </p>
        </div>
        <Button type="button" disabled={saving} onClick={() => void saveMembership()}>
          {saving ? 'Saving…' : 'Save membership'}
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-wine">{message}</p> : null}

      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No explicitly assigned products yet. Search below to add products.
        </p>
      ) : (
        <ul className="divide-y divide-border text-sm">
          {members.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <div className="min-w-0">
                <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-wine">
                  {p.name}
                </Link>
                <p className="text-xs text-muted-foreground">{p.sku}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => removeProduct(p.id)}
                  className="rounded-md border border-border bg-white px-2.5 py-1 text-xs hover:bg-beige/60"
                >
                  Deselect
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void removeOneImmediately(p.id)}
                  className="rounded-md border border-border bg-white px-2.5 py-1 text-xs text-destructive hover:bg-beige/60"
                >
                  Remove now
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-border pt-4">
        <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          Add products
        </label>
        <form
          className="mt-1.5 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            void searchProducts(query)
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, SKU, or slug…"
            className="min-w-[220px] flex-1 rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-ring"
          />
          <button
            type="submit"
            disabled={searching}
            className="rounded-md bg-wine px-3 py-2 text-sm text-primary-foreground hover:bg-wine/90 disabled:opacity-60"
          >
            {searching ? 'Searching…' : 'Search'}
          </button>
        </form>

        {results.length > 0 ? (
          <ul className="mt-3 max-h-64 divide-y divide-border overflow-y-auto rounded-md border border-border bg-white text-sm">
            {results.map((p) => {
              const selected = memberIds.has(p.id)
              return (
                <li key={p.id} className="flex items-center justify-between gap-2 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sku}</p>
                  </div>
                  <button
                    type="button"
                    disabled={saving || selected}
                    onClick={() => addProduct({ id: p.id, name: p.name, sku: p.sku })}
                    className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-beige/60 disabled:cursor-default disabled:opacity-50"
                  >
                    {selected ? 'Selected' : 'Select'}
                  </button>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
