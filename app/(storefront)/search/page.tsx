import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SearchView } from '@/components/search/search-view'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search Sambhavi Handloom sarees by name, category, fabric, weave, or collection.',
  robots: { index: false, follow: true },
}

type Props = { searchParams: Promise<{ q?: string }> }

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  return (
    <Suspense fallback={<p className="p-12 text-center text-sm text-muted-foreground">Loading search…</p>}>
      <SearchView initialQuery={q ?? ''} />
    </Suspense>
  )
}
