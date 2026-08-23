import { z } from 'zod'

export const MAX_LINE_QUANTITY = 10
export const MAX_CART_LINES = 20

export const checkoutItemSchema = z.object({
  slug: z.string().trim().min(1).max(200),
  quantity: z.coerce.number().int().min(1).max(MAX_LINE_QUANTITY),
})

export const checkoutCustomerSchema = z.object({
  name: z.string().trim().min(2, 'Full name is required').max(120),
  email: z.string().trim().email('Enter a valid email').max(320),
  phone: z
    .string()
    .trim()
    .min(10, 'Enter a valid phone number')
    .max(20)
    .regex(/^[0-9+\s()-]+$/, 'Enter a valid phone number'),
})

export const checkoutShippingSchema = z.object({
  address: z.string().trim().min(5, 'Address is required').max(500),
  city: z.string().trim().min(2, 'City is required').max(120),
  state: z.string().trim().min(2, 'State is required').max(120),
  postalCode: z.string().trim().min(4, 'Postal code is required').max(20),
  country: z.string().trim().min(2).max(120).default('IN'),
})

export const checkoutRequestSchema = z.object({
  idempotencyKey: z.string().trim().min(8).max(64),
  customer: checkoutCustomerSchema,
  shipping: checkoutShippingSchema,
  items: checkoutItemSchema.array().min(1, 'Your cart is empty').max(MAX_CART_LINES),
})

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>
