type Bucket = { count: number; resetAt: number }

const attempts = new Map<string, Bucket>()
const WINDOW_MS = 60 * 60 * 1000
/** Default for order creation / payment — keep strict. */
const MAX_ATTEMPTS = 10
/** Coupon preview/apply is interactive; allow more retries without blocking checkout. */
const APPLY_COUPON_MAX_ATTEMPTS = 60

export function checkCheckoutRateLimit(
  key: string,
  maxAttempts = MAX_ATTEMPTS,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  const bucket = attempts.get(key)
  const limit = key.startsWith('apply-coupon:') ? APPLY_COUPON_MAX_ATTEMPTS : maxAttempts

  if (!bucket || bucket.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }

  bucket.count += 1
  return { allowed: true, retryAfterSeconds: 0 }
}

export function getCheckoutClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}
