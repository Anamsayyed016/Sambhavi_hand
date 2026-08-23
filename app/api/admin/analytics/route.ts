import { NextResponse } from 'next/server'
import { adminAuthErrorResponse, requireAdminAccess } from '@/lib/admin/auth'
import {
  getAnalyticsSummary,
  getDailySeries,
  getTopCategoriesAnalytics,
  getTopProductsAnalytics,
  type DateRangeKey,
} from '@/lib/admin/analytics'

export async function GET(request: Request) {
  try {
    await requireAdminAccess()
    const range = (new URL(request.url).searchParams.get('range') as DateRangeKey | null) ?? '30d'
    const [summary, series, topProducts, topCategories] = await Promise.all([
      getAnalyticsSummary(range),
      getDailySeries(range === '7d' ? 7 : range === '90d' ? 90 : 30),
      getTopProductsAnalytics(10),
      getTopCategoriesAnalytics(10),
    ])
    return NextResponse.json({ summary, series, topProducts, topCategories })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}
