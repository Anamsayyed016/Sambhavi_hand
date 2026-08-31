import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Check, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getPublicOrderByNumber } from '@/lib/checkout/create-order'
import { formatDate } from '@/lib/admin/format'
import { formatINR } from '@/lib/products'

export const metadata: Metadata = {
  title: 'Order confirmed',
  robots: { index: false, follow: false },
}

type Params = { params: Promise<{ orderNumber: string }> }

export default async function CheckoutSuccessPage({ params }: Params) {
  const { orderNumber: raw } = await params
  const orderNumber = decodeURIComponent(raw)

  const order = await getPublicOrderByNumber(orderNumber).catch(() => null)
  if (!order) notFound()

  const paid = order.paymentStatus === 'PAID'

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-8 md:py-16">
      <div className="rounded-md border border-border bg-card p-8 md:p-10">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
            {paid ? (
              <Check className="size-6" strokeWidth={2} aria-hidden />
            ) : (
              <Clock className="size-6" strokeWidth={2} aria-hidden />
            )}
          </span>
          <h1 className="mt-6 font-serif text-3xl text-foreground">
            {paid ? 'Order confirmed' : 'Payment pending'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {paid
              ? `Thank you, ${order.customerName}. Your order has been successfully placed.`
              : `Thank you, ${order.customerName}. We have received your order and are waiting for payment confirmation.`}
          </p>
        </div>

        <dl className="mt-8 space-y-3 rounded-md border border-border bg-background p-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Order number</dt>
            <dd className="font-medium">#{order.orderNumber}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Email</dt>
            <dd>{order.customerEmail}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Phone</dt>
            <dd>{order.customerPhone}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Date</dt>
            <dd>{formatDate(order.createdAt)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Payment</dt>
            <dd className="font-medium">{paid ? 'Paid' : 'Pending'}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-3 font-serif text-lg">
            <dt>Total</dt>
            <dd>{formatINR(order.total)}</dd>
          </div>
        </dl>

        <div className="mt-8">
          <h2 className="font-serif text-lg text-foreground">Delivery address</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/85">
            {order.shippingAddress}
            <br />
            {order.city}, {order.state} {order.postalCode}
            <br />
            {order.country}
          </p>
        </div>

        <div className="mt-8">
          <h2 className="font-serif text-lg text-foreground">Order summary</h2>
          <ul className="mt-4 divide-y divide-border">
            {order.items.map((item) => {
              const imageSrc = item.productImage || item.product?.image
              return (
                <li key={`${item.productSlug}-${item.quantity}`} className="flex gap-3 py-4">
                  <div className="relative aspect-3/4 w-14 shrink-0 overflow-hidden rounded-sm bg-muted">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-sm">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty {item.quantity} · {formatINR(item.price)} each
                    </p>
                  </div>
                  <p className="text-sm">{formatINR(item.subtotal)}</p>
                </li>
              )
            })}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatINR(order.subtotal)}</dd>
            </div>
            {order.discount > 0 ? (
              <>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Coupon</dt>
                  <dd>{order.couponCode}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Discount</dt>
                  <dd>-{formatINR(order.discount)}</dd>
                </div>
              </>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{order.shipping === 0 ? 'Free' : formatINR(order.shipping)}</dd>
            </div>
            <div className="flex justify-between gap-4 font-medium">
              <dt>Total</dt>
              <dd>{formatINR(order.total)}</dd>
            </div>
          </dl>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
          {paid
            ? `Your order is confirmed. Status: ${order.status.toLowerCase()}.`
            : 'Payment has not been confirmed yet. If you completed checkout, please wait a moment and refresh this page. If you closed the payment window, return to checkout to try again.'}
        </p>

        <div className="mt-8 flex justify-center">
          <Button className="rounded-none" render={<Link href="/shop" />}>
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  )
}
