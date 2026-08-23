import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { createSessionToken, hashSessionToken, verifyPassword } from '@/lib/admin/password'
import { ADMIN_SESSION_COOKIE } from '@/lib/admin/auth-cookie'
import type { SafeAdmin } from '@/lib/admin/types'

export { ADMIN_SESSION_COOKIE } from '@/lib/admin/auth-cookie'
export type { SafeAdmin } from '@/lib/admin/types'

export const ADMIN_SESSION_DAYS = 14

export type AdminAuthContext = {
  admin: SafeAdmin
  sessionId: string
}

export class AdminAuthError extends Error {
  status: number

  constructor(message = 'Admin authentication required', status = 401) {
    super(message)
    this.name = 'AdminAuthError'
    this.status = status
  }
}

function sessionExpiryDate(): Date {
  return new Date(Date.now() + ADMIN_SESSION_DAYS * 24 * 60 * 60 * 1000)
}

function cookieSecure(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function adminSessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  }
}

export async function createAdminSession(adminUserId: string): Promise<{ token: string }> {
  const token = createSessionToken()
  const tokenHash = hashSessionToken(token)
  const expiresAt = sessionExpiryDate()

  await prisma.adminSession.create({
    data: {
      adminUserId,
      tokenHash,
      expiresAt,
    },
  })

  return { token }
}

export async function destroyAdminSessionByToken(token: string | undefined | null): Promise<void> {
  if (!token) return
  const tokenHash = hashSessionToken(token)
  await prisma.adminSession.deleteMany({ where: { tokenHash } })
}

export async function setAdminSessionCookie(token: string): Promise<void> {
  const jar = await cookies()
  jar.set(
    ADMIN_SESSION_COOKIE,
    token,
    adminSessionCookieOptions(ADMIN_SESSION_DAYS * 24 * 60 * 60),
  )
}

export async function clearAdminSessionCookie(): Promise<void> {
  const jar = await cookies()
  jar.set(ADMIN_SESSION_COOKIE, '', {
    ...adminSessionCookieOptions(0),
    maxAge: 0,
  })
}

async function readSessionToken(): Promise<string | undefined> {
  const jar = await cookies()
  return jar.get(ADMIN_SESSION_COOKIE)?.value
}

/**
 * Validate cookie → session → active admin.
 * Does not return passwordHash.
 */
export async function getCurrentAdmin(): Promise<AdminAuthContext | null> {
  const token = await readSessionToken()
  if (!token) return null

  const tokenHash = hashSessionToken(token)
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: {
      adminUser: {
        select: {
          id: true,
          email: true,
          name: true,
          active: true,
        },
      },
    },
  })

  if (!session) return null

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => undefined)
    return null
  }

  if (!session.adminUser.active) {
    await prisma.adminSession.deleteMany({ where: { adminUserId: session.adminUser.id } })
    return null
  }

  return {
    sessionId: session.id,
    admin: {
      id: session.adminUser.id,
      email: session.adminUser.email,
      name: session.adminUser.name,
      role: 'admin',
    },
  }
}

/** @deprecated Prefer getCurrentAdmin — kept for Phase 1 call sites. */
export async function getAdminSession(): Promise<AdminAuthContext | null> {
  return getCurrentAdmin()
}

export async function requireAdminAccess(): Promise<AdminAuthContext> {
  const ctx = await getCurrentAdmin()
  if (!ctx) {
    throw new AdminAuthError('Admin authentication required', 401)
  }
  return ctx
}

export async function assertAdminCanWrite(): Promise<AdminAuthContext> {
  return requireAdminAccess()
}

export function adminAuthErrorResponse(error: unknown): Response {
  if (error instanceof AdminAuthError) {
    return Response.json({ error: error.message }, { status: error.status })
  }
  console.error('[admin]', error instanceof Error ? error.message : 'unknown error')
  return Response.json({ error: 'Internal server error' }, { status: 500 })
}

/**
 * SameSite=Lax cookies block most cross-site POSTs.
 * Extra Origin/Referer check for state-changing admin APIs.
 */
export function assertSameOriginMutation(request: Request): void {
  const method = request.method.toUpperCase()
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')

  if (!host) {
    throw new AdminAuthError('Invalid request origin', 403)
  }

  const expected = [`https://${host}`, `http://${host}`]

  if (origin) {
    if (!expected.some((value) => origin === value)) {
      throw new AdminAuthError('Invalid request origin', 403)
    }
    return
  }

  if (referer) {
    if (!expected.some((value) => referer.startsWith(`${value}/`) || referer === value)) {
      throw new AdminAuthError('Invalid request origin', 403)
    }
    return
  }

  // Non-browser clients (curl) may omit Origin/Referer — allow only with valid session
  // which is still required by requireAdminAccess. Browser CSRF typically sends Origin.
}

export async function authenticateAdminCredentials(
  email: string,
  password: string,
): Promise<{ ok: true; adminId: string } | { ok: false; reason: 'invalid' | 'inactive' }> {
  const normalized = email.trim().toLowerCase()
  const admin = await prisma.adminUser.findUnique({
    where: { email: normalized },
    select: { id: true, passwordHash: true, active: true },
  })

  // Constant-ish work even when user missing (valid dummy bcrypt hash)
  const hash =
    admin?.passwordHash ?? '$2b$12$CvGW0xExgBEFbI5R.1Ro0.xAOXN2LIZjvqT1eNnNF7zbF00.ET8Je'
  const matches = await verifyPassword(password, hash)

  if (!admin || !matches) {
    return { ok: false, reason: 'invalid' }
  }

  if (!admin.active) {
    return { ok: false, reason: 'inactive' }
  }

  return { ok: true, adminId: admin.id }
}
