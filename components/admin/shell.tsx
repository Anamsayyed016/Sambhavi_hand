'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, LogOut, Menu, Search } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/sidebar'
import type { SafeAdmin } from '@/lib/admin/types'

export function AdminShell({
  children,
  admin,
}: {
  children: React.ReactNode
  admin: SafeAdmin
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function logout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } finally {
      router.replace('/admin/login')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#f3efe7] text-charcoal">
      <div className="flex min-h-screen">
        <AdminSidebar open={open} onClose={() => setOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-[#faf8f4]/95 px-4 backdrop-blur-sm lg:px-6">
            <button
              type="button"
              className="rounded-md p-2 text-charcoal hover:bg-muted lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>

            <div className="hidden min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-white px-3 py-1.5 sm:flex sm:max-w-md">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search products, SKUs…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Search"
                disabled
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-none">{admin.name}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{admin.email}</p>
              </div>
              <button
                type="button"
                className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-charcoal"
                aria-label="Notifications"
                disabled
              >
                <Bell className="size-4" />
              </button>
              <button
                type="button"
                onClick={logout}
                disabled={loggingOut}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-beige/60 disabled:opacity-60"
                aria-label="Log out"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">{loggingOut ? '…' : 'Log out'}</span>
              </button>
            </div>
          </header>

          <div className="flex-1 p-4 lg:p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
