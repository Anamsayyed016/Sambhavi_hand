/**
 * In-memory login rate limiter (per process).
 * Suitable for a single-node VPS deploy. Resets on process restart.
 */

type Bucket = {
  count: number
  resetAt: number
}

const attempts = new Map<string, Bucket>()

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 8

export type RateLimitResult = {
  allowed: boolean
  retryAfterSeconds: number
}

export function checkLoginRateLimit(key: string): RateLimitResult {
  const now = Date.now()
  const bucket = attempts.get(key)

  if (!bucket || bucket.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (bucket.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }

  bucket.count += 1
  return { allowed: true, retryAfterSeconds: 0 }
}

export function clearLoginRateLimit(key: string): void {
  attempts.delete(key)
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}
