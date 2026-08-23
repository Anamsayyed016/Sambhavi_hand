import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCustomerByEmail } from '@/lib/admin/customers'
import { formatDate, formatINR } from '@/lib/admin/format'
import { AdminEmptyState } from '@/components/admin/empty-state'
import { PaymentStatusBadge, OrderStatusBadge } from '@/components/admin/order-badges'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ email: string }> }

export default async function CustomerDetailPage({ params }: Params) {
  const { email: raw } = await params
  const email = decodeURIComponent(raw)

  let customer
  try {
    customer = await getCustomerByEmail(email)
  } catch {
    return <AdminEmptyState title="Unable to load customer" />
  }
  if (!customer) notFound()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/admin/customers" className="text-xs text-muted-foreground hover:text-wine">← Customers</Link>
      <h1 className="font-serif text-3xl text-charcoal">{customer.name}</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-md border border-border bg-[#faf8f4] p-5">
          <h2 className="text-sm font-medium uppercase tracking-[0.1em] text-muted-foreground">Profile</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div><dt className="text-muted-foreground">Email</dt><dd>{customer.email}</dd></div>
            <div><dt className="text-muted-foreground">Phone</dt><dd>{customer.phone}</dd></div>
          </dl>
        </section>
        <section className="rounded-md border border-border bg-[#faf8f4] p-5">
          <h2 className="text-sm font-medium uppercase tracking-[0.1em] text-muted-foreground">Summary</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Total orders</dt><dd>{customer.orderCount}</dd></div>
            <div className="flex justify-between"><dt>Total spent</dt><dd>{formatINR(customer.totalSpent)}</dd></div>
            <div className="flex justify-between"><dt>Average order</dt><dd>{formatINR(customer.averageOrderValue)}</dd></div>
            <div className="flex justify-between"><dt>Last order</dt><dd>{formatDate(customer.lastOrderAt)}</dd></div>
          </dl>
        </section>
      </div>

      <section className="rounded-md border border-border bg-[#faf8f4]">
        <div className="border-b border-border px-5 py-3"><h2 className="text-sm font-medium">Order history</h2></div>
        <ul className="divide-y divide-border">
          {customer.orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
              <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-wine">#{o.orderNumber}</Link>
              <span className="text-muted-foreground">{formatDate(o.createdAt)}</span>
              <OrderStatusBadge status={o.status} />
              <PaymentStatusBadge status={o.paymentStatus} />
              <span>{formatINR(o.total)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
