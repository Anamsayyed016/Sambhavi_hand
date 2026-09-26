import { z } from 'zod'
import { ProductAvailability } from '@prisma/client'

export const productAvailabilitySchema = z.nativeEnum(ProductAvailability)

/**
 * Optional product-spec strings. Empty/null/undefined → "" for Prisma NOT NULL columns.
 * Never require Fabric / Weave / Length / Blouse / Care.
 */
const optionalSpecString = (max: number) =>
  z.preprocess(
    (value) => (value == null ? '' : String(value)),
    z.string().trim().max(max),
  )

/** Business fields accepted from admin create/edit. SKU + slug are server-generated on create. */
export const productBusinessFieldsSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(200),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000),
  price: z.coerce.number().int().min(1, 'Price must be at least ₹1'),
  originalPrice: z
    .union([z.coerce.number().int().min(1), z.literal(''), z.null(), z.undefined()])
    .transform((v) => (v === '' || v === null || v === undefined ? null : v))
    .refine((v) => v === null || v >= 1, 'Original price must be at least ₹1'),
  image: z.string().trim().min(1, 'Main image path is required').max(500),
  images: z.array(z.string().trim().min(1).max(500)).default([]),
  /** Product videos — stored separately from images; never mixed into images[]. */
  videos: z.array(z.string().trim().min(1).max(500)).default([]),
  category: z.string().trim().min(1, 'Category is required').max(100),
  collections: z.array(z.string().trim().min(1).max(100)).max(20).default([]),
  fabric: optionalSpecString(200),
  weave: optionalSpecString(200),
  length: optionalSpecString(200),
  blouse: optionalSpecString(200),
  care: optionalSpecString(500),
  availability: productAvailabilitySchema,
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  isNew: z.boolean().default(false),
})

/** POST /api/admin/products — no client sku/slug. */
export const productCreateSchema = productBusinessFieldsSchema

export type ProductCreateInput = z.infer<typeof productCreateSchema>

/** @deprecated Prefer productCreateSchema — kept as alias for create payload shape. */
export const productInputSchema = productCreateSchema

export type ProductInput = ProductCreateInput

/** PATCH — partial business fields only; sku/slug are immutable. */
export const productPatchSchema = productBusinessFieldsSchema.partial()

export type ProductPatch = z.infer<typeof productPatchSchema>

export function parseImagesField(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return dedupeImageUrls(raw.map(String))
  }
  if (typeof raw === 'string') {
    return dedupeImageUrls(
      raw
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean),
    )
  }
  return []
}

/** Same URL dedupe rules as images — used for Product.videos[]. */
export function parseVideosField(raw: unknown): string[] {
  return parseImagesField(raw)
}

/** Preserve order; drop blank / duplicate URLs. */
export function dedupeImageUrls(urls: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of urls) {
    const url = String(raw).trim()
    if (!url || seen.has(url)) continue
    seen.add(url)
    out.push(url)
  }
  return out
}

export function parseCollectionsField(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map(String).map((s) => s.trim()).filter(Boolean)
  }
  if (typeof raw === 'string') {
    return raw
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}

/** Strip client-supplied identifiers so POST/PATCH never trust them. */
export function omitClientIdentifiers<T extends Record<string, unknown>>(body: T): Omit<T, 'sku' | 'slug'> {
  const { sku: _sku, slug: _slug, ...rest } = body
  return rest
}
