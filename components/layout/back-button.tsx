'use client'

import { useRouter } from 'next/navigation'
import {
  clearBrowseReturn,
  markPendingScrollRestore,
  peekBrowseReturn,
} from '@/lib/navigation-return'

export function BackButton({
  fallbackHref = '/shop',
  label = '← Back',
}: {
  fallbackHref?: string
  label?: string
}) {
  const router = useRouter()

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      const remembered = peekBrowseReturn()
      if (remembered) {
        markPendingScrollRestore(remembered.path, remembered.scroll)
        clearBrowseReturn()
        router.push(remembered.path)
        return
      }

      try {
        const ref = document.referrer
        if (ref) {
          const referrerUrl = new URL(ref)
          if (
            referrerUrl.origin === window.location.origin &&
            !referrerUrl.pathname.startsWith('/product/')
          ) {
            router.back()
            return
          }
        }
      } catch {
        // fall through
      }

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
      className="mb-6 inline-flex items-center font-sans text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-primary"
    >
      {label}
    </button>
  )
}
