import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  assertSameOriginMutation,
  authenticateAdminCredentials,
  createAdminSession,
  setAdminSessionCookie,
  adminAuthErrorResponse,
  AdminAuthError,
} from '@/lib/admin/auth'
import { checkLoginRateLimit, clearLoginRateLimit, getClientIp } from '@/lib/admin/rate-limit'

const loginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(200),
})

export async function POST(request: Request) {
  try {
    assertSameOriginMutation(request)

    const ip = getClientIp(request)
    const limit = checkLoginRateLimit(`login:${ip}`)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(limit.retryAfterSeconds) },
        },
      )
    }

    const body = await request.json().catch(() => null)
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const result = await authenticateAdminCredentials(parsed.data.email, parsed.data.password)
    if (!result.ok) {
      // Generic message — do not reveal whether email exists or account inactive
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    clearLoginRateLimit(`login:${ip}`)

    const { token } = await createAdminSession(result.adminId)
    await setAdminSessionCookie(token)

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return adminAuthErrorResponse(error)
    }
    console.error('[admin/login]', error instanceof Error ? error.message : 'error')
    return NextResponse.json({ error: 'Unable to sign in. Please try again.' }, { status: 500 })
  }
}
