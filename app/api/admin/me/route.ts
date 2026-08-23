import { NextResponse } from 'next/server'
import { adminAuthErrorResponse, requireAdminAccess } from '@/lib/admin/auth'

export async function GET() {
  try {
    const ctx = await requireAdminAccess()
    return NextResponse.json({ admin: ctx.admin })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}
