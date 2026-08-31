import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  DEFAULT_SEARCH_PAGE_SIZE,
  MAX_SUGGESTION_LIMIT,
  searchStorefrontProducts,
} from '@/lib/catalog/storefront-search'

const querySchema = z.object({
  q: z.string().trim().max(120).default(''),
  page: z.coerce.number().int().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(MAX_SUGGESTION_LIMIT).optional(),
})

/** Public storefront product search — database-backed, active products only. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({
    q: searchParams.get('q') ?? '',
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid search query.' }, { status: 400 })
  }

  const { q, page, limit } = parsed.data

  if (!q) {
    return NextResponse.json({
      query: '',
      items: [],
      total: 0,
      page: 1,
      pageSize: DEFAULT_SEARCH_PAGE_SIZE,
      pageCount: 1,
    })
  }

  const result = await searchStorefrontProducts({
    q,
    page: page ?? 1,
    pageSize: limit ?? DEFAULT_SEARCH_PAGE_SIZE,
  })

  return NextResponse.json({
    query: result.query,
    items: result.items.map((product) => ({
      slug: product.slug,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      image: product.image,
      category: product.category,
    })),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    pageCount: result.pageCount,
  })
}
