import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AdminLoginForm } from '@/components/admin/login-form'

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3efe7] px-6 py-12">
      <div className="w-full max-w-md rounded-md border border-border bg-[#faf8f4] p-8 shadow-none">
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
    </div>
  )
}
