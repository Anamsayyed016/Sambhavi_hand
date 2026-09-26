import { NextResponse } from 'next/server'
import { adminAuthErrorResponse, requireAdminAccess } from '@/lib/admin/auth'
import { getCategoryDetailTemplate } from '@/lib/admin/products'

/**
 * GET /api/admin/products/category-template?category=…
 * Read-only reusable detail fields from the latest ACTIVE product in that category.
 */
export async function GET(request: Request) {
  try {
    await requireAdminAccess()
    const category = new URL(request.url).searchParams.get('category')?.trim() ?? ''

    if (!category) {
      return NextResponse.json({ template: null })
    }

    const template = await getCategoryDetailTemplate(category)
    return NextResponse.json({ template })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}
