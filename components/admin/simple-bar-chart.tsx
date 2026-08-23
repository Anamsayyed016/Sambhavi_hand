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
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No data yet</p>
  }

  const values = data.map((d) => (metric === 'revenue' ? d.revenue : d.orders))
  const max = Math.max(...values, 1)

  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <div className="flex h-32 items-end gap-0.5">
        {data.map((d) => {
          const v = metric === 'revenue' ? d.revenue : d.orders
          const h = Math.max(4, Math.round((v / max) * 100))
          return (
            <div
              key={d.date}
              className="group relative min-w-0 flex-1"
              title={`${d.date}: ${metric === 'revenue' ? `₹${v}` : v}`}
            >
              <div
                className="w-full rounded-t bg-wine/70 transition-colors group-hover:bg-wine"
                style={{ height: `${h}%` }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
