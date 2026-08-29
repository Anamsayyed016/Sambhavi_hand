/**
 * TEMPORARY PAYMENT TEST HELPERS
 * ------------------------------
 * Catalog visibility is fully restored (`PAYMENT_TEST_MODE = false`).
 * Soft Silk Digital Print Saree (`digital-print-saree-01`) uses a temporary
 * ₹1 selling price in the catalog for a real Razorpay payment smoke test.
 * Restore price to ₹2460 after testing. Does not hide or delete products.
 */
export const PAYMENT_TEST_MODE = false

/** Soft Silk Digital Print Saree — temporary ₹1 payment-test price (slug unchanged). */
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
