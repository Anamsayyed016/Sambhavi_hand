'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/** Public Meta Pixel ID (client-side tracking config — not a secret). */
export const META_PIXEL_ID = '2364359144371066'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: (...args: unknown[]) => void
  }
}

type MetaEventParams = Record<string, string | number | string[] | undefined>

/** Safe fbq wrapper — no-op until Pixel is ready. Does not re-init. */
export function trackMetaEvent(event: string, params?: MetaEventParams) {
  if (typeof window === 'undefined') return
  if (typeof window.fbq !== 'function') return
  if (params) window.fbq('track', event, params)
  else window.fbq('track', event)
}

/** Storefront products are keyed by slug (no separate public product.id). */
export function trackViewContent(product: { slug: string; name: string; price: number }) {
  trackMetaEvent('ViewContent', {
    content_ids: [product.slug],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: 'INR',
  })
}

export function trackAddToCart(
  product: { slug: string; name: string; price: number },
  quantity: number,
) {
  const qty = Math.max(1, quantity)
  trackMetaEvent('AddToCart', {
    content_ids: [product.slug],
    content_name: product.name,
    content_type: 'product',
    value: product.price * qty,
    currency: 'INR',
  })
}

export function trackInitiateCheckout(
  items: Array<{ slug: string; quantity: number; price: number }>,
  subtotal: number,
) {
  if (items.length === 0) return
  const numItems = items.reduce((sum, item) => sum + item.quantity, 0)
  trackMetaEvent('InitiateCheckout', {
    content_ids: items.map((item) => item.slug),
    content_type: 'product',
    num_items: numItems,
    value: subtotal,
    currency: 'INR',
  })
}

const PURCHASE_STORAGE_PREFIX = 'meta_pixel_purchase:'

/**
 * Fires Purchase once per paid order (sessionStorage dedupe by order number).
 * Renders nothing — mount only on the checkout success page when payment is PAID.
 */
export function MetaPurchaseTracker({
  orderNumber,
  paid,
  items,
  value,
}: {
  orderNumber: string
  paid: boolean
  items: Array<{ productSlug: string; quantity: number }>
  value: number
}) {
  const itemsKey = items.map((item) => `${item.productSlug}:${item.quantity}`).join(',')

  useEffect(() => {
    if (!paid || !orderNumber) return

    const key = `${PURCHASE_STORAGE_PREFIX}${orderNumber}`
    try {
      if (sessionStorage.getItem(key)) return
    } catch {
      // sessionStorage unavailable — still attempt a single send below
    }

    const contentIds = items.map((item) => item.productSlug)
    const numItems = items.reduce((sum, item) => sum + item.quantity, 0)
    let cancelled = false
    let attempts = 0

    const trySend = () => {
      if (cancelled) return
      try {
        if (sessionStorage.getItem(key)) return
      } catch {
        // ignore
      }
      if (typeof window.fbq !== 'function') {
        if (attempts++ < 40) window.setTimeout(trySend, 250)
        return
      }
      try {
        sessionStorage.setItem(key, '1')
      } catch {
        // private mode: cannot persist; still send once this mount
      }
      window.fbq('track', 'Purchase', {
        content_ids: contentIds,
        content_type: 'product',
        num_items: numItems,
        value,
        currency: 'INR',
      })
    }

    trySend()
    return () => {
      cancelled = true
    }
  }, [orderNumber, paid, value, itemsKey, items])

  return null
}

/**
 * Site-wide Meta Pixel.
 * - Loads once via next/script (afterInteractive)
 * - Tracks initial PageView in the bootstrap snippet
 * - Tracks subsequent App Router navigations without re-init or render-loop duplicates
 */
export function MetaPixel() {
  const pathname = usePathname()
  const isFirstPath = useRef(true)

  useEffect(() => {
    if (isFirstPath.current) {
      isFirstPath.current = false
      return
    }
    if (typeof window.fbq !== 'function') return
    window.fbq('track', 'PageView')
  }, [pathname])

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');
          `.trim(),
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}
