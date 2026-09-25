import {
  getAnalyticsSummary,
  getDailySeriesBetween,
  getTopCategoriesAnalytics,
  getTopProductsAnalytics,
  parseDateRangeKey,
  resolveDateRange,
} from '@/lib/admin/analytics'
import { formatINR } from '@/lib/admin/format'
import { AdminEmptyState } from '@/components/admin/empty-state'
import { SimpleBarChart } from '@/components/admin/simple-bar-chart'
import { DashboardDateFilters } from '@/components/admin/dashboard-date-filters'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>
}) {
  const sp = await searchParams
  const range = parseDateRangeKey(sp.range)
  const from = sp.from ?? undefined
  const to = sp.to ?? undefined
  const { start, end, label } = resolveDateRange(range, from, to)

  let summary, series, topProducts, topCategories
  try {
    ;[summary, series, topProducts, topCategories] = await Promise.all([
      getAnalyticsSummary(range, from, to),
      getDailySeriesBetween(start, end),
      getTopProductsAnalytics(10, range, from, to),
      getTopCategoriesAnalytics(10, range, from, to),
    ])
  } catch {
    return <AdminEmptyState title="Unable to load data" description="Please try again." />
  }

  const hasData = summary.orderCount > 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-charcoal">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {label} · paid orders only
        </p>
      </div>

      <DashboardDateFilters range={range} from={from} to={to} basePath="/admin/analytics" />

      {!hasData ? (
        <AdminEmptyState
          title="No data yet"
          description="Analytics will populate after customers place paid orders in this range."
        />
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
              <SimpleBarChart data={series} metric="revenue" label={`Revenue · ${label}`} />
            </section>
            <section className="rounded-md border border-border bg-[#faf8f4] p-5">
              <SimpleBarChart data={series} metric="orders" label={`Orders · ${label}`} />
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-md border border-border bg-[#faf8f4] p-5">
              <h2 className="text-sm font-medium">Top products</h2>
              {topProducts.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No data yet</p>
              ) : (
                <ul className="mt-3 divide-y divide-border text-sm">
                  {topProducts.map((p) => (
                    <li key={p.productSlug} className="flex justify-between py-2">
                      <span>{p.productName}</span>
                      <span>{formatINR(p.revenue)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="rounded-md border border-border bg-[#faf8f4] p-5">
              <h2 className="text-sm font-medium">Top categories</h2>
              {topCategories.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No data yet</p>
              ) : (
                <ul className="mt-3 divide-y divide-border text-sm">
                  {topCategories.map((c) => (
                    <li key={c.category} className="flex justify-between py-2">
                      <span>{c.category}</span>
                      <span>{formatINR(c.revenue)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  )
}
