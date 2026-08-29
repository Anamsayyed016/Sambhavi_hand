/**
 * TEMPORARY PAYMENT TEST MODE
 * ----------------------------
 * When enabled, the storefront shows only one purchasable product so
 * checkout → Razorpay → admin can be tested end-to-end.
 *
 * After testing: set PAYMENT_TEST_MODE to `false` and rebuild/redeploy.
 * Does NOT delete or mutate catalog product records.
 */
export const PAYMENT_TEST_MODE = true

/** Soft Silk Digital Print Saree — ₹2,460 (unchanged slug/image/details). */
export const PAYMENT_TEST_PRODUCT_SLUG = 'digital-print-saree-01'

export function isStorefrontProductVisible(slug: string): boolean {
  if (!PAYMENT_TEST_MODE) return true
  return slug === PAYMENT_TEST_PRODUCT_SLUG
}

export function filterStorefrontProducts<T extends { slug: string }>(list: T[]): T[] {
  if (!PAYMENT_TEST_MODE) return list
  return list.filter((item) => item.slug === PAYMENT_TEST_PRODUCT_SLUG)
}

/** True when product copy already promises free shipping. */
export function productOffersFreeShipping(product: {
  description?: string | null
}): boolean {
  return /free\s*shipping/i.test(product.description ?? '')
}
