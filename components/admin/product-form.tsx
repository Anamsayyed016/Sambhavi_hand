'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@prisma/client'
import { ProductAvailability } from '@prisma/client'
import { slugify } from '@/lib/admin/format'
import { Button } from '@/components/ui/button'

type CollectionOption = { slug: string; name: string }

type ProductFormProps = {
  mode: 'create' | 'edit'
  product?: Product
  categories: string[]
  collections: CollectionOption[]
}

type FormState = {
  name: string
  slug: string
  sku: string
  description: string
  price: string
  originalPrice: string
  image: string
  images: string
  category: string
  collections: string[]
  fabric: string
  weave: string
  length: string
  blouse: string
  care: string
  availability: ProductAvailability
  stock: string
  active: boolean
  featured: boolean
  isNew: boolean
}

function toFormState(product?: Product): FormState {
  if (!product) {
    return {
      name: '',
      slug: '',
      sku: '',
      description: '',
      price: '',
      originalPrice: '',
      image: '',
      images: '',
      category: '',
      collections: [],
      fabric: '',
      weave: '',
      length: '',
      blouse: '',
      care: '',
      availability: ProductAvailability.IN_STOCK,
      stock: '0',
      active: true,
      featured: false,
      isNew: false,
    }
  }

  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: String(product.price),
    originalPrice: product.originalPrice != null ? String(product.originalPrice) : '',
    image: product.image,
    images: product.images.join('\n'),
    category: product.category,
    collections: product.collections,
    fabric: product.fabric,
    weave: product.weave,
    length: product.length,
    blouse: product.blouse,
    care: product.care,
    availability: product.availability,
    stock: String(product.stock),
    active: product.active,
    featured: product.featured,
    isNew: product.isNew,
  }
}

const fieldClass =
  'mt-1.5 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30'
const labelClass = 'text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground'

export function ProductForm({ mode, product, categories, collections }: ProductFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(() => toFormState(product))
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  const categoryOptions = useMemo(() => {
    const set = new Set(categories)
    if (form.category) set.add(form.category)
    return Array.from(set).sort()
  }, [categories, form.category])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'name' && !slugTouched) {
        next.slug = slugify(String(value))
      }
      return next
    })
    setStatus('idle')
    setMessage(null)
  }

  function toggleCollection(slug: string) {
    setForm((prev) => ({
      ...prev,
      collections: prev.collections.includes(slug)
        ? prev.collections.filter((c) => c !== slug)
        : [...prev.collections, slug],
    }))
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    setMessage(null)
    setFieldErrors({})

    const payload = {
      name: form.name,
      slug: form.slug,
      sku: form.sku,
      description: form.description,
      price: Number(form.price),
      originalPrice: form.originalPrice === '' ? null : Number(form.originalPrice),
      image: form.image,
      images: form.images,
      category: form.category,
      collections: form.collections,
      fabric: form.fabric,
      weave: form.weave,
      length: form.length,
      blouse: form.blouse,
      care: form.care,
      availability: form.availability,
      stock: Number(form.stock),
      active: form.active,
      featured: form.featured,
      isNew: form.isNew,
    }

    startTransition(async () => {
      try {
        const url =
          mode === 'create' ? '/api/admin/products' : `/api/admin/products/${product!.id}`
        const res = await fetch(url, {
          method: mode === 'create' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          setStatus('error')
          if (data.issues?.fieldErrors) {
            setFieldErrors(data.issues.fieldErrors)
          }
          setMessage(data.error ?? 'Unable to save product.')
          return
        }

        setStatus('saved')
        setMessage(mode === 'create' ? 'Product created' : 'Saved')
        if (mode === 'create' && data.product?.id) {
          router.push(`/admin/products/${data.product.id}`)
          router.refresh()
          return
        }
        router.refresh()
      } catch {
        setStatus('error')
        setMessage('Unable to save product.')
      }
    })
  }

  function err(key: string) {
    return fieldErrors[key]?.[0]
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
            {status === 'saving' || isPending
              ? 'Saving…'
              : status === 'saved'
                ? 'Saved'
                : status === 'error'
                  ? 'Error'
                  : 'Ready'}
          </p>
          {message ? (
            <p className={`mt-1 text-sm ${status === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>
              {message}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/products')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || status === 'saving'}>
            {isPending || status === 'saving' ? 'Saving…' : mode === 'create' ? 'Create product' : 'Save changes'}
          </Button>
        </div>
      </div>

      <section className="rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="font-medium">Basic information</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="name">
              Product name
            </label>
            <input
              id="name"
              className={fieldClass}
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
            />
            {err('name') ? <p className="mt-1 text-xs text-destructive">{err('name')}</p> : null}
          </div>
          <div>
            <label className={labelClass} htmlFor="slug">
              Slug
            </label>
            <input
              id="slug"
              className={fieldClass}
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true)
                update('slug', e.target.value)
              }}
              required
            />
            {err('slug') ? <p className="mt-1 text-xs text-destructive">{err('slug')}</p> : null}
          </div>
          <div>
            <label className={labelClass} htmlFor="sku">
              SKU
            </label>
            <input
              id="sku"
              className={fieldClass}
              value={form.sku}
              onChange={(e) => update('sku', e.target.value)}
              required
            />
            {err('sku') ? <p className="mt-1 text-xs text-destructive">{err('sku')}</p> : null}
          </div>
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className={`${fieldClass} min-h-28`}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              required
            />
            {err('description') ? (
              <p className="mt-1 text-xs text-destructive">{err('description')}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="font-medium">Pricing</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="price">
              Price (INR)
            </label>
            <input
              id="price"
              type="number"
              min={1}
              className={fieldClass}
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              required
            />
            {err('price') ? <p className="mt-1 text-xs text-destructive">{err('price')}</p> : null}
          </div>
          <div>
            <label className={labelClass} htmlFor="originalPrice">
              Original price (optional)
            </label>
            <input
              id="originalPrice"
              type="number"
              min={1}
              className={fieldClass}
              value={form.originalPrice}
              onChange={(e) => update('originalPrice', e.target.value)}
            />
            {err('originalPrice') ? (
              <p className="mt-1 text-xs text-destructive">{err('originalPrice')}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="font-medium">Inventory</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="stock">
              Stock
            </label>
            <input
              id="stock"
              type="number"
              min={0}
              className={fieldClass}
              value={form.stock}
              onChange={(e) => update('stock', e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="availability">
              Availability
            </label>
            <select
              id="availability"
              className={fieldClass}
              value={form.availability}
              onChange={(e) => update('availability', e.target.value as ProductAvailability)}
            >
              {Object.values(ProductAvailability).map((a) => (
                <option key={a} value={a}>
                  {a.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => update('active', e.target.checked)}
            />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update('featured', e.target.checked)}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isNew}
              onChange={(e) => update('isNew', e.target.checked)}
            />
            New arrival
          </label>
        </div>
      </section>

      <section className="rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="font-medium">Categorization</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={labelClass} htmlFor="category">
              Category
            </label>
            <input
              id="category"
              list="category-options"
              className={fieldClass}
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              required
            />
            <datalist id="category-options">
              {categoryOptions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <p className={labelClass}>Collections</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {collections.map((c) => {
                const selected = form.collections.includes(c.slug)
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => toggleCollection(c.slug)}
                    className={`rounded-md border px-3 py-1.5 text-sm ${
                      selected
                        ? 'border-wine/30 bg-wine/10 text-wine'
                        : 'border-border bg-white text-charcoal hover:bg-beige/60'
                    }`}
                  >
                    {c.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="font-medium">Product details</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(
            [
              ['fabric', 'Fabric'],
              ['weave', 'Weave'],
              ['length', 'Length'],
              ['blouse', 'Blouse'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className={labelClass} htmlFor={key}>
                {label}
              </label>
              <input
                id={key}
                className={fieldClass}
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                required
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="care">
              Care
            </label>
            <textarea
              id="care"
              className={`${fieldClass} min-h-20`}
              value={form.care}
              onChange={(e) => update('care', e.target.value)}
              required
            />
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="font-medium">Images</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Use existing public paths (e.g. /images/product-silk.png). File upload storage comes in a
          later phase.
        </p>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={labelClass} htmlFor="image">
              Main image path
            </label>
            <input
              id="image"
              className={fieldClass}
              value={form.image}
              onChange={(e) => update('image', e.target.value)}
              placeholder="/images/product-silk.png"
              required
            />
            {err('image') ? <p className="mt-1 text-xs text-destructive">{err('image')}</p> : null}
          </div>
          <div>
            <label className={labelClass} htmlFor="images">
              Additional images (one path per line)
            </label>
            <textarea
              id="images"
              className={`${fieldClass} min-h-24 font-mono text-xs`}
              value={form.images}
              onChange={(e) => update('images', e.target.value)}
              placeholder="/images/editorial-drape.png"
            />
          </div>
        </div>
      </section>
    </form>
  )
}
