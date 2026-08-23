import { z } from 'zod'
import { OrderStatus } from '@prisma/client'

export const orderStatusSchema = z.nativeEnum(OrderStatus)

export const orderStatusPatchSchema = z.object({
  status: orderStatusSchema,
})

export type OrderStatusPatch = z.infer<typeof orderStatusPatchSchema>

export function formatOrderStatusLabel(status: string): string {
  return status.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
}

export function formatPaymentStatusLabel(status: string): string {
  return formatOrderStatusLabel(status)
}
