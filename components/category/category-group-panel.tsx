import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { CategoryGroup } from '@/lib/categories'

export function CategoryGroupPanel({ group }: { group: CategoryGroup }) {
  return (
    <div className="flex flex-col">
      <Link
        href={`/collections/${group.slug}`}
        className="group/title inline-flex items-center gap-2 font-serif text-xl text-foreground transition-colors hover:text-primary md:text-2xl"
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
              className="font-sans text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
