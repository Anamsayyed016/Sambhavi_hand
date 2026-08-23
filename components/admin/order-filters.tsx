'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { OrderStatus, PaymentStatus } from '@prisma/client'
import { formatOrderStatusLabel, formatPaymentStatusLabel } from '@/lib/admin/order-validation'

const selectClass =
  'rounded-md border border-border bg-white px-2.5 py-2 text-sm outline-none focus:border-ring'

export function OrderFilters({
  q,
  status,
  paymentStatus,
  sort,
}: {
  q: string
  status: string
  paymentStatus: string
  sort: string
}) {
  const router = useRouter()
  const [query, setQuery] = useState(q)

  function apply(next: Record<string, string>) {
    const params = new URLSearchParams({
      status,
      paymentStatus,
      sort,
      ...(query ? { q: query } : {}),
      ...next,
    })

    if (params.get('status') === 'all') params.delete('status')
    if (params.get('paymentStatus') === 'all') params.delete('paymentStatus')
    if (params.get('sort') === 'newest') params.delete('sort')
    if (!params.get('q')) params.delete('q')
    params.delete('page')

    router.push(`/admin/orders?${params.toString()}`)
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-md border border-border bg-[#faf8f4] p-4 lg:flex-row lg:flex-wrap lg:items-end"
      onSubmit={(e) => {
        e.preventDefault()
        apply({})
      }}
    >
      <div className="min-w-[200px] flex-1">
        <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Search</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Order #, name, email, phone…"
          className="mt-1.5 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-ring"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Status</label>
        <select
          className={`mt-1.5 block ${selectClass}`}
          value={status}
          onChange={(e) => apply({ status: e.target.value })}
        >
          <option value="all">All</option>
          {Object.values(OrderStatus).map((s) => (
            <option key={s} value={s}>
              {formatOrderStatusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Payment</label>
        <select
          className={`mt-1.5 block ${selectClass}`}
          value={paymentStatus}
          onChange={(e) => apply({ paymentStatus: e.target.value })}
        >
          <option value="all">All</option>
          {Object.values(PaymentStatus).map((s) => (
            <option key={s} value={s}>
              {formatPaymentStatusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Sort</label>
        <select
          className={`mt-1.5 block ${selectClass}`}
          value={sort}
          onChange={(e) => apply({ sort: e.target.value })}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      <button
        type="submit"
        className="rounded-md bg-wine px-3 py-2 text-sm text-primary-foreground hover:bg-wine/90"
      >
        Search
      </button>
    </form>
  )
}
