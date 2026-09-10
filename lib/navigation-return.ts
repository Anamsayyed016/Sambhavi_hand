/**
 * Browse continuity helpers for collection/shop → product → back.
 * Session-scoped only — never trust for pricing/security.
 */

const RETURN_PATH_KEY = 'sambhavi_nav_return_path'
const RETURN_SCROLL_KEY = 'sambhavi_nav_return_scroll'
const PENDING_PATH_KEY = 'sambhavi_nav_pending_path'
const PENDING_SCROLL_KEY = 'sambhavi_nav_pending_scroll'

function isSafeInternalPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('://')
}

/** Save current listing page before navigating to a product detail. */
export function rememberBrowseContext(): void {
  if (typeof window === 'undefined') return

  const path = `${window.location.pathname}${window.location.search}`
  // Keep the original listing context when moving between product pages.
  if (path.startsWith('/product/')) return
  if (!isSafeInternalPath(path)) return

  try {
    sessionStorage.setItem(RETURN_PATH_KEY, path)
    sessionStorage.setItem(RETURN_SCROLL_KEY, String(Math.round(window.scrollY)))
  } catch {
    // Ignore private-mode / quota failures.
  }
}

export function peekBrowseReturn(): { path: string; scroll: number } | null {
  if (typeof window === 'undefined') return null
  try {
    const path = sessionStorage.getItem(RETURN_PATH_KEY)
    if (!path || !isSafeInternalPath(path) || path.startsWith('/product/')) return null
    const scroll = Number(sessionStorage.getItem(RETURN_SCROLL_KEY) ?? '0')
    return { path, scroll: Number.isFinite(scroll) ? Math.max(0, scroll) : 0 }
  } catch {
    return null
  }
}

export function clearBrowseReturn(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(RETURN_PATH_KEY)
    sessionStorage.removeItem(RETURN_SCROLL_KEY)
  } catch {
    // ignore
  }
}

export function markPendingScrollRestore(path: string, scroll: number): void {
  if (typeof window === 'undefined') return
  if (!isSafeInternalPath(path)) return
  try {
    sessionStorage.setItem(PENDING_PATH_KEY, path)
    sessionStorage.setItem(PENDING_SCROLL_KEY, String(Math.max(0, Math.round(scroll))))
  } catch {
    // ignore
  }
}

export function consumePendingScrollRestore(currentPath: string): number | null {
  if (typeof window === 'undefined') return null
  try {
    const pendingPath = sessionStorage.getItem(PENDING_PATH_KEY)
    if (!pendingPath) return null

    const pendingUrl = pendingPath
    const currentUrl = currentPath
    const matches =
      pendingUrl === currentUrl ||
      pendingUrl.split('?')[0] === currentUrl.split('?')[0]

    if (!matches) return null

    const scroll = Number(sessionStorage.getItem(PENDING_SCROLL_KEY) ?? '0')
    sessionStorage.removeItem(PENDING_PATH_KEY)
    sessionStorage.removeItem(PENDING_SCROLL_KEY)
    return Number.isFinite(scroll) ? Math.max(0, scroll) : 0
  } catch {
    return null
  }
}
