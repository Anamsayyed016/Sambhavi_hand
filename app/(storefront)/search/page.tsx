import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SearchView } from '@/components/search/search-view'
import { searchStorefrontProducts } from '@/lib/catalog/storefront-search'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search Sambhavi Handloom sarees by name, category, fabric, weave, or collection.',
  robots: { index: false, follow: true },
}

type Props = { searchParams: Promise<{ q?: string; page?: string }> }

export default async function SearchPage({ searchParams }: Props) {
  const { q, page } = await searchParams
  const query = q?.trim() ?? ''
  const pageNum = Math.max(1, Number.parseInt(page ?? '1', 10) || 1)
  const results = query ? await searchStorefrontProducts({ q: query, page: pageNum }) : null

  return (
    <Suspense fallback={<p className="p-12 text-center text-sm text-muted-foreground">Loading search…</p>}>
      <SearchView initialQuery={query} initialResults={results} />
    </Suspense>
  )
}
