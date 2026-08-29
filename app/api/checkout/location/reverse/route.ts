import { NextResponse } from 'next/server'
import { reverseGeocode } from '@/lib/checkout/geocode'
import { assertCheckoutOrigin, CheckoutError, checkoutErrorResponse } from '@/lib/checkout/errors'
import { getCheckoutClientIp } from '@/lib/checkout/rate-limit'

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()
const WINDOW_MS = 60_000
const MAX = 20

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

export async function POST(request: Request) {
  try {
    assertCheckoutOrigin(request)
    const ip = getCheckoutClientIp(request)
    if (!allow(`rev:${ip}`)) {
      throw new CheckoutError('Too many location requests. Please try again shortly.', 429)
    }

    const body = (await request.json().catch(() => null)) as { lat?: unknown; lng?: unknown } | null
    const lat = typeof body?.lat === 'number' ? body.lat : Number(body?.lat)
    const lng = typeof body?.lng === 'number' ? body.lng : Number(body?.lng)

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      throw new CheckoutError('Invalid coordinates.', 400)
    }

    const resolved = await reverseGeocode(lat, lng)
    if (!resolved) {
      return NextResponse.json(
        { error: 'Could not resolve this location. Please enter your address manually.' },
        { status: 404 },
      )
    }

    return NextResponse.json({ address: resolved })
  } catch (error) {
    return checkoutErrorResponse(error)
  }
}
