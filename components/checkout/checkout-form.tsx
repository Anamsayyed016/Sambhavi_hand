'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-provider'
import {
  CouponSection,
  type AppliedCoupon,
} from '@/components/checkout/coupon-section'
import {
  ShippingAddressFields,
  type ShippingFormValues,
} from '@/components/checkout/shipping-address-fields'
import {
  SHIPPING_FLAT_INR,
  FREE_SHIPPING_THRESHOLD_INR,
  calculateOrderTotal,
} from '@/lib/checkout/shipping'
import {
  checkoutCustomerSchema,
  checkoutShippingSchema,
} from '@/lib/checkout/validation'
import { productOffersFreeShipping } from '@/lib/payment-test-mode'
import { loadRazorpayScript, type RazorpaySuccessResponse } from '@/lib/payments/load-razorpay'
import { formatINR, getProduct } from '@/lib/products'

const inputClass =
  'h-11 w-full rounded-md border border-border bg-background px-4 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none'

type FormState = {
  name: string
  email: string
  phone: string
} & ShippingFormValues

type FieldErrors = Partial<Record<keyof FormState, string>>

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const appliedForCartKey = useRef<string | null>(null)
  const processing = useRef(false)

  const preview = useMemo(() => {
    if (appliedCoupon) {
      return {
        subtotal: appliedCoupon.subtotal,
        discount: appliedCoupon.discount,
        shipping: appliedCoupon.shipping,
        total: appliedCoupon.total,
      }
    }
    const cartOffersFreeShipping =
      items.length > 0 &&
      items.every((item) => {
        const product = getProduct(item.slug)
        return product ? productOffersFreeShipping(product) : false
      })
    const base = calculateOrderTotal(
      subtotal,
      cartOffersFreeShipping ? 0 : SHIPPING_FLAT_INR,
      FREE_SHIPPING_THRESHOLD_INR,
    )
    return { ...base, discount: 0 }
  }, [appliedCoupon, items, subtotal])

  function handleCouponApplied(coupon: AppliedCoupon) {
    setAppliedCoupon(coupon)
    appliedForCartKey.current = items.map((item) => `${item.slug}:${item.quantity}`).join('|')
    idempotencyKey.current =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `ck-${Date.now()}`
    setError(null)
  }

  function handleCouponRemoved() {
    setAppliedCoupon(null)
    appliedForCartKey.current = null
    idempotencyKey.current =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `ck-${Date.now()}`
    setError(null)
  }

  async function handleApplyCoupon(
    code: string,
  ): Promise<{ ok: true; coupon: AppliedCoupon } | { ok: false; error: string }> {
    if (items.length === 0) {
      return { ok: false, error: 'Your cart is empty.' }
    }

    const priced = await revalidatePrices()
    if (!priced.ok || !priced.items || priced.items.length === 0) {
      return { ok: false, error: priced.error ?? 'Unable to refresh prices. Please try again.' }
    }

    const res = await fetch('/api/checkout/apply-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: priced.items.map((item) => ({ slug: item.slug, quantity: item.quantity })),
        couponCode: code,
      }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data.valid) {
      return {
        ok: false,
        error: (data.error as string | undefined) ?? 'Invalid or expired coupon code.',
      }
    }

    const discount = typeof data.discount === 'number' ? data.discount : 0
    if (discount <= 0) {
      return {
        ok: false,
        error:
          (data.error as string | undefined) ?? 'This coupon does not reduce your order total.',
      }
    }

    const coupon: AppliedCoupon = {
      code: data.couponCode as string,
      discount,
      subtotal: data.subtotal as number,
      shipping: data.shipping as number,
      total: data.total as number,
    }

    handleCouponApplied(coupon)
    return { ok: true, coupon }
  }

  useEffect(() => {
    if (!appliedCoupon || !appliedForCartKey.current) return
    const cartKey = items.map((item) => `${item.slug}:${item.quantity}`).join('|')
    if (cartKey !== appliedForCartKey.current) {
      setAppliedCoupon(null)
      appliedForCartKey.current = null
      idempotencyKey.current =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `ck-${Date.now()}`
    }
  }, [appliedCoupon, items])

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
    setError(null)
  }

  function patchShipping(patch: Partial<ShippingFormValues>) {
    setForm((prev) => ({ ...prev, ...patch }))
    setFieldErrors((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(patch) as (keyof ShippingFormValues)[]) {
        delete next[key]
      }
      return next
    })
    setError(null)
  }

  function validateForm(): boolean {
    const customer = checkoutCustomerSchema.safeParse({
      name: form.name,
      email: form.email,
      phone: form.phone,
    })
    const shipping = checkoutShippingSchema.safeParse({
      address: form.address,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      country: form.country,
    })

    const next: FieldErrors = {}
    if (!customer.success) {
      for (const issue of customer.error.issues) {
        const key = issue.path[0] as keyof FormState | undefined
        if (key && !next[key]) next[key] = issue.message
      }
    }
    if (!shipping.success) {
      for (const issue of shipping.error.issues) {
        const key = issue.path[0] as keyof FormState | undefined
        if (key && !next[key]) next[key] = issue.message
      }
    }

    setFieldErrors(next)
    return Object.keys(next).length === 0
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
    if (!validateForm()) {
      setStatus('error')
      setError('Please correct the highlighted fields and try again.')
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

      // Final customer-edited values only — location suggestions never override on submit
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
          ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
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
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start" noValidate>
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
                aria-invalid={Boolean(fieldErrors.name)}
              />
              {fieldErrors.name ? (
                <p className="text-xs text-destructive" role="alert">
                  {fieldErrors.name}
                </p>
              ) : null}
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
                aria-invalid={Boolean(fieldErrors.email)}
              />
              {fieldErrors.email ? (
                <p className="text-xs text-destructive" role="alert">
                  {fieldErrors.email}
                </p>
              ) : null}
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
                aria-invalid={Boolean(fieldErrors.phone)}
              />
              {fieldErrors.phone ? (
                <p className="text-xs text-destructive" role="alert">
                  {fieldErrors.phone}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <ShippingAddressFields
          values={{
            address: form.address,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country,
          }}
          errors={{
            address: fieldErrors.address,
            city: fieldErrors.city,
            state: fieldErrors.state,
            postalCode: fieldErrors.postalCode,
            country: fieldErrors.country,
          }}
          onChange={updateField}
          onPatch={patchShipping}
        />

        <CouponSection
          applied={appliedCoupon}
          onApply={handleApplyCoupon}
          onRemoved={handleCouponRemoved}
        />

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
          {preview.discount > 0 && appliedCoupon ? (
            <div className="flex justify-between text-muted-foreground">
              <span>Coupon ({appliedCoupon.code})</span>
              <span className="text-foreground">-{formatINR(preview.discount)}</span>
            </div>
          ) : null}
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
