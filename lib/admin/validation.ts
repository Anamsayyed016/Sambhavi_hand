import { z } from 'zod'
import { ProductAvailability } from '@prisma/client'

export const productAvailabilitySchema = z.nativeEnum(ProductAvailability)

export const productInputSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(200),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug is required')
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  sku: z.string().trim().min(2, 'SKU is required').max(80),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000),
  price: z.coerce.number().int().min(1, 'Price must be at least ₹1'),
  originalPrice: z
    .union([z.coerce.number().int().min(1), z.literal(''), z.null(), z.undefined()])
    .transform((v) => (v === '' || v === null || v === undefined ? null : v))
    .refine((v) => v === null || v >= 1, 'Original price must be at least ₹1'),
  image: z.string().trim().min(1, 'Main image path is required').max(500),
  images: z.array(z.string().trim().min(1).max(500)).max(12).default([]),
  category: z.string().trim().min(1, 'Category is required').max(100),
  collections: z.array(z.string().trim().min(1).max(100)).max(20).default([]),
  fabric: z.string().trim().min(1, 'Fabric is required').max(200),
  weave: z.string().trim().min(1, 'Weave is required').max(200),
  length: z.string().trim().min(1, 'Length is required').max(200),
  blouse: z.string().trim().min(1, 'Blouse details are required').max(200),
  care: z.string().trim().min(1, 'Care instructions are required').max(500),
  availability: productAvailabilitySchema,
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  isNew: z.boolean().default(false),
})

export type ProductInput = z.infer<typeof productInputSchema>

export const productPatchSchema = productInputSchema.partial()

export type ProductPatch = z.infer<typeof productPatchSchema>

export function parseImagesField(raw: unknown): string[] {
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
