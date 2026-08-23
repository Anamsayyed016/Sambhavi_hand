'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import type { SearchResults } from '@/lib/admin/search'

export function AdminHeaderSearch() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults(null)
      return
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q.trim())}`)
      if (res.ok) setResults(await res.json())
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  const hasResults =
    results &&
    (results.products.length > 0 || results.orders.length > 0 || results.customers.length > 0)

  return (
    <div ref={ref} className="relative hidden min-w-0 flex-1 sm:block sm:max-w-md">
      <div className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-1.5">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search products, orders, customers…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Admin search"
        />
      </div>
      {open && q.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-md border border-border bg-white shadow-sm">
          {!hasResults ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">No results</p>
          ) : (
            <div className="divide-y divide-border p-2 text-sm">
              {results!.products.length > 0 ? (
                <div className="py-2">
                  <p className="px-2 text-xs uppercase tracking-wider text-muted-foreground">Products</p>
                  {results!.products.map((p) => (
                    <Link
                      key={p.id}
                      href={`/admin/products/${p.id}`}
                      className="block rounded px-2 py-1.5 hover:bg-beige/60"
                      onClick={() => setOpen(false)}
                    >
                      {p.name} <span className="text-xs text-muted-foreground">{p.sku}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
              {results!.orders.length > 0 ? (
                <div className="py-2">
                  <p className="px-2 text-xs uppercase tracking-wider text-muted-foreground">Orders</p>
                  {results!.orders.map((o) => (
                    <Link
                      key={o.id}
                      href={`/admin/orders/${o.id}`}
                      className="block rounded px-2 py-1.5 hover:bg-beige/60"
                      onClick={() => setOpen(false)}
                    >
                      #{o.orderNumber} · {o.customerName}
                    </Link>
                  ))}
                </div>
              ) : null}
              {results!.customers.length > 0 ? (
                <div className="py-2">
                  <p className="px-2 text-xs uppercase tracking-wider text-muted-foreground">Customers</p>
                  {results!.customers.map((c) => (
                    <Link
                      key={c.email}
                      href={`/admin/customers/${encodeURIComponent(c.email)}`}
                      className="block rounded px-2 py-1.5 hover:bg-beige/60"
                      onClick={() => setOpen(false)}
                    >
                      {c.name} <span className="text-xs text-muted-foreground">{c.email}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
