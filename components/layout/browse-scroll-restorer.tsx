'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { consumePendingScrollRestore } from '@/lib/navigation-return'

/** Restores scroll after collection/shop → product → back navigation. */
export function BrowseScrollRestorer() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const current = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`
    const scroll = consumePendingScrollRestore(current)
    if (scroll == null) return

    const restore = () => {
      window.scrollTo({ top: scroll, left: 0, behavior: 'auto' })
    }

    // Wait a frame (and a short timeout) so collection content can paint.
    const raf = window.requestAnimationFrame(() => {
      restore()
      window.setTimeout(restore, 50)
      window.setTimeout(restore, 200)
    })

    return () => window.cancelAnimationFrame(raf)
  }, [pathname, searchParams])

  return null
}
