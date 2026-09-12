'use client'

import { useRouter } from 'next/navigation'
import {
  clearBrowseReturn,
  markPendingScrollRestore,
  peekBrowseReturn,
} from '@/lib/navigation-return'
import { cn } from '@/lib/utils'

/**
 * History-aware back control.
 * On product pages, prefers the remembered listing context (category / search /
 * filters + scroll). Otherwise uses browser history, then a safe fallback.
 */
export function BackButton({
  fallbackHref = '/shop',
  label = '← Back',
  className,
}: {
  fallbackHref?: string
  label?: string
  className?: string
}) {
  const router = useRouter()

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      const current = `${window.location.pathname}${window.location.search}`
      const onProduct = window.location.pathname.startsWith('/product/')
      const remembered = peekBrowseReturn()

      // Listing→product continuity only applies while viewing a product.
      if (
        onProduct &&
        remembered &&
        remembered.path !== current &&
        !remembered.path.startsWith('/product/')
      ) {
        markPendingScrollRestore(remembered.path, remembered.scroll)
        clearBrowseReturn()
        router.push(remembered.path)
        return
      }

      // Meaningful in-app history: return to the actual previous page.
      if (window.history.length > 1) {
        router.back()
        return
      }
    }

    router.push(fallbackHref)
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(
        'mb-4 inline-flex items-center font-sans text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-300 hover:text-accent',
        className,
      )}
    >
      {label}
    </button>
  )
}
