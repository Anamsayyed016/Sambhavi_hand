'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-provider'
import { calculateOrderTotal } from '@/lib/checkout/shipping'
import { formatINR } from '@/lib/products'

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
  const { items, subtotal, clearCart } = useCart()
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

  const preview = useMemo(() => calculateOrderTotal(subtotal), [subtotal])

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) {
      setError('Your cart is empty.')
      return
    }

    setStatus('submitting')
    setError(null)

    try {
      const res = await fetch('/api/checkout', {
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
          items: items.map((item) => ({ slug: item.slug, quantity: item.quantity })),
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setStatus('error')
        setError(data.error ?? 'Unable to place your order. Please try again.')
        return
      }

      clearCart()
      router.push(`/checkout/success/${encodeURIComponent(data.orderNumber)}`)
    } catch {
      setStatus('error')
      setError('Unable to place your order. Please try again.')
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
            Complete your details below. Online payment will be added in a future update — your
            order is saved with payment pending.
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
          {status === 'submitting' ? 'Placing order…' : 'Place Order'}
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
          Final amounts are confirmed on the server when you place your order. Payment is not
          collected in this step.
        </p>
        <Button
          type="submit"
          disabled={status === 'submitting'}
          className="hidden h-12 w-full rounded-none bg-primary text-sm uppercase tracking-luxe text-primary-foreground hover:bg-primary/90 lg:inline-flex"
          size="lg"
        >
          {status === 'submitting' ? 'Placing order…' : 'Place Order'}
        </Button>
      </aside>
    </form>
  )
}
