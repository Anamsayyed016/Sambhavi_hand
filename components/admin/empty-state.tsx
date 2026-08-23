import { cn } from '@/lib/utils'

export function AdminEmptyState({
  title,
  description,
  action,
  compact,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  compact?: boolean
}) {
  return (
    <div className={cn('text-center', compact ? '' : 'rounded-md border border-border bg-[#faf8f4] px-6 py-16')}>
      <h2 className="font-serif text-2xl text-charcoal">{title}</h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  )
}
