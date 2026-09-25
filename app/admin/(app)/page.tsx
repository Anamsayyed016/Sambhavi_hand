import Link from 'next/link'
import { Package, Plus, ShoppingBag, AlertTriangle, IndianRupee, Users } from 'lucide-react'
import {
  getDashboardStats,
  getDashboardCharts,
  getLowStockProducts,
  getRecentOrders,
  getTopProducts,
  getRangePaidStats,
} from '@/lib/admin/dashboard'
import { parseDateRangeKey } from '@/lib/admin/analytics'
import { formatDate, formatINR } from '@/lib/admin/format'
import { AdminEmptyState } from '@/components/admin/empty-state'
import { AdminStatCard } from '@/components/admin/stat-card'
import { SimpleBarChart } from '@/components/admin/simple-bar-chart'
import { DashboardDateFilters } from '@/components/admin/dashboard-date-filters'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>
}) {
  const sp = await searchParams
  const range = parseDateRangeKey(sp.range)
  const from = sp.from ?? undefined
  const to = sp.to ?? undefined

  let stats
  let recentOrders
  let topProducts
  let lowStock
  let chartData
  let rangeStats
  let loadError: string | null = null

  try {
    ;[stats, recentOrders, topProducts, lowStock, chartData, rangeStats] = await Promise.all([
      getDashboardStats(),
      getRecentOrders(5),
      getTopProducts(5),
      getLowStockProducts(8),
      getDashboardCharts(range, from, to),
      getRangePaidStats(range, from, to),
    ])
  } catch {
    loadError = 'Unable to load data'
  }

  if (loadError || !stats || !rangeStats) {
    return (
      <AdminEmptyState
        title="Unable to load data"
        description={loadError ?? 'Please try again.'}
      />
    )
  }

  const salesPeriods = [
    { label: 'Today', revenue: stats.salesToday, orders: stats.ordersToday },
    { label: 'Last 7 days', revenue: stats.sales7d, orders: stats.orders7d },
    { label: 'Last 30 days', revenue: stats.sales30d, orders: stats.orders30d },
    { label: 'This month', revenue: stats.salesMonth, orders: null },
    { label: 'This year', revenue: stats.salesYear, orders: null },
  ]

  const orderStatuses = [
    { label: 'Pending', count: stats.pendingOrders },
    { label: 'Processing', count: stats.processingOrders },
    { label: 'Shipped', count: stats.shippedOrders },
    { label: 'Delivered', count: stats.deliveredOrders },
  ]

  const rangeHasSales = rangeStats.orders > 0

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Catalog and commerce overview for Sambhavi Handloom.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-wine px-3 py-2 text-sm text-primary-foreground hover:bg-wine/90"
          >
            <Plus className="size-4" />
            Add Product
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm hover:bg-beige/60"
          >
            View Orders
          </Link>
        </div>
      </div>

      <section className="rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Date range
        </h2>
        <div className="mt-3">
          <DashboardDateFilters range={range} from={from} to={to} />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded border border-border/60 bg-white/60 px-3 py-3">
            <p className="text-xs text-muted-foreground">Revenue · {rangeStats.label}</p>
            <p className="mt-1 font-serif text-2xl">
              {rangeHasSales ? formatINR(rangeStats.revenue) : 'No data yet'}
            </p>
          </div>
          <div className="rounded border border-border/60 bg-white/60 px-3 py-3">
            <p className="text-xs text-muted-foreground">Paid orders · {rangeStats.label}</p>
            <p className="mt-1 font-serif text-2xl">
              {rangeHasSales ? rangeStats.orders : 'No data yet'}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard
          label="All-time revenue"
          value={stats.hasPaidSales ? formatINR(stats.paidRevenue) : 'No data yet'}
          hint={stats.hasPaidSales ? 'Paid orders' : 'No sales yet'}
          icon={IndianRupee}
        />
        <AdminStatCard
          label="Orders"
          value={stats.hasOrders ? String(stats.orderCount) : 'No data yet'}
          hint={stats.hasOrders ? `${stats.paidOrderCount} paid` : 'No orders yet'}
          icon={ShoppingBag}
        />
        <AdminStatCard
          label="Products"
          value={stats.productCount > 0 ? String(stats.productCount) : 'No data yet'}
          hint={`${stats.activeProductCount} active`}
          icon={Package}
        />
        <AdminStatCard
          label="Customers"
          value={stats.customerCount > 0 ? String(stats.customerCount) : 'No data yet'}
          hint={stats.customerCount > 0 ? 'Unique paid buyers' : 'No customers yet'}
          icon={Users}
        />
        <AdminStatCard
          label="Low stock"
          value={String(stats.lowStockCount)}
          hint={stats.lowStockCount > 0 ? 'Active products needing attention' : 'No low-stock products'}
          icon={AlertTriangle}
        />
      </div>

      <section className="rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Sales overview
        </h2>
        {stats.hasPaidSales ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {salesPeriods.map((p) => (
              <div key={p.label} className="rounded border border-border/60 bg-white/60 px-3 py-2">
                <p className="text-xs text-muted-foreground">{p.label}</p>
                <p className="mt-1 font-medium">{formatINR(p.revenue)}</p>
                {p.orders != null ? (
                  <p className="text-xs text-muted-foreground">{p.orders} order{p.orders === 1 ? '' : 's'}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No data yet</p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border border-border bg-[#faf8f4] p-5">
          {chartData.length > 0 && rangeHasSales ? (
            <SimpleBarChart
              data={chartData}
              metric="revenue"
              label={`Revenue · ${rangeStats.label}`}
            />
          ) : (
            <AdminEmptyState title="No data yet" description="Revenue chart will appear after paid orders in this range." compact />
          )}
        </section>
        <section className="rounded-md border border-border bg-[#faf8f4] p-5">
          {chartData.length > 0 && rangeHasSales ? (
            <SimpleBarChart
              data={chartData}
              metric="orders"
              label={`Orders · ${rangeStats.label}`}
            />
          ) : (
            <AdminEmptyState title="No data yet" description="Orders chart will appear after paid orders in this range." compact />
          )}
        </section>
      </div>

      <section className="rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Order status
        </h2>
        {stats.hasOrders ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {orderStatuses.map((s) => (
              <div key={s.label} className="rounded border border-border/60 bg-white/60 px-3 py-2">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-1 font-serif text-xl">{s.count}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No data yet</p>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-md border border-border bg-[#faf8f4]">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-medium">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs text-wine hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="px-5 py-10">
              <AdminEmptyState title="No data yet" description="Orders will appear here when customers check out." compact />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div>
                    <Link href={`/admin/orders/${order.id}`} className="font-medium hover:text-wine">
                      #{order.orderNumber}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {order.customerName} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>{formatINR(order.total)}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.paymentStatus} · {order.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-md border border-border bg-[#faf8f4]">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-medium">Top selling products</h2>
          </div>
          {topProducts.length === 0 ? (
            <div className="px-5 py-10">
              <AdminEmptyState
                title="No data yet"
                description="Top products are ranked from real order items once orders exist."
                compact
              />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {topProducts.map((p) => (
                <li key={`${p.productSlug}-${p.productName}`} className="flex justify-between gap-3 px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium">{p.productName}</p>
                    <p className="text-xs text-muted-foreground">{p.unitsSold} sold</p>
                  </div>
                  <p>{formatINR(p.revenue)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-md border border-border bg-[#faf8f4]">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-medium">Low stock products</h2>
          <Link href="/admin/products?availability=LOW_STOCK" className="text-xs text-wine hover:underline">
            View products
          </Link>
        </div>
        {lowStock.length === 0 ? (
          <div className="px-5 py-10">
            <AdminEmptyState title="No data yet" description="No active products are below the low-stock threshold." compact />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {lowStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <div className="min-w-0">
                  <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-wine">
                    {p.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{p.sku}</p>
                </div>
                <p className="shrink-0 text-wine">{p.stock} left</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
