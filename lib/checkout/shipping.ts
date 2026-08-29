import { prisma } from '@/lib/prisma'

/** Fallback defaults when StoreSettings is unavailable (matches schema defaults). */
export const SHIPPING_FLAT_INR = 149
export const FREE_SHIPPING_THRESHOLD_INR = 9999

export function calculateShipping(
  subtotalInr: number,
  shippingFee = SHIPPING_FLAT_INR,
  freeShippingThreshold = FREE_SHIPPING_THRESHOLD_INR,
): number {
  if (subtotalInr <= 0) return 0
  if (subtotalInr >= freeShippingThreshold) return 0
  return shippingFee
}

export function calculateOrderTotal(
  subtotalInr: number,
  shippingFee = SHIPPING_FLAT_INR,
  freeShippingThreshold = FREE_SHIPPING_THRESHOLD_INR,
): {
  subtotal: number
  shipping: number
  total: number
} {
  const shipping = calculateShipping(subtotalInr, shippingFee, freeShippingThreshold)
  return {
    subtotal: subtotalInr,
    shipping,
    total: subtotalInr + shipping,
  }
}

/** Server-side shipping rules from StoreSettings (source of truth for checkout create). */
export async function getShippingRules(): Promise<{
  shippingFee: number
  freeShippingThreshold: number
}> {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'default' },
      select: { shippingFee: true, freeShippingThreshold: true },
    })
    if (settings) {
      return {
        shippingFee: settings.shippingFee,
        freeShippingThreshold: settings.freeShippingThreshold,
      }
    }
  } catch {
    // Fall through to defaults if DB is unavailable during client preview imports.
  }
  return {
    shippingFee: SHIPPING_FLAT_INR,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD_INR,
  }
}
