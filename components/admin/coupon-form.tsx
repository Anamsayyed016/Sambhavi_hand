'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { DiscountType } from '@prisma/client'
import { Button } from '@/components/ui/button'

const field = 'mt-1.5 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-ring'

export function CouponForm({ mode, initial }: { mode: 'create' | 'edit'; initial?: Record<string, unknown> }) {
  const router = useRouter()
  const [form, setForm] = useState({
    code: String(initial?.code ?? ''),
    discountType: (initial?.discountType as DiscountType) ?? DiscountType.PERCENTAGE,
    discountValue: String(initial?.discountValue ?? ''),
    minOrderValue: initial?.minOrderValue != null ? String(initial.minOrderValue) : '',
    maxDiscount: initial?.maxDiscount != null ? String(initial.maxDiscount) : '',
    usageLimit: initial?.usageLimit != null ? String(initial.usageLimit) : '',
    active: initial?.active !== false,
  })
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const url = mode === 'create' ? '/api/admin/coupons' : `/api/admin/coupons/${initial?.id}`
    const res = await fetch(url, {
      method: mode === 'create' ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        code: form.code.toUpperCase(),
        discountValue: Number(form.discountValue),
        minOrderValue: form.minOrderValue === '' ? null : Number(form.minOrderValue),
        maxDiscount: form.maxDiscount === '' ? null : Number(form.maxDiscount),
        usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { setError(data.error ?? 'Save failed'); return }
    router.push('/admin/marketing/coupons')
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div>
        <label className="text-xs uppercase text-muted-foreground">Code</label>
        <input className={field} required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs uppercase text-muted-foreground">Type</label>
          <select className={field} value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as DiscountType }))}>
            <option value={DiscountType.PERCENTAGE}>Percentage</option>
            <option value={DiscountType.FIXED}>Fixed amount</option>
          </select>
        </div>
        <div>
          <label className="text-xs uppercase text-muted-foreground">Value</label>
          <input className={field} type="number" required min={1} value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="text-xs uppercase text-muted-foreground">Min order (₹)</label><input className={field} type="number" value={form.minOrderValue} onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))} /></div>
        <div><label className="text-xs uppercase text-muted-foreground">Max discount (₹)</label><input className={field} type="number" value={form.maxDiscount} onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))} /></div>
      </div>
      <div><label className="text-xs uppercase text-muted-foreground">Usage limit</label><input className={field} type="number" value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))} /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} /> Active</label>
      <p className="text-xs text-muted-foreground">Coupons are not applied at checkout until a future integration phase.</p>
      <Button type="submit">Save coupon</Button>
    </form>
  )
}
