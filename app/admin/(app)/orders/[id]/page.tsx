import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOrderById } from '@/lib/admin/orders'
import { formatDate, formatINR } from '@/lib/admin/format'
import { AdminEmptyState } from '@/components/admin/empty-state'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/admin/order-badges'
import { OrderStatusUpdater } from '@/components/admin/order-status-updater'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export default async function AdminOrderDetailPage({ params }: Params) {
  const { id } = await params

  let order
  try {
    order = await getOrderById(id)
  } catch {
    return (
      <AdminEmptyState title="Unable to load order" description="Please try again." />
    )
  }

  if (!order) notFound()

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link href="/admin/orders" className="text-xs text-muted-foreground hover:text-wine">
          ← Orders
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-charcoal">#{order.orderNumber}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>
      </div>

      <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-md border border-border bg-[#faf8f4] p-5">
          <h2 className="text-sm font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Customer
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd>
                <a href={`mailto:${order.customerEmail}`} className="hover:text-wine">
                  {order.customerEmail}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>
                <a href={`tel:${order.customerPhone}`} className="hover:text-wine">
                  {order.customerPhone}
                </a>
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-md border border-border bg-[#faf8f4] p-5">
          <h2 className="text-sm font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Shipping address
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-charcoal">
            {order.shippingAddress}
            <br />
            {order.city}, {order.state} {order.postalCode}
            <br />
            {order.country}
          </p>
        </section>
      </div>

      <section className="rounded-md border border-border bg-[#faf8f4]">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Items
          </h2>
        </div>
        <ul className="divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
              <div className="relative size-16 shrink-0 overflow-hidden rounded bg-beige">
                {item.product?.image ? (
                  <Image
                    src={item.product.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-charcoal">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  SKU {item.product?.sku ?? '—'} · Qty {item.quantity}
                </p>
              </div>
              <div className="text-sm sm:text-right">
                <p>{formatINR(item.price)} each</p>
                <p className="font-medium">{formatINR(item.subtotal)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-md border border-border bg-[#faf8f4] p-5">
          <h2 className="text-sm font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Summary
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatINR(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{formatINR(order.shipping)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-2 font-medium">
              <dt>Total</dt>
              <dd>{formatINR(order.total)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-md border border-border bg-[#faf8f4] p-5">
          <h2 className="text-sm font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Payment
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <PaymentStatusBadge status={order.paymentStatus} />
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Payment reference</dt>
              <dd className="mt-1 font-mono text-xs">
                {order.paymentId?.trim() ? order.paymentId : '—'}
              </dd>
            </div>
            <p className="pt-2 text-xs text-muted-foreground">
              Payment status is read-only until checkout/Razorpay is connected.
            </p>
          </dl>
        </section>
      </div>
    </div>
  )
}
