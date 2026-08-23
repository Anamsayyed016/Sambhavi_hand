import { NextResponse } from 'next/server'
import {
  assertSameOriginMutation,
  clearAdminSessionCookie,
  destroyAdminSessionByToken,
  ADMIN_SESSION_COOKIE,
  adminAuthErrorResponse,
} from '@/lib/admin/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    assertSameOriginMutation(request)

    const jar = await cookies()
    const token = jar.get(ADMIN_SESSION_COOKIE)?.value
    await destroyAdminSessionByToken(token)
    await clearAdminSessionCookie()

    return NextResponse.json({ ok: true })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}
