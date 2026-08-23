/** Server-side shipping rule (source of truth for checkout). */
export const SHIPPING_FLAT_INR = 149
export const FREE_SHIPPING_THRESHOLD_INR = 9999

export function calculateShipping(subtotalInr: number): number {
  if (subtotalInr <= 0) return 0
  if (subtotalInr >= FREE_SHIPPING_THRESHOLD_INR) return 0
  return SHIPPING_FLAT_INR
}

export function calculateOrderTotal(subtotalInr: number): {
  subtotal: number
  shipping: number
  total: number
} {
  const shipping = calculateShipping(subtotalInr)
  return {
    subtotal: subtotalInr,
    shipping,
    total: subtotalInr + shipping,
  }
}
