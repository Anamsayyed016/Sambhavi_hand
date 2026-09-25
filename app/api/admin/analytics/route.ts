import { NextResponse } from 'next/server'
import { adminAuthErrorResponse, requireAdminAccess } from '@/lib/admin/auth'
import {
  getAnalyticsSummary,
  getDailySeriesBetween,
  getTopCategoriesAnalytics,
  getTopProductsAnalytics,
  parseDateRangeKey,
  resolveDateRange,
} from '@/lib/admin/analytics'

export async function GET(request: Request) {
  try {
    await requireAdminAccess()
    const url = new URL(request.url)
    const range = parseDateRangeKey(url.searchParams.get('range'))
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    const { start, end } = resolveDateRange(range, from, to)
    const [summary, series, topProducts, topCategories] = await Promise.all([
      getAnalyticsSummary(range, from, to),
      getDailySeriesBetween(start, end),
      getTopProductsAnalytics(10, range, from, to),
      getTopCategoriesAnalytics(10, range, from, to),
    ])
    return NextResponse.json({ summary, series, topProducts, topCategories })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}
