'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { slugify } from '@/lib/admin/format'
import { Button } from '@/components/ui/button'

const field = 'mt-1.5 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-ring'

export function CollectionForm({ mode, initial }: { mode: 'create' | 'edit'; initial?: Record<string, unknown> }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: String(initial?.name ?? ''),
    slug: String(initial?.slug ?? ''),
    description: String(initial?.description ?? ''),
    image: String(initial?.image ?? ''),
    active: initial?.active !== false,
    featured: Boolean(initial?.featured),
  })
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const url = mode === 'create' ? '/api/admin/collections' : `/api/admin/collections/${initial?.id}`
    const res = await fetch(url, {
      method: mode === 'create' ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) { setError(data.error ?? 'Save failed'); return }
    router.push(`/admin/collections/${data.collection.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Name</label>
        <input className={field} required value={form.name} onChange={(e) => {
          const name = e.target.value
          setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }))
        }} />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Slug</label>
        <input className={field} required value={form.slug} onChange={(e) => { setSlugTouched(true); setForm((f) => ({ ...f, slug: e.target.value })) }} />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Description</label>
        <textarea className={`${field} min-h-24`} required value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Image path</label>
        <input className={field} required placeholder="/images/..." value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} />
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} /> Active</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} /> Featured</label>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        <Button type="button" variant="outline" render={<Link href="/admin/collections" />}>Cancel</Button>
      </div>
    </form>
  )
}
