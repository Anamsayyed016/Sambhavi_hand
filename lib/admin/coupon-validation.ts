import { z } from 'zod'
import { DiscountType } from '@prisma/client'

export const couponInputSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase letters, numbers, _ or -'),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.coerce.number().int().min(1),
  minOrderValue: z
    .union([z.coerce.number().int().min(0), z.literal(''), z.null(), z.undefined()])
    .transform((v) => (v === '' || v === null || v === undefined ? null : v)),
  maxDiscount: z
    .union([z.coerce.number().int().min(1), z.literal(''), z.null(), z.undefined()])
    .transform((v) => (v === '' || v === null || v === undefined ? null : v)),
  startsAt: z.union([z.string().datetime(), z.literal(''), z.null(), z.undefined()]).optional(),
  expiresAt: z.union([z.string().datetime(), z.literal(''), z.null(), z.undefined()]).optional(),
  usageLimit: z
    .union([z.coerce.number().int().min(1), z.literal(''), z.null(), z.undefined()])
    .transform((v) => (v === '' || v === null || v === undefined ? null : v)),
  active: z.boolean().default(true),
})

export type CouponInput = z.infer<typeof couponInputSchema>

export const couponPatchSchema = couponInputSchema.partial()
