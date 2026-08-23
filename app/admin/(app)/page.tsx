import Link from 'next/link'
import { Package, Plus, ShoppingBag, AlertTriangle, IndianRupee } from 'lucide-react'
import {
  getDashboardStats,
  getLowStockProducts,
  getRecentOrders,
  getTopProducts,
} from '@/lib/admin/dashboard'
import { formatDate, formatINR } from '@/lib/admin/format'
import { AdminEmptyState } from '@/components/admin/empty-state'
import { AdminStatCard } from '@/components/admin/stat-card'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  let stats
  let recentOrders
  let topProducts
  let lowStock
  let loadError: string | null = null

  try {
    ;[stats, recentOrders, topProducts, lowStock] = await Promise.all([
      getDashboardStats(),
      getRecentOrders(5),
      getTopProducts(5),
      getLowStockProducts(8),
    ])
  } catch {
    loadError = 'Unable to load dashboard. Please try again.'
  }

  if (loadError || !stats) {
    return (
      <AdminEmptyState
        title="Unable to load dashboard"
        description={loadError ?? 'Please try again.'}
      />
    )
  }

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
            href="/admin/products"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm hover:bg-beige/60"
          >
            Manage Products
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Revenue"
          value={stats.hasOrders ? formatINR(stats.revenue) : '—'}
          hint={stats.hasOrders ? 'Paid orders only' : 'No orders yet'}
          icon={IndianRupee}
        />
        <AdminStatCard
          label="Orders"
          value={stats.hasOrders ? String(stats.orderCount) : '—'}
          hint={stats.hasOrders ? 'All time' : 'No orders yet'}
          icon={ShoppingBag}
        />
        <AdminStatCard
          label="Products"
          value={String(stats.productCount)}
          hint={`${stats.activeProductCount} active`}
          icon={Package}
        />
        <AdminStatCard
          label="Low stock"
          value={String(stats.lowStockCount)}
          hint="Active products needing attention"
          icon={AlertTriangle}
        />
      </div>

      <section className="rounded-md border border-border bg-[#faf8f4] p-5">
        <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Sales overview
        </h2>
        {stats.hasOrders ? (
          <p className="mt-3 text-sm text-charcoal">
            {stats.orderCount} order{stats.orderCount === 1 ? '' : 's'} · {formatINR(stats.revenue)}{' '}
            paid revenue
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No orders yet. Sales charts will appear here once checkout is live.
          </p>
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
              <AdminEmptyState title="No orders yet" description="Orders will appear here when customers check out." compact />
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
                    <p className="text-xs text-muted-foreground">{order.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-md border border-border bg-[#faf8f4]">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-medium">Top products</h2>
          </div>
          {topProducts.length === 0 ? (
            <div className="px-5 py-10">
              <AdminEmptyState
                title="No sales data yet"
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
          <h2 className="text-sm font-medium">Low stock</h2>
          <Link href="/admin/products?availability=LOW_STOCK" className="text-xs text-wine hover:underline">
            View products
          </Link>
        </div>
        {lowStock.length === 0 ? (
          <div className="px-5 py-10">
            <AdminEmptyState title="Stock looks healthy" description="No active products are below the low-stock threshold." compact />
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

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/products/new"
            className="rounded-md border border-border bg-white px-3 py-2 text-sm hover:bg-beige/60"
          >
            Add Product
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-md border border-border bg-white px-3 py-2 text-sm hover:bg-beige/60"
          >
            View Orders
          </Link>
          <Link
            href="/admin/products"
            className="rounded-md border border-border bg-white px-3 py-2 text-sm hover:bg-beige/60"
          >
            Manage Products
          </Link>
        </div>
      </section>
    </div>
  )
}
