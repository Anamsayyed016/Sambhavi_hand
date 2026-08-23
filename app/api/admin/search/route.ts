import { NextResponse } from 'next/server'
import { adminAuthErrorResponse, requireAdminAccess } from '@/lib/admin/auth'
import { adminSearch } from '@/lib/admin/search'

export async function GET(request: Request) {
  try {
    await requireAdminAccess()
    const q = new URL(request.url).searchParams.get('q') ?? ''
    const results = await adminSearch(q)
    return NextResponse.json(results)
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}
