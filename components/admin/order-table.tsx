import Link from 'next/link'
import type { OrderListItem } from '@/lib/admin/orders'
import { formatDate, formatINR } from '@/lib/admin/format'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/admin/order-badges'
import { Button } from '@/components/ui/button'

export function OrderTable({ orders }: { orders: OrderListItem[] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-border bg-[#faf8f4]">
      <table className="min-w-[920px] w-full text-left text-sm">
        <thead className="border-b border-border bg-beige/50 text-xs uppercase tracking-[0.1em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Phone</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Items</th>
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Payment</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((order) => (
            <tr key={order.id} className="align-middle">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-medium text-charcoal hover:text-wine"
                >
                  #{order.orderNumber}
                </Link>
              </td>
              <td className="px-4 py-3">
                <p className="font-medium">{order.customerName}</p>
                <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{order.customerPhone}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
              <td className="px-4 py-3">
                {order._count.items} item{order._count.items === 1 ? '' : 's'}
              </td>
              <td className="px-4 py-3">{formatINR(order.total)}</td>
              <td className="px-4 py-3">
                <PaymentStatusBadge status={order.paymentStatus} />
              </td>
              <td className="px-4 py-3">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/admin/orders/${order.id}`} />}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
