import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { CategoryGroup } from '@/lib/categories'
import { cn } from '@/lib/utils'

export function CategoryGroupPanel({ group }: { group: CategoryGroup }) {
  return (
    <div className="flex flex-col">
      <Link
        href={`/collections/${group.slug}`}
        className={cn(
          'group/title inline-flex items-center gap-2 font-serif uppercase transition-colors hover:text-primary',
          group.primary && 'text-xl tracking-[0.12em] text-primary md:text-2xl',
          !group.primary && 'text-xl text-foreground md:text-2xl',
        )}
      >
        {group.name}
        <ArrowRight
          className="size-4 translate-x-0 opacity-0 transition-all duration-300 group-hover/title:translate-x-0.5 group-hover/title:opacity-100"
          strokeWidth={1.5}
          aria-hidden
        />
      </Link>
      <ul className="mt-4 flex flex-col gap-2.5">
        {group.categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/collections/${category.slug}`}
              className={cn(
                'font-sans transition-colors hover:text-primary',
                category.prominent
                  ? 'text-[0.96875rem] font-normal text-foreground/90'
                  : 'text-[0.9375rem] font-light text-muted-foreground',
              )}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
