import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export function AdminStatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
}) {
  return (
    <div className="rounded-md border border-border bg-[#faf8f4] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-serif text-3xl text-charcoal">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span className={cn('rounded-md bg-beige/80 p-2 text-wine')}>
          <Icon className="size-4" />
        </span>
      </div>
    </div>
  )
}
