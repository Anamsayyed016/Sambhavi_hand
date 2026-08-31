import { cn } from '@/lib/utils'
import { Reveal } from '@/components/motion/reveal'

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  className?: string
}) {
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow ? (
        <span className="font-sans text-xs font-semibold uppercase tracking-luxe text-accent">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-editorial-serif text-balance text-[clamp(1.75rem,2.5vw+1rem,3rem)] leading-tight text-foreground">
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            'text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base',
            align === 'center' && 'max-w-xl',
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  )
}
