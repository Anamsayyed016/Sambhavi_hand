import { NextResponse } from 'next/server'
import { adminAuthErrorResponse, requireAdminAccess } from '@/lib/admin/auth'
import { listCustomers } from '@/lib/admin/customers'

export async function GET(request: Request) {
  try {
    await requireAdminAccess()
    const { searchParams } = new URL(request.url)
    const result = await listCustomers({
      q: searchParams.get('q') ?? undefined,
      page: Number(searchParams.get('page') ?? 1),
    })
    return NextResponse.json(result)
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}
