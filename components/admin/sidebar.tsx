'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Layers,
  Megaphone,
  BarChart3,
  Settings,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: Users, soon: true },
  { href: '/admin/collections', label: 'Collections', icon: Layers, soon: true },
  { href: '/admin/marketing', label: 'Marketing', icon: Megaphone, soon: true },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, soon: true },
  { href: '/admin/settings', label: 'Settings', icon: Settings, soon: true },
] as const

export function AdminSidebar({
  open,
  onClose,
}: {
  open?: boolean
  onClose?: () => void
}) {
  const pathname = usePathname()

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-charcoal/40 transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-[#faf8f4] transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-5">
          <Link
            href="/admin"
            className="font-serif text-lg tracking-wide text-charcoal"
            onClick={onClose}
          >
            Sambhavi{' '}
            <span className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-wine">
              Admin
            </span>
          </Link>
          <button
            type="button"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            const soon = 'soon' in item && item.soon

            if (soon) {
              return (
                <span
                  key={item.href}
                  className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground/70"
                  title="Coming in a later phase"
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <span className="text-[10px] uppercase tracking-wider">Soon</span>
                </span>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                  active
                    ? 'bg-wine/10 font-medium text-wine'
                    : 'text-charcoal/80 hover:bg-beige/80 hover:text-charcoal',
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border p-4 text-xs text-muted-foreground">
          Catalog &amp; orders · Admin
        </div>
      </aside>
    </>
  )
}
