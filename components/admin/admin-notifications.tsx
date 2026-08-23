'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'

type Notification = {
  id: string
  title: string
  message: string
  link: string | null
  read: boolean
  createdAt: string
}

export function AdminNotifications() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  async function load() {
    const res = await fetch('/api/admin/notifications')
    if (res.ok) {
      const data = await res.json()
      setItems(data.items ?? [])
      setCount(data.unreadCount ?? 0)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 60_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  async function markAllRead() {
    await fetch('/api/admin/notifications', { method: 'PATCH' })
    load()
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="relative rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-charcoal"
        aria-label="Notifications"
        onClick={() => {
          setOpen((v) => !v)
          if (!open) load()
        }}
      >
        <Bell className="size-4" />
        {count > 0 ? (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-wine text-[9px] text-white">
            {count > 9 ? '9+' : count}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-md border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="text-sm font-medium">Notifications</p>
            {count > 0 ? (
              <button type="button" className="text-xs text-wine hover:underline" onClick={markAllRead}>
                Mark all read
              </button>
            ) : null}
          </div>
          <ul className="max-h-72 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">No notifications</li>
            ) : (
              items.map((n) => (
                <li key={n.id} className="border-b border-border last:border-0">
                  {n.link ? (
                    <Link
                      href={n.link}
                      className={`block px-3 py-2.5 text-sm hover:bg-beige/50 ${n.read ? 'opacity-70' : ''}`}
                      onClick={() => setOpen(false)}
                    >
                      <p className="font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                    </Link>
                  ) : (
                    <div className={`px-3 py-2.5 text-sm ${n.read ? 'opacity-70' : ''}`}>
                      <p className="font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
