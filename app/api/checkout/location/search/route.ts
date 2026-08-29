import { NextResponse } from 'next/server'
import { searchAddresses } from '@/lib/checkout/geocode'
import { assertCheckoutOrigin, CheckoutError, checkoutErrorResponse } from '@/lib/checkout/errors'
import { getCheckoutClientIp } from '@/lib/checkout/rate-limit'

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()
const WINDOW_MS = 60_000
const MAX = 30

function allow(key: string): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (bucket.count >= MAX) return false
  bucket.count += 1
  return true
}

export async function GET(request: Request) {
  try {
    assertCheckoutOrigin(request)
    const ip = getCheckoutClientIp(request)
    if (!allow(`search:${ip}`)) {
      throw new CheckoutError('Too many address searches. Please try again shortly.', 429)
    }

    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    if (q.length < 3) {
      return NextResponse.json({ suggestions: [] })
    }
    if (q.length > 200) {
      throw new CheckoutError('Search query is too long.', 400)
    }

    const suggestions = await searchAddresses(q, 5)
    return NextResponse.json({ suggestions })
  } catch (error) {
    return checkoutErrorResponse(error)
  }
}
