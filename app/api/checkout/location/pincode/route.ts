import { NextResponse } from 'next/server'
import { lookupIndianPincode } from '@/lib/checkout/geocode'
import { INDIA_PIN_REGEX } from '@/lib/checkout/india-locations'
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
    if (!allow(`pin:${ip}`)) {
      throw new CheckoutError('Too many PIN lookups. Please try again shortly.', 429)
    }

    const pin = (new URL(request.url).searchParams.get('pin') || '').trim()
    if (!INDIA_PIN_REGEX.test(pin)) {
      return NextResponse.json({ address: null })
    }

    const address = await lookupIndianPincode(pin)
    return NextResponse.json({ address })
  } catch (error) {
    return checkoutErrorResponse(error)
  }
}
