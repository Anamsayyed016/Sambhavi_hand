'use client'

import { useRouter } from 'next/navigation'

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
      try {
        const ref = document.referrer
        if (ref && new URL(ref).origin === window.location.origin) {
          router.back()
          return
        }
      } catch {
        // fall through to shop
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
