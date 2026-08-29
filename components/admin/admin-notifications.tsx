'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  orderId: string | null
  read: boolean
  createdAt: string
}

const POLL_MS = 12_000

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const diffSec = Math.max(0, Math.round((Date.now() - then) / 1000))
  if (diffSec < 60) return 'Just now'
  const mins = Math.round(diffSec / 60)
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function playSubtleChime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.value = 0.04
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    osc.stop(ctx.currentTime + 0.26)
    void ctx.close()
  } catch {
    // Autoplay / AudioContext restrictions — visual badge still works.
  }
}

export function AdminNotifications() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const lastCountRef = useRef<number | null>(null)
  const interactedRef = useRef(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/notifications', { cache: 'no-store' })
    if (!res.ok) return
    const data = await res.json()
    const nextCount = typeof data.unreadCount === 'number' ? data.unreadCount : 0
    const prev = lastCountRef.current

    setItems(data.items ?? [])
    setCount(nextCount)

    if (prev !== null && nextCount > prev) {
      if (interactedRef.current) playSubtleChime()
      // Refresh server components (dashboard / orders) when a new notification arrives.
      router.refresh()
    }
    lastCountRef.current = nextCount
  }, [router])

  useEffect(() => {
    const markInteracted = () => {
      interactedRef.current = true
    }
    window.addEventListener('pointerdown', markInteracted, { once: true })
    window.addEventListener('keydown', markInteracted, { once: true })
    return () => {
      window.removeEventListener('pointerdown', markInteracted)
      window.removeEventListener('keydown', markInteracted)
    }
  }, [])

  useEffect(() => {
    void load()
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') void load()
    }, POLL_MS)
    return () => clearInterval(t)
  }, [load])

  useEffect(() => {
    // Re-poll when navigating between admin pages.
    void load()
  }, [pathname, load])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  async function markAllRead() {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    })
    await load()
  }

  async function onOpenNotification(n: Notification) {
    setOpen(false)
    if (!n.read) {
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: n.id }),
      }).catch(() => undefined)
      setItems((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)))
      setCount((c) => Math.max(0, c - 1))
      lastCountRef.current = Math.max(0, (lastCountRef.current ?? 1) - 1)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="relative rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-charcoal"
        aria-label={count > 0 ? `Notifications, ${count} unread` : 'Notifications'}
        onClick={() => {
          setOpen((v) => !v)
          if (!open) void load()
        }}
      >
        <Bell className="size-4" />
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-wine px-1 text-[9px] font-medium leading-4 text-white">
            {count > 99 ? '99+' : count}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-1 w-[22rem] rounded-md border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="text-sm font-medium">Notifications</p>
            {count > 0 ? (
              <button type="button" className="text-xs text-wine hover:underline" onClick={markAllRead}>
                Mark all read
              </button>
            ) : null}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">No notifications yet</li>
            ) : (
              items.map((n) => {
                const href = n.link || (n.orderId ? `/admin/orders/${n.orderId}` : null)
                const body = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-medium uppercase tracking-[0.08em] ${n.read ? 'text-muted-foreground' : 'text-wine'}`}>
                        {n.title}
                      </p>
                      {!n.read ? <span className="mt-1 size-1.5 shrink-0 rounded-full bg-wine" aria-hidden /> : null}
                    </div>
                    <p className="mt-1 text-sm text-charcoal">{n.message}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{formatRelativeTime(n.createdAt)}</p>
                  </>
                )

                return (
                  <li key={n.id} className={`border-b border-border last:border-0 ${n.read ? 'bg-white' : 'bg-beige/30'}`}>
                    {href ? (
                      <Link
                        href={href}
                        className="block px-3 py-2.5 hover:bg-beige/50"
                        onClick={() => void onOpenNotification(n)}
                      >
                        {body}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="block w-full px-3 py-2.5 text-left hover:bg-beige/50"
                        onClick={() => void onOpenNotification(n)}
                      >
                        {body}
                      </button>
                    )}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
