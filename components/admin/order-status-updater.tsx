'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { OrderStatus } from '@prisma/client'
import { formatOrderStatusLabel } from '@/lib/admin/order-validation'
import { Button } from '@/components/ui/button'

export function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: OrderStatus
}) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function save() {
    if (status === currentStatus) return
    setMessage(null)
    setError(null)

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data.error ?? 'Unable to update status.')
          return
        }
        setMessage('Status updated')
        router.refresh()
      } catch {
        setError('Unable to update status.')
      }
    })
  }

  return (
    <div className="space-y-3 rounded-md border border-border bg-[#faf8f4] p-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
          Fulfillment status
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-ring sm:max-w-xs"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as OrderStatus)
              setMessage(null)
              setError(null)
            }}
            disabled={isPending}
          >
            {Object.values(OrderStatus).map((s) => (
              <option key={s} value={s}>
                {formatOrderStatusLabel(s)}
              </option>
            ))}
          </select>
          <Button
            type="button"
            onClick={save}
            disabled={isPending || status === currentStatus}
          >
            {isPending ? 'Saving…' : 'Update status'}
          </Button>
        </div>
      </div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
