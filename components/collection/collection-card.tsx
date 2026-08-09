import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Collection } from '@/lib/content'

export function CollectionCard({
  collection,
  className,
  priority = false,
}: {
  collection: Collection
  className?: string
  priority?: boolean
}) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className={cn(
        'group relative flex aspect-4/5 items-end overflow-hidden rounded-sm bg-muted',
        className,
      )}
    >
      <Image
        src={collection.image || '/placeholder.svg'}
        alt={collection.name}
        fill
        sizes="(max-width: 768px) 50vw, 33vw"
        priority={priority}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-transparent transition-opacity duration-500 group-hover:from-charcoal/90" />
      <div className="relative z-10 flex w-full flex-col gap-1 p-6">
        <h3 className="font-serif text-2xl text-ivory">{collection.name}</h3>
        <p className="max-w-xs text-sm text-ivory/75">{collection.description}</p>
        <span className="mt-2 flex items-center gap-2 text-xs font-medium uppercase tracking-luxe text-accent transition-all duration-300 group-hover:gap-3">
          Explore Collection
          <ArrowRight className="size-4" strokeWidth={1.5} />
        </span>
      </div>
    </Link>
  )
}
