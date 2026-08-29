'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-provider'
import {
  SHIPPING_FLAT_INR,
  FREE_SHIPPING_THRESHOLD_INR,
  calculateOrderTotal,
} from '@/lib/checkout/shipping'
import { productOffersFreeShipping } from '@/lib/payment-test-mode'
import { loadRazorpayScript, type RazorpaySuccessResponse } from '@/lib/payments/load-razorpay'
import { formatINR, getProduct } from '@/lib/products'

const inputClass =
  'h-11 w-full rounded-md border border-border bg-background px-4 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none'

type FormState = {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
}

export function CheckoutForm() {
  const router = useRouter()
  const { items, subtotal, clearCart, revalidatePrices } = useCart()
  const idempotencyKey = useRef(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `ck-${Date.now()}`,
  )

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const processing = useRef(false)

  const preview = useMemo(() => {
    const cartOffersFreeShipping =
      items.length > 0 &&
      items.every((item) => {
        const product = getProduct(item.slug)
        return product ? productOffersFreeShipping(product) : false
      })
    return calculateOrderTotal(
      subtotal,
      cartOffersFreeShipping ? 0 : SHIPPING_FLAT_INR,
      FREE_SHIPPING_THRESHOLD_INR,
    )
  }, [items, subtotal])

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  async function verifyPayment(orderNumber: string, response: RazorpaySuccessResponse) {
    const res = await fetch('/api/payment/razorpay/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.paid) {
      throw new Error(data.error ?? 'Payment could not be verified. Please try again.')
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) {
      setError('Your cart is empty.')
      return
    }
    if (processing.current) return
    processing.current = true

    setStatus('submitting')
    setError(null)

    try {
      const priced = await revalidatePrices()
      if (!priced.ok || !priced.items || priced.items.length === 0) {
        setStatus('error')
        setError(priced.error ?? 'Unable to refresh prices. Please try again.')
        return
      }

      const checkoutLines = priced.items

      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone,
          },
          shipping: {
            address: form.address,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country,
          },
          items: checkoutLines.map((item) => ({ slug: item.slug, quantity: item.quantity })),
        }),
      })

      const checkoutData = await checkoutRes.json().catch(() => ({}))

      if (!checkoutRes.ok) {
        setStatus('error')
        setError(checkoutData.error ?? 'Unable to place your order. Please try again.')
        return
      }

      const orderNumber = checkoutData.orderNumber as string

      const razorpayRes = await fetch('/api/payment/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber }),
      })
      const razorpayData = await razorpayRes.json().catch(() => ({}))

      if (!razorpayRes.ok) {
        setStatus('error')
        setError(razorpayData.error ?? 'Payment service is temporarily unavailable. Please try again.')
        return
      }

      const expectedPaise =
        typeof checkoutData.total === 'number' ? checkoutData.total * 100 : null
      if (
        expectedPaise != null &&
        typeof razorpayData.amount === 'number' &&
        razorpayData.amount !== expectedPaise
      ) {
        setStatus('error')
        setError('Payment amount mismatch. Please refresh and try again.')
        return
      }

      if (razorpayData.alreadyPaid) {
        clearCart()
        router.push(`/checkout/success/${encodeURIComponent(orderNumber)}`)
        return
      }

      const Razorpay = await loadRazorpayScript().catch(() => null)
      if (!Razorpay) {
        setStatus('error')
        setError('Payment service is temporarily unavailable. Please try again.')
        return
      }

      await new Promise<void>((resolve) => {
        let outcome: 'handler' | 'dismiss' | null = null

        const done = () => resolve()

        try {
          const checkout = new Razorpay({
            key: razorpayData.keyId,
            amount: razorpayData.amount,
            currency: razorpayData.currency ?? 'INR',
            name: 'Sambhavi Handloom',
            description: `Order ${orderNumber}`,
            order_id: razorpayData.razorpayOrderId,
            prefill: {
              name: razorpayData.customer?.name ?? form.name,
              email: razorpayData.customer?.email ?? form.email,
              contact: razorpayData.customer?.contact ?? form.phone,
            },
            theme: { color: '#7a1f2b' },
            handler: async (response: RazorpaySuccessResponse) => {
              outcome = 'handler'
              try {
                await verifyPayment(orderNumber, response)
                clearCart()
                router.push(`/checkout/success/${encodeURIComponent(orderNumber)}`)
              } catch (err) {
                setStatus('error')
                setError(
                  err instanceof Error
                    ? err.message
                    : 'Payment could not be verified. Please try again.',
                )
              } finally {
                done()
              }
            },
            modal: {
              ondismiss: () => {
                window.setTimeout(() => {
                  if (outcome === 'handler') return
                  outcome = 'dismiss'
                  setStatus('idle')
                  setError('Payment was cancelled. You can try again.')
                  done()
                }, 500)
              },
            },
          })

          checkout.open()
        } catch {
          setStatus('error')
          setError('Payment service is temporarily unavailable. Please try again.')
          done()
        }
      })
    } catch {
      setStatus('error')
      setError('Unable to place your order. Please try again.')
    } finally {
      processing.current = false
      setStatus((current) => (current === 'submitting' ? 'idle' : current))
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-md border border-border bg-card p-10 text-center">
        <h1 className="font-serif text-2xl text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">Add sarees to your bag before checkout.</p>
        <Button className="mt-6" render={<Link href="/shop" />}>
          Continue Shopping
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
      <div className="space-y-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground md:text-4xl">Checkout</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete your details below. You will pay securely with Razorpay after placing the order.
          </p>
        </div>

        <section className="space-y-4 rounded-md border border-border bg-card p-6">
          <h2 className="font-serif text-xl text-foreground">Contact information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label htmlFor="checkout-name" className="text-sm font-medium">
                Full name
              </label>
              <input
                id="checkout-name"
                required
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={inputClass}
                autoComplete="name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="checkout-email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="checkout-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className={inputClass}
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="checkout-phone" className="text-sm font-medium">
                Phone
              </label>
              <input
                id="checkout-phone"
                type="tel"
                required
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className={inputClass}
                autoComplete="tel"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-md border border-border bg-card p-6">
          <h2 className="font-serif text-xl text-foreground">Shipping address</h2>
          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="checkout-address" className="text-sm font-medium">
                Address
              </label>
              <textarea
                id="checkout-address"
                required
                rows={3}
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                className={`${inputClass} h-auto py-3`}
                autoComplete="street-address"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="checkout-city" className="text-sm font-medium">
                  City
                </label>
                <input
                  id="checkout-city"
                  required
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className={inputClass}
                  autoComplete="address-level2"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="checkout-state" className="text-sm font-medium">
                  State
                </label>
                <input
                  id="checkout-state"
                  required
                  value={form.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  className={inputClass}
                  autoComplete="address-level1"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="checkout-postal" className="text-sm font-medium">
                  Postal code
                </label>
                <input
                  id="checkout-postal"
                  required
                  value={form.postalCode}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                  className={inputClass}
                  autoComplete="postal-code"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="checkout-country" className="text-sm font-medium">
                  Country
                </label>
                <input
                  id="checkout-country"
                  required
                  value={form.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  className={inputClass}
                  autoComplete="country-name"
                />
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={status === 'submitting'}
          className="h-12 w-full rounded-none bg-primary text-sm uppercase tracking-luxe text-primary-foreground hover:bg-primary/90 lg:hidden"
          size="lg"
        >
          {status === 'submitting' ? 'Processing...' : 'Pay Securely'}
        </Button>
      </div>

      <aside className="sticky top-24 space-y-4 rounded-md border border-border bg-card p-6">
        <h2 className="font-serif text-xl text-foreground">Order summary</h2>
        <ul className="max-h-72 space-y-4 overflow-y-auto border-b border-border pb-4">
          {items.map((item) => (
            <li key={item.slug} className="flex gap-3">
              <div className="relative aspect-3/4 w-16 shrink-0 overflow-hidden rounded-sm bg-muted">
                <Image
                  src={item.image || '/placeholder.svg'}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-sm leading-tight">{item.name}</p>
                <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                <p className="mt-1 text-sm">{formatINR(item.price * item.quantity)}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="text-foreground">{formatINR(preview.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span className="text-foreground">
              {preview.shipping === 0 ? 'Free' : formatINR(preview.shipping)}
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-3 font-serif text-lg text-foreground">
            <span>Total</span>
            <span>{formatINR(preview.total)}</span>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Final amounts are confirmed on the server when you pay. Your card or UPI details never
          pass through Sambhavi servers.
        </p>
        <Button
          type="submit"
          disabled={status === 'submitting'}
          className="hidden h-12 w-full rounded-none bg-primary text-sm uppercase tracking-luxe text-primary-foreground hover:bg-primary/90 lg:inline-flex"
          size="lg"
        >
          {status === 'submitting' ? 'Processing...' : 'Pay Securely'}
        </Button>
      </aside>
    </form>
  )
}
