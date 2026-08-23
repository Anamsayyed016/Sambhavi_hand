/** Edge-safe cookie helpers (no Prisma / Node crypto). */

export const ADMIN_SESSION_COOKIE = 'sambhavi_admin_session'

export function hasAdminSessionCookie(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false
  const parts = cookieHeader.split(';')
  for (const part of parts) {
    const [rawName, ...rest] = part.trim().split('=')
    if (rawName === ADMIN_SESSION_COOKIE && rest.join('=').length > 0) {
      return true
    }
  }
  return false
}
