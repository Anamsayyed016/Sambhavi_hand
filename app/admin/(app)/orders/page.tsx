import Link from 'next/link'
import { OrderStatus, PaymentStatus } from '@prisma/client'
import { getOrderStats, listOrders } from '@/lib/admin/orders'
import { AdminEmptyState } from '@/components/admin/empty-state'
import { AdminStatCard } from '@/components/admin/stat-card'
import { OrderFilters } from '@/components/admin/order-filters'
import { OrderTable } from '@/components/admin/order-table'
import { Package, Clock, Cog, Truck, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const q = one(sp.q) ?? ''
  const status = (one(sp.status) as OrderStatus | 'all' | undefined) ?? 'all'
  const paymentStatus =
    (one(sp.paymentStatus) as PaymentStatus | 'all' | undefined) ?? 'all'
  const sort = (one(sp.sort) as 'newest' | 'oldest' | undefined) ?? 'newest'
  const page = Number(one(sp.page) ?? 1)

  let result
  let stats
  let loadError: string | null = null

  try {
    ;[result, stats] = await Promise.all([
      listOrders({ q, status, paymentStatus, sort, page, pageSize: 20 }),
      getOrderStats(),
    ])
  } catch {
    loadError = 'Unable to load orders. Please try again.'
  }

  if (loadError || !result || !stats) {
    return <AdminEmptyState title="Unable to load orders" description={loadError ?? undefined} />
  }

  const queryParams = {
    ...(q ? { q } : {}),
    ...(status !== 'all' ? { status } : {}),
    ...(paymentStatus !== 'all' ? { paymentStatus } : {}),
    ...(sort !== 'newest' ? { sort } : {}),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-charcoal">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage customer orders and fulfillment.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="Total Orders" value={String(stats.total)} icon={Package} />
        <AdminStatCard label="Pending" value={String(stats.pending)} icon={Clock} />
        <AdminStatCard label="Processing" value={String(stats.processing)} icon={Cog} />
        <AdminStatCard label="Shipped" value={String(stats.shipped)} icon={Truck} />
        <AdminStatCard label="Delivered" value={String(stats.delivered)} icon={CheckCircle2} />
      </div>

      <OrderFilters q={q} status={status} paymentStatus={paymentStatus} sort={sort} />

      {result.total === 0 && !q && status === 'all' && paymentStatus === 'all' ? (
        <AdminEmptyState
          title="No orders yet"
          description="Orders will appear here once customers complete checkout."
        />
      ) : result.items.length === 0 ? (
        <AdminEmptyState
          title="No matching orders"
          description="Try adjusting search or filters."
        />
      ) : (
        <>
          <OrderTable orders={result.items} />
          {result.pageCount > 1 ? (
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Page {result.page} of {result.pageCount}
              </p>
              <div className="flex gap-2">
                {result.page > 1 ? (
                  <Link
                    href={`/admin/orders?${new URLSearchParams({
                      ...queryParams,
                      page: String(result.page - 1),
                    }).toString()}`}
                    className="rounded-md border border-border bg-white px-3 py-1.5 hover:bg-beige/60"
                  >
                    Previous
                  </Link>
                ) : null}
                {result.page < result.pageCount ? (
                  <Link
                    href={`/admin/orders?${new URLSearchParams({
                      ...queryParams,
                      page: String(result.page + 1),
                    }).toString()}`}
                    className="rounded-md border border-border bg-white px-3 py-1.5 hover:bg-beige/60"
                  >
                    Next
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
