'use client'

type Point = { date: string; revenue: number; orders: number }

export function SimpleBarChart({
  data,
  metric,
  label,
}: {
  data: Point[]
  metric: 'revenue' | 'orders'
  label: string
}) {
  const values = data.map((d) => (metric === 'revenue' ? d.revenue : d.orders))
  const total = values.reduce((sum, v) => sum + v, 0)

  if (data.length === 0 || total === 0) {
    return (
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
        <p className="py-8 text-center text-sm text-muted-foreground">No sales yet</p>
      </div>
    )
  }

  const max = Math.max(...values, 1)

  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <div className="flex h-32 items-end gap-0.5">
        {data.map((d) => {
          const v = metric === 'revenue' ? d.revenue : d.orders
          const h = v === 0 ? 2 : Math.max(4, Math.round((v / max) * 100))
          return (
            <div
              key={d.date}
              className="group relative min-w-0 flex-1"
              title={`${d.date}: ${metric === 'revenue' ? `₹${v}` : v}`}
            >
              <div
                className={`w-full rounded-t transition-colors ${
                  v === 0 ? 'bg-border/60' : 'bg-wine/70 group-hover:bg-wine'
                }`}
                style={{ height: `${h}%` }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
