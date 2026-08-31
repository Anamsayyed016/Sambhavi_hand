'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatINR } from '@/lib/products'

type CartItem = { slug: string; quantity: number }

type AppliedCoupon = {
  code: string
  discount: number
  subtotal: number
  shipping: number
  total: number
}

type CouponSectionProps = {
  items: CartItem[]
  applied: AppliedCoupon | null
  onApplied: (coupon: AppliedCoupon) => void
  onRemoved: () => void
}

export function CouponSection({ items, applied, onApplied, onRemoved }: CouponSectionProps) {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'applying'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function applyCoupon() {
    const code = input.trim()
    if (!code) {
      setError('Enter a coupon code.')
      return
    }
    if (items.length === 0) {
      setError('Your cart is empty.')
      return
    }

    setStatus('applying')
    setError(null)

    try {
      const res = await fetch('/api/checkout/apply-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ slug: item.slug, quantity: item.quantity })),
          couponCode: code,
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data.valid) {
        setError(data.error ?? 'Invalid or expired coupon code.')
        return
      }

      onApplied({
        code: data.couponCode as string,
        discount: data.discount as number,
        subtotal: data.subtotal as number,
        shipping: data.shipping as number,
        total: data.total as number,
      })
      setInput('')
    } catch {
      setError('Unable to apply coupon. Please try again.')
    } finally {
      setStatus('idle')
    }
  }

  function removeCoupon() {
    setInput('')
    setError(null)
    onRemoved()
  }

  if (applied) {
    return (
      <section className="space-y-3 rounded-md border border-border bg-card p-6">
        <h2 className="font-serif text-xl text-foreground">Coupon</h2>
        <div className="rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <p className="font-medium text-foreground">✓ {applied.code} applied</p>
          {applied.discount > 0 ? (
            <p className="mt-1 text-muted-foreground">You saved {formatINR(applied.discount)}</p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-none"
          onClick={removeCoupon}
          disabled={status === 'applying'}
        >
          Remove
        </Button>
      </section>
    )
  }

  return (
    <section className="space-y-3 rounded-md border border-border bg-card p-6">
      <h2 className="font-serif text-xl text-foreground">Have a coupon?</h2>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value.toUpperCase())
            setError(null)
          }}
          placeholder="Enter coupon code"
          className="h-11 flex-1 rounded-md border border-border bg-background px-4 font-sans text-sm uppercase text-foreground placeholder:normal-case placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          aria-invalid={Boolean(error)}
          disabled={status === 'applying'}
        />
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-none px-6 uppercase tracking-luxe"
          onClick={applyCoupon}
          disabled={status === 'applying'}
        >
          {status === 'applying' ? 'Applying...' : 'Apply'}
        </Button>
      </div>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          ✕ {error}
        </p>
      ) : null}
    </section>
  )
}

export type { AppliedCoupon }
