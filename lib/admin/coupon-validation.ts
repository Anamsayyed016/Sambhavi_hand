import { z } from 'zod'
import { DiscountType } from '@prisma/client'

const couponFieldsSchema = z.object({
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
    .union([z.coerce.number().int().min(0), z.literal(''), z.null(), z.undefined()])
    .transform((v) => (v === '' || v === null || v === undefined ? null : v)),
  startsAt: z.union([z.string().datetime(), z.literal(''), z.null(), z.undefined()]).optional(),
  expiresAt: z.union([z.string().datetime(), z.literal(''), z.null(), z.undefined()]).optional(),
  usageLimit: z
    .union([z.coerce.number().int().min(1), z.literal(''), z.null(), z.undefined()])
    .transform((v) => (v === '' || v === null || v === undefined ? null : v)),
  active: z.boolean().default(true),
})

function validateDiscountValue(
  data: { discountType?: DiscountType; discountValue?: number },
  ctx: z.RefinementCtx,
): void {
  if (
    data.discountType === DiscountType.PERCENTAGE &&
    data.discountValue != null &&
    data.discountValue > 100
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['discountValue'],
      message: 'Percentage discount cannot exceed 100',
    })
  }
}

export const couponInputSchema = couponFieldsSchema.superRefine(validateDiscountValue)

export type CouponInput = z.infer<typeof couponInputSchema>

export const couponPatchSchema = couponFieldsSchema.partial().superRefine(validateDiscountValue)
