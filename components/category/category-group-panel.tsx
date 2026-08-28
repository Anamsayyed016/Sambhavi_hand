import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { isStandaloneCategoryGroup, type CategoryGroup } from '@/lib/categories'
import { cn } from '@/lib/utils'

export function CategoryGroupPanel({ group }: { group: CategoryGroup }) {
  const standalone = isStandaloneCategoryGroup(group)

  return (
    <div className="flex flex-col">
      <Link
        href={`/collections/${group.slug}`}
        className={cn(
          'group/title inline-flex items-center gap-2 font-serif uppercase transition-colors hover:text-primary',
          group.featured && 'text-lg tracking-[0.14em] text-primary md:text-xl',
          group.primary && 'text-xl tracking-[0.12em] text-primary md:text-2xl',
          !group.featured && !group.primary && 'text-xl text-foreground md:text-2xl',
        )}
      >
        {group.name}
        <ArrowRight
          className="size-4 translate-x-0 opacity-0 transition-all duration-300 group-hover/title:translate-x-0.5 group-hover/title:opacity-100"
          strokeWidth={1.5}
          aria-hidden
        />
      </Link>
      {!standalone ? (
        <ul className="mt-4 flex flex-col gap-2.5">
          {group.categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/collections/${category.slug}`}
                className="font-sans text-[0.9375rem] font-light text-muted-foreground transition-colors hover:text-primary"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
