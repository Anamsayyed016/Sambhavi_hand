import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { AdminLoginForm } from '@/components/admin/login-form'

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3efe7] px-6 py-12">
      <div className="flex w-full max-w-md flex-col items-center">
        <div className="w-full rounded-md border border-border bg-[#faf8f4] p-8 shadow-none">
          <div className="mb-8 text-center">
            <p className="font-serif text-3xl text-charcoal">Sambhavi</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-wine">
              Admin sign in
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Secure access for catalog management.
            </p>
          </div>

          <Suspense
            fallback={<p className="text-center text-sm text-muted-foreground">Loading…</p>}
          >
            <AdminLoginForm />
          </Suspense>
        </div>

        <Link
          href="/"
          className="mt-6 text-sm text-muted-foreground transition-colors hover:text-wine focus:outline-none focus-visible:underline"
        >
          ← Back to Store
        </Link>
      </div>
    </div>
  )
}
