import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { hasAdminSessionCookie } from '@/lib/admin/auth-cookie'

/**
 * Early gate only. Real session validation happens in lib/admin/auth.ts
 * (getCurrentAdmin / requireAdminAccess) on every protected page and API.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isLoginPage = pathname === '/admin/login'
  const isLoginApi = pathname === '/api/admin/login'
  const isPublicAdmin = isLoginPage || isLoginApi || pathname === '/admin/locked'

  if (isPublicAdmin) {
    if (isLoginPage && hasAdminSessionCookie(request.headers.get('cookie'))) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  const hasCookie = hasAdminSessionCookie(request.headers.get('cookie'))

  if (!hasCookie) {
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
    }

    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
}
