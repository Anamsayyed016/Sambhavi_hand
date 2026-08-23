import { cn } from '@/lib/utils'
import {
  formatOrderStatusLabel,
  formatPaymentStatusLabel,
} from '@/lib/admin/order-validation'

const orderStatusStyles: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-900',
  CONFIRMED: 'bg-sky-50 text-sky-900',
  PROCESSING: 'bg-indigo-50 text-indigo-900',
  SHIPPED: 'bg-violet-50 text-violet-900',
  DELIVERED: 'bg-emerald-50 text-emerald-900',
  CANCELLED: 'bg-muted text-muted-foreground',
}

const paymentStatusStyles: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-900',
  PAID: 'bg-emerald-50 text-emerald-900',
  FAILED: 'bg-destructive/10 text-destructive',
  REFUNDED: 'bg-muted text-muted-foreground',
}

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded px-2 py-0.5 text-xs font-medium capitalize',
        orderStatusStyles[status] ?? 'bg-muted text-muted-foreground',
      )}
    >
      {formatOrderStatusLabel(status)}
    </span>
  )
}

export function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded px-2 py-0.5 text-xs font-medium capitalize',
        paymentStatusStyles[status] ?? 'bg-muted text-muted-foreground',
      )}
    >
      {formatPaymentStatusLabel(status)}
    </span>
  )
}
