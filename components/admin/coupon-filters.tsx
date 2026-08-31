'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const field =
  'h-9 rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-ring'

type CouponFiltersProps = {
  initialQuery: string
  initialStatus: string
}

export function CouponFilters({ initialQuery, initialStatus }: CouponFiltersProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [status, setStatus] = useState(initialStatus)

  function applyFilters(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (status && status !== 'all') params.set('status', status)
    const qs = params.toString()
    router.push(qs ? `/admin/marketing/coupons?${qs}` : '/admin/marketing/coupons')
  }

  return (
    <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="text-xs uppercase text-muted-foreground">Search</label>
        <input
          className={`${field} mt-1.5 w-48`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Coupon code"
        />
      </div>
      <div>
        <label className="text-xs uppercase text-muted-foreground">Status</label>
        <select
          className={`${field} mt-1.5`}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </div>
      <button type="submit" className="h-9 rounded-md bg-wine px-3 text-sm text-primary-foreground">
        Filter
      </button>
    </form>
  )
}
