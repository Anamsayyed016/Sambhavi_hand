'use client'

import Image from 'next/image'
import { useLayoutEffect, useMemo, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { Product } from '@prisma/client'
import { ProductAvailability } from '@prisma/client'
import {
  parseCollectionsField,
  parseImagesField,
  productCreateSchema,
} from '@/lib/admin/validation'
import {
  buildDuplicateInitialForm,
  type ProductDuplicateInitial,
} from '@/lib/admin/product-duplicate'
import { categoryNames } from '@/lib/categories'
import { Button } from '@/components/ui/button'

const PRODUCT_UPLOAD_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
const PRODUCT_UPLOAD_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_GALLERY = 12

type CollectionOption = { slug: string; name: string }

type FormState = {
  name: string
  description: string
  price: string
  originalPrice: string
  image: string
  images: string[]
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

type ProductFormProps = {
  mode: 'create' | 'edit' | 'duplicate'
  product?: Product
  /** Required for mode=duplicate — precomputed on the server so Soft Nav cannot start blank. */
  initialForm?: ProductDuplicateInitial
  categories: string[]
  collections: CollectionOption[]
}

function dedupeUrls(urls: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of urls) {
    const url = raw.trim()
    if (!url || seen.has(url)) continue
    seen.add(url)
    out.push(url)
  }
  return out
}

function toFormState(product?: Product): FormState {
  if (!product) {
    return {
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      image: '',
      images: [],
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
    description: product.description,
    price: String(product.price),
    originalPrice: product.originalPrice != null ? String(product.originalPrice) : '',
    image: product.image,
    images: dedupeUrls(product.images),
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

function emptyFormState(): FormState {
  return toFormState(undefined)
}

/**
 * Soft-navigation identity boundary for Add Product.
 * A distinct client host + per-mount key forces a fresh ProductForm so edit-page
 * state cannot leak into /admin/products/new (RSC keys alone are not reliable).
 */
export function ProductCreateFormHost({
  categories,
  collections,
}: {
  categories: string[]
  collections: CollectionOption[]
}) {
  const [mountKey] = useState(() => `product-create-${crypto.randomUUID()}`)
  return (
    <ProductForm
      key={mountKey}
      mode="create"
      categories={categories}
      collections={collections}
    />
  )
}

/**
 * Soft-navigation identity boundary for Duplicate Product.
 * `initialForm` is computed on the server from the source Product ID.
 */
export function ProductDuplicateFormHost({
  product,
  initialForm,
  categories,
  collections,
}: {
  product: Product
  initialForm: ProductDuplicateInitial
  categories: string[]
  collections: CollectionOption[]
}) {
  const [mountKey] = useState(
    () => `product-duplicate-${product.id}-${crypto.randomUUID()}`,
  )
  return (
    <ProductForm
      key={mountKey}
      mode="duplicate"
      product={product}
      initialForm={initialForm}
      categories={categories}
      collections={collections}
    />
  )
}

export function ProductForm({
  mode,
  product,
  initialForm,
  categories,
  collections,
}: ProductFormProps) {
  const router = useRouter()
  const pathname = usePathname() ?? ''

  const onNewRoute =
    pathname === '/admin/products/new' || pathname.endsWith('/products/new')
  const onDuplicateRoute = /\/admin\/products\/[^/]+\/duplicate\/?$/.test(pathname)

  // Duplicate ALWAYS wins over blank-create. Soft Nav can leave mode="create" while
  // pathname is already /[id]/duplicate — the old blank-first check wiped the template
  // (leaving only non-gated fields like category looking "sticky" from a prior edit).
  const isDuplicate = mode === 'duplicate' || onDuplicateRoute
  const isBlankCreate = !isDuplicate && (mode === 'create' || onNewRoute)
  const isEdit = !isBlankCreate && !isDuplicate && mode === 'edit'
  const usesPost = isBlankCreate || isDuplicate

  const [form, setForm] = useState<FormState>(() => {
    if (isDuplicate) {
      if (initialForm) {
        return {
          ...initialForm,
          images: [...initialForm.images],
          collections: [...initialForm.collections],
        }
      }
      if (product) return buildDuplicateInitialForm(product)
      return emptyFormState()
    }
    if (isBlankCreate) return emptyFormState()
    if (product) return toFormState(product)
    return emptyFormState()
  })
  const [collectionsTouched, setCollectionsTouched] = useState(() => isDuplicate)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  // Blocks Chrome autofill from writing prior product values before the user focuses a field.
  // Never gate duplicate — template values must remain visible and editable immediately.
  const [autofillGate, setAutofillGate] = useState(() => isBlankCreate)

  useLayoutEffect(() => {
    // Duplicate first — never allow a blank-create wipe to run on the duplicate route.
    if (isDuplicate) {
      if (initialForm) {
        setForm({
          ...initialForm,
          images: [...initialForm.images],
          collections: [...initialForm.collections],
        })
      } else if (product) {
        setForm(buildDuplicateInitialForm(product))
      } else {
        return
      }
      setCollectionsTouched(true)
      setStatus('idle')
      setMessage(null)
      setFieldErrors({})
      setUploadError(null)
      setAutofillGate(false)
      return
    }
    if (isBlankCreate) {
      setForm(emptyFormState())
      setCollectionsTouched(false)
      setStatus('idle')
      setMessage(null)
      setFieldErrors({})
      setUploadError(null)
      setAutofillGate(true)
      return
    }
    if (isEdit && product) {
      setForm(toFormState(product))
      setCollectionsTouched(false)
      setStatus('idle')
      setMessage(null)
      setFieldErrors({})
      setUploadError(null)
      setAutofillGate(false)
    }
  }, [isBlankCreate, isDuplicate, isEdit, pathname, product, initialForm])

  const categoryOptions = useMemo(() => {
    const set = new Set<string>([...categoryNames, ...categories])
    if (form.category.trim()) set.add(form.category.trim())
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [categories, form.category])

  const isNonCanonicalCategory =
    Boolean(form.category.trim()) && !categoryNames.includes(form.category.trim())

  const galleryUrls = useMemo(() => {
    const primary = form.image.trim()
    const rest = form.images.filter((u) => u !== primary)
    return primary ? [primary, ...rest] : rest
  }, [form.image, form.images])

  function unlockAutofillGate() {
    if (autofillGate) setAutofillGate(false)
  }

  function applyUploadedImageUrls(urls: string[]) {
    if (urls.length === 0) return
    setForm((prev) => {
      let primary = prev.image.trim()
      let gallery = dedupeUrls(prev.images)

      for (const url of urls) {
        if (!primary) {
          primary = url
          if (!gallery.includes(url)) gallery = [...gallery, url]
          continue
        }
        if (primary === url || gallery.includes(url)) continue
        if (gallery.length >= MAX_GALLERY) continue
        gallery = [...gallery, url]
      }

      return { ...prev, image: primary, images: gallery }
    })
  }

  async function uploadProductImages(files: FileList | File[]) {
    const list = Array.from(files)
    if (list.length === 0) return

    setUploading(true)
    setUploadError(null)
    const uploaded: string[] = []
    try {
      for (const file of list) {
        if (!PRODUCT_UPLOAD_TYPES.has(file.type)) {
          setUploadError('Invalid file type. Use JPG, PNG, WebP, or GIF.')
          continue
        }

        const body = new FormData()
        body.append('file', file)
        body.append('folder', 'sambhavi/products')
        body.append('purpose', 'product')
        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body,
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setUploadError(typeof data.error === 'string' ? data.error : 'Image upload failed.')
          break
        }
        const url = typeof data.url === 'string' ? data.url.trim() : ''
        if (!url) {
          setUploadError('Upload succeeded but no image URL was returned.')
          break
        }
        uploaded.push(url)
      }
      applyUploadedImageUrls(uploaded)
    } catch {
      setUploadError('Image upload failed. Existing images were not changed.')
    } finally {
      setUploading(false)
    }
  }

  function setAsMain(url: string) {
    setForm((prev) => {
      const gallery = dedupeUrls([url, ...prev.images.filter((u) => u !== url), prev.image])
      return { ...prev, image: url, images: gallery }
    })
  }

  function removeImage(url: string) {
    setForm((prev) => {
      const primary = prev.image.trim()
      const gallery = prev.images.filter((u) => u !== url)

      if (primary === url) {
        const nextPrimary = gallery[0] ?? ''
        return {
          ...prev,
          image: nextPrimary,
          images: gallery.filter((u) => u !== nextPrimary),
        }
      }

      return { ...prev, images: gallery }
    })
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setStatus('idle')
    setMessage(null)
  }

  function toggleCollection(slug: string) {
    setCollectionsTouched(true)
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

    const images = dedupeUrls(
      form.image.trim()
        ? [form.image.trim(), ...form.images.filter((u) => u !== form.image.trim())]
        : form.images,
    )

    const payload: Record<string, unknown> = {
      name: form.name,
      description: form.description,
      price: form.price === '' ? undefined : Number(form.price),
      originalPrice: form.originalPrice === '' ? null : Number(form.originalPrice),
      image: form.image,
      images,
      category: form.category,
      fabric: form.fabric,
      weave: form.weave,
      length: form.length,
      blouse: form.blouse,
      care: form.care,
      availability: form.availability,
      stock: form.stock === '' ? undefined : Number(form.stock),
      active: form.active,
      featured: form.featured,
      isNew: form.isNew,
    }

    // Create + duplicate always send collections. Edit only when intentionally changed.
    if (usesPost || collectionsTouched) {
      payload.collections = form.collections
    }

    // Same business schema as POST /api/admin/products (SKU/slug generated server-side).
    if (usesPost) {
      const clientParsed = productCreateSchema.safeParse({
        ...payload,
        images: parseImagesField(payload.images),
        collections: parseCollectionsField(payload.collections ?? []),
        active: payload.active ?? true,
        featured: payload.featured ?? false,
        isNew: payload.isNew ?? false,
      })
      if (!clientParsed.success) {
        const issues = clientParsed.error.flatten()
        setStatus('error')
        setFieldErrors(issues.fieldErrors)
        const fieldNames = Object.keys(issues.fieldErrors).filter(
          (key) => (issues.fieldErrors[key]?.length ?? 0) > 0,
        )
        const details = fieldNames
          .map((key) => `${key}: ${issues.fieldErrors[key]?.[0]}`)
          .join('; ')
        setMessage(
          fieldNames.length
            ? `Validation failed (${fieldNames.join(', ')}). ${details}`
            : 'Validation failed',
        )
        return
      }
    }

    startTransition(async () => {
      try {
        if (usesPost) {
          const res = await fetch('/api/admin/products', {
            method: 'POST',
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
          setMessage(isDuplicate ? 'Similar product created' : 'Product created')
          setCollectionsTouched(false)
          if (data.product?.id) {
            router.push(`/admin/products/${data.product.id}`)
            router.refresh()
            return
          }
          router.refresh()
          return
        }

        if (!product?.id) {
          setStatus('error')
          setMessage('Missing product id for edit.')
          return
        }

        const res = await fetch(`/api/admin/products/${product.id}`, {
          method: 'PATCH',
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
        setMessage('Saved')
        setCollectionsTouched(false)
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

  const busy = isPending || status === 'saving' || uploading

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-8"
      autoComplete="off"
      data-form-type={
        isBlankCreate ? 'product-create' : isDuplicate ? 'product-duplicate' : 'product-edit'
      }
      data-lpignore="true"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
            {isBlankCreate
              ? 'Add Product'
              : isDuplicate
                ? 'Create Similar Product'
                : 'Edit Product'}
            {' · '}
            {status === 'saving' || isPending
              ? 'Saving…'
              : status === 'saved'
                ? 'Saved'
                : status === 'error'
                  ? 'Error'
                  : 'Ready'}
          </p>
          {isDuplicate ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Template from an existing product. Adjust details if needed, then save — a new
              product is created; the original is not changed.
            </p>
          ) : null}
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
            disabled={busy}
            onClick={() =>
              router.push(
                isDuplicate && product?.id
                  ? `/admin/products/${product.id}`
                  : '/admin/products',
              )
            }
          >
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {isPending || status === 'saving'
              ? 'Saving…'
              : usesPost
                ? 'Save Product'
                : 'Save changes'}
          </Button>
        </div>
      </div>

      <section className="rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="font-medium">Product details</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="name">
              Product name
            </label>
            <input
              id="name"
              name="product_name_new"
              autoComplete="off"
              readOnly={autofillGate}
              onFocus={unlockAutofillGate}
              className={fieldClass}
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
            />
            {err('name') ? <p className="mt-1 text-xs text-destructive">{err('name')}</p> : null}
          </div>
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="product_description_new"
              autoComplete="off"
              readOnly={autofillGate}
              onFocus={unlockAutofillGate}
              className={`${fieldClass} min-h-28`}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              required
              minLength={10}
              maxLength={5000}
            />
            {err('description') ? (
              <p className="mt-1 text-xs text-destructive">{err('description')}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="font-medium">Category</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Storefront category — where this product appears in the catalog taxonomy.
        </p>
        <div className="mt-4">
          <label className={labelClass} htmlFor="category">
            Category
          </label>
          <select
            id="category"
            className={fieldClass}
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            required
          >
            <option value="" disabled>
              Select category…
            </option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {isNonCanonicalCategory ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Current category: <span className="font-medium text-charcoal">{form.category}</span>
              {' — '}not in the standard storefront list; preserved until you change it.
            </p>
          ) : null}
          <p className="mt-1.5 text-xs text-muted-foreground">
            For Navratri sub-collections, choose <strong>CHHABILI</strong>, <strong>JOBANIYU</strong>,
            or <strong>Lehenga Collection</strong>, then also toggle the matching collection below.
          </p>
          {err('category') ? <p className="mt-1 text-xs text-destructive">{err('category')}</p> : null}
        </div>
      </section>

      <section className="rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="font-medium">Collections</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Optional explicit collections — separate from storefront category. Changing category does
          not change these.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
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
                {selected ? '✓ ' : ''}
                {c.name}
              </button>
            )
          })}
        </div>
        {isEdit && !collectionsTouched ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Collections unchanged — saving other fields will keep the current memberships.
          </p>
        ) : null}
      </section>

      <section className="rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="font-medium">Pricing</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="price">
              Price (₹)
            </label>
            <input
              id="price"
              type="number"
              min={1}
              step={1}
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
              Stock quantity
            </label>
            <input
              id="stock"
              type="number"
              min={0}
              step={1}
              className={fieldClass}
              value={form.stock}
              onChange={(e) => update('stock', e.target.value)}
              required
            />
            {err('stock') ? <p className="mt-1 text-xs text-destructive">{err('stock')}</p> : null}
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
        </div>
      </section>

      <section className="rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="font-medium">Product images</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload to Cloudflare R2 (up to {MAX_GALLERY} images). New uploads are added — existing
          images stay until you remove them.
        </p>
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center rounded-md border border-border bg-white px-3 py-2 text-sm hover:bg-beige/50">
              <input
                type="file"
                accept={PRODUCT_UPLOAD_ACCEPT}
                multiple
                className="sr-only"
                disabled={busy || galleryUrls.length >= MAX_GALLERY}
                onChange={(e) => {
                  const files = e.target.files
                  if (files?.length) void uploadProductImages(files)
                  e.target.value = ''
                }}
              />
              {uploading ? 'Uploading…' : 'Upload Images'}
            </label>
            <p className="text-xs text-muted-foreground">
              {galleryUrls.length}/{MAX_GALLERY} images
            </p>
          </div>
          {uploadError ? <p className="text-sm text-destructive">{uploadError}</p> : null}
          {err('image') ? <p className="text-xs text-destructive">{err('image')}</p> : null}
          {err('images') ? <p className="text-xs text-destructive">{err('images')}</p> : null}

          {galleryUrls.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No images yet. Upload at least one — a main image is required to save.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {galleryUrls.map((url) => {
                const isMain = form.image.trim() === url
                return (
                  <li
                    key={url}
                    className="overflow-hidden rounded-md border border-border bg-white"
                  >
                    <div className="relative aspect-[3/4] bg-beige">
                      <Image
                        src={url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                      {isMain ? (
                        <span className="absolute left-2 top-2 rounded bg-wine px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary-foreground">
                          Main
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-1 p-2">
                      {!isMain ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setAsMain(url)}
                          className="rounded border border-border px-2 py-1 text-[11px] hover:bg-beige/60"
                        >
                          Set as main
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => removeImage(url)}
                        className="rounded border border-border px-2 py-1 text-[11px] text-destructive hover:bg-beige/60"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          <details className="rounded-md border border-border/70 bg-white/60 p-3">
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
              Advanced: paste existing image URLs
            </summary>
            <p className="mt-2 text-xs text-muted-foreground">
              For trusted public URLs already hosted (e.g. existing Cloudinary or R2 links). This
              does not upload a file to R2 — use Upload Images above for new files.
            </p>
            <div className="mt-3 space-y-3">
              <div>
                <label className={labelClass} htmlFor="image">
                  Main image URL
                </label>
                <input
                  id="image"
                  name="product_main_image_url"
                  autoComplete="off"
                  readOnly={autofillGate}
                  onFocus={unlockAutofillGate}
                  className={fieldClass}
                  value={form.image}
                  onChange={(e) => update('image', e.target.value)}
                  placeholder="https://…"
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="images">
                  Gallery URLs (one per line)
                </label>
                <textarea
                  id="images"
                  name="product_gallery_urls"
                  autoComplete="off"
                  readOnly={autofillGate}
                  onFocus={unlockAutofillGate}
                  className={`${fieldClass} min-h-24 font-mono text-xs`}
                  value={form.images.join('\n')}
                  onChange={(e) =>
                    update(
                      'images',
                      dedupeUrls(
                        e.target.value
                          .split(/[\n,]/)
                          .map((s) => s.trim())
                          .filter(Boolean),
                      ),
                    )
                  }
                />
              </div>
            </div>
          </details>
        </div>
      </section>

      <section className="rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="font-medium">Fabric & care</h2>
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
                maxLength={200}
              />
              {err(key) ? <p className="mt-1 text-xs text-destructive">{err(key)}</p> : null}
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
              maxLength={500}
            />
            {err('care') ? <p className="mt-1 text-xs text-destructive">{err('care')}</p> : null}
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="font-medium">Status</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Active products appear on the storefront. Uncheck to archive (hide from store).
        </p>
        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => update('active', e.target.checked)}
            />
            Active (storefront visible)
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
    </form>
  )
}
