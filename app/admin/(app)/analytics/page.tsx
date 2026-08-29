import {
  getAnalyticsSummary,
  getDailySeries,
  getTopCategoriesAnalytics,
  getTopProductsAnalytics,
} from '@/lib/admin/analytics'
import { formatINR } from '@/lib/admin/format'
import { AdminEmptyState } from '@/components/admin/empty-state'
import { SimpleBarChart } from '@/components/admin/simple-bar-chart'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  let summary, series, topProducts, topCategories
  try {
    ;[summary, series, topProducts, topCategories] = await Promise.all([
      getAnalyticsSummary('30d'),
      getDailySeries(30),
      getTopProductsAnalytics(10),
      getTopCategoriesAnalytics(10),
    ])
  } catch {
    return <AdminEmptyState title="Unable to load analytics" />
  }

  const hasData = summary.orderCount > 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-charcoal">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last 30 days · paid orders only</p>
      </div>

      {!hasData ? (
        <AdminEmptyState title="No analytics data yet" description="Analytics will populate after customers place orders." />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-md border border-border bg-[#faf8f4] p-4"><p className="text-xs uppercase text-muted-foreground">Revenue</p><p className="mt-2 font-serif text-2xl">{formatINR(summary.revenue)}</p></div>
            <div className="rounded-md border border-border bg-[#faf8f4] p-4"><p className="text-xs uppercase text-muted-foreground">Orders</p><p className="mt-2 font-serif text-2xl">{summary.orderCount}</p></div>
            <div className="rounded-md border border-border bg-[#faf8f4] p-4"><p className="text-xs uppercase text-muted-foreground">AOV</p><p className="mt-2 font-serif text-2xl">{formatINR(summary.aov)}</p></div>
            <div className="rounded-md border border-border bg-[#faf8f4] p-4"><p className="text-xs uppercase text-muted-foreground">Customers</p><p className="mt-2 font-serif text-2xl">{summary.customerCount}</p></div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-md border border-border bg-[#faf8f4] p-5">
              <SimpleBarChart data={series} metric="revenue" label="Revenue (30 days)" />
            </section>
            <section className="rounded-md border border-border bg-[#faf8f4] p-5">
              <SimpleBarChart data={series} metric="orders" label="Orders (30 days)" />
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-md border border-border bg-[#faf8f4] p-5">
              <h2 className="text-sm font-medium">Top products</h2>
              <ul className="mt-3 divide-y divide-border text-sm">
                {topProducts.map((p) => (
                  <li key={p.productSlug} className="flex justify-between py-2">
                    <span>{p.productName}</span>
                    <span>{formatINR(p.revenue)}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-md border border-border bg-[#faf8f4] p-5">
              <h2 className="text-sm font-medium">Top categories</h2>
              <ul className="mt-3 divide-y divide-border text-sm">
                {topCategories.map((c) => (
                  <li key={c.category} className="flex justify-between py-2">
                    <span>{c.category}</span>
                    <span>{formatINR(c.revenue)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  )
}
