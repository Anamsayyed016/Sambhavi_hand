import { createHmac, timingSafeEqual } from 'node:crypto'
import { CheckoutError } from '@/lib/checkout/errors'

export function getRazorpayKeyId(): string {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim()
  if (!keyId) {
    throw new CheckoutError('Payment service is temporarily unavailable. Please try again.', 503)
  }
  return keyId
}

function getRazorpayKeySecret(): string {
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim()
  if (!secret) {
    throw new CheckoutError('Payment service is temporarily unavailable. Please try again.', 503)
  }
  return secret
}

export function getRazorpayWebhookSecret(): string | null {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim()
  return secret || null
}

function timingSafeHexEqual(expectedHex: string, provided: string): boolean {
  try {
    const a = Buffer.from(expectedHex, 'utf8')
    const b = Buffer.from(provided, 'utf8')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export function verifyCheckoutSignature(params: {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}): boolean {
  const expected = createHmac('sha256', getRazorpayKeySecret())
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest('hex')
  return timingSafeHexEqual(expected, params.razorpaySignature)
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = getRazorpayWebhookSecret()
  if (!secret) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  return timingSafeHexEqual(expected, signature)
}

type RazorpayOrder = {
  id: string
  amount: number
  currency: string
  status: string
  receipt?: string
}

type RazorpayPayment = {
  id: string
  order_id: string
  amount: number
  currency: string
  status: string
}

async function razorpayRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const keyId = getRazorpayKeyId()
  const keySecret = getRazorpayKeySecret()
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const data = (await res.json().catch(() => ({}))) as T & { error?: { description?: string } }
  if (!res.ok) {
    throw new CheckoutError('Payment service is temporarily unavailable. Please try again.', 503)
  }
  return data
}

export async function createRazorpayOrder(input: {
  amountPaise: number
  receipt: string
  notes: Record<string, string>
}): Promise<RazorpayOrder> {
  return razorpayRequest<RazorpayOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: 'INR',
      receipt: input.receipt.slice(0, 40),
      notes: input.notes,
    }),
  })
}

export async function fetchRazorpayPayment(paymentId: string): Promise<RazorpayPayment> {
  return razorpayRequest<RazorpayPayment>(`/payments/${encodeURIComponent(paymentId)}`)
}
