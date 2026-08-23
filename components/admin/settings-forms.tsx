'use client'

import { useState } from 'react'
import type { SafeAdmin } from '@/lib/admin/types'

const field = 'mt-1.5 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-ring'

type Settings = {
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  currency: string
  timezone: string
  shippingFee: number
  freeShippingThreshold: number
}

export function SettingsForms({
  settings,
  admin,
}: {
  settings: Settings
  admin: SafeAdmin
}) {
  const [store, setStore] = useState(settings)
  const [name, setName] = useState(admin.name)
  const [passwords, setPasswords] = useState({ current: '', next: '' })
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function save(section: string, data: unknown) {
    setMsg(null)
    setErr(null)
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, data }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) { setErr(body.error ?? 'Save failed'); return }
    setMsg('Saved')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {msg ? <p className="text-sm text-muted-foreground">{msg}</p> : null}
      {err ? <p className="text-sm text-destructive">{err}</p> : null}

      <section className="space-y-4 rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="font-medium">Store</h2>
        {(['storeName', 'storeEmail', 'storePhone', 'storeAddress', 'currency', 'timezone'] as const).map((k) => (
          <div key={k}>
            <label className="text-xs uppercase text-muted-foreground">{k.replace('store', '').replace(/([A-Z])/g, ' $1')}</label>
            <input className={field} value={String(store[k] ?? '')} onChange={(e) => setStore((s) => ({ ...s, [k]: e.target.value }))} />
          </div>
        ))}
        <button type="button" className="rounded-md bg-wine px-3 py-2 text-sm text-primary-foreground" onClick={() => save('store', store)}>Save store</button>
      </section>

      <section className="space-y-4 rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="font-medium">Shipping</h2>
        <p className="text-xs text-muted-foreground">Checkout currently uses ₹149 below ₹9,999 / free above. These settings are stored for future wiring.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="text-xs uppercase text-muted-foreground">Shipping fee (₹)</label><input className={field} type="number" value={store.shippingFee} onChange={(e) => setStore((s) => ({ ...s, shippingFee: Number(e.target.value) }))} /></div>
          <div><label className="text-xs uppercase text-muted-foreground">Free shipping threshold (₹)</label><input className={field} type="number" value={store.freeShippingThreshold} onChange={(e) => setStore((s) => ({ ...s, freeShippingThreshold: Number(e.target.value) }))} /></div>
        </div>
        <button type="button" className="rounded-md bg-wine px-3 py-2 text-sm text-primary-foreground" onClick={() => save('store', { shippingFee: store.shippingFee, freeShippingThreshold: store.freeShippingThreshold })}>Save shipping</button>
      </section>

      <section className="space-y-4 rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="font-medium">Admin profile</h2>
        <p className="text-sm text-muted-foreground">{admin.email}</p>
        <div><label className="text-xs uppercase text-muted-foreground">Display name</label><input className={field} value={name} onChange={(e) => setName(e.target.value)} /></div>
        <button type="button" className="rounded-md bg-wine px-3 py-2 text-sm text-primary-foreground" onClick={() => save('profile', { name })}>Save profile</button>
      </section>

      <section className="space-y-4 rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="font-medium">Change password</h2>
        <div><label className="text-xs uppercase text-muted-foreground">Current password</label><input className={field} type="password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} /></div>
        <div><label className="text-xs uppercase text-muted-foreground">New password (min 12)</label><input className={field} type="password" value={passwords.next} onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))} /></div>
        <button type="button" className="rounded-md border border-border bg-white px-3 py-2 text-sm" onClick={() => save('password', { currentPassword: passwords.current, newPassword: passwords.next })}>Update password</button>
      </section>

      <section className="space-y-2 rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="font-medium">Media library</h2>
        <p className="text-sm text-muted-foreground">Browse image paths used in products and collections. Upload storage is not enabled in this phase.</p>
        <a href="/admin/settings/media" className="text-sm text-wine hover:underline">Open media browser →</a>
      </section>
    </div>
  )
}
