'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatINR } from '@/lib/products'

type Suggestion = {
  slug: string
  name: string
  price: number
  originalPrice: number | null
  image: string
  category: string
}

const iconClass = 'size-[1.375rem]'
const iconButtonClass =
  'rounded-full p-2.5 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40'

export function NavbarSearch() {
  const router = useRouter()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      setLoading(false)
      setActiveIndex(-1)
      return
    }

    setLoading(true)
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(trimmed)}&limit=6`,
        )
        const data = await res.json().catch(() => ({}))
        if (res.ok && Array.isArray(data.items)) {
          setSuggestions(data.items as Suggestion[])
        } else {
          setSuggestions([])
        }
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => window.clearTimeout(timer)
  }, [query])

  function goToSearch(value?: string) {
    const next = (value ?? query).trim()
    setOpen(false)
    setQuery('')
    setSuggestions([])
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : '/search')
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    goToSearch()
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((current) => Math.min(current + 1, suggestions.length - 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((current) => Math.max(current - 1, -1))
      return
    }
    if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault()
        setOpen(false)
        router.push(`/product/${suggestions[activeIndex].slug}`)
        return
      }
      goToSearch()
    }
  }

  const trimmed = query.trim()
  const showSuggestions = open && trimmed.length >= 2

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Search products"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((value) => !value)}
        className={iconButtonClass}
      >
        <Search className={iconClass} strokeWidth={1.5} aria-hidden />
      </button>

      {open ? (
        <div className="fixed inset-x-0 top-[4.5rem] z-50 border-b border-border/40 bg-ivory px-4 py-4 shadow-sm md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-3 md:w-[min(100vw-2rem,24rem)] md:rounded-md md:border md:shadow-lg">
          <form onSubmit={onSubmit} role="search" className="relative">
            <label htmlFor="navbar-search-input" className="sr-only">
              Search products
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              ref={inputRef}
              id="navbar-search-input"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(-1)
              }}
              onKeyDown={onInputKeyDown}
              placeholder="Search silk, Banarasi, cotton…"
              autoComplete="off"
              className="h-11 w-full rounded-md border border-border bg-background py-2 pl-10 pr-10 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <button
              type="button"
              aria-label="Close search"
              onClick={() => setOpen(false)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </button>
          </form>

          {showSuggestions ? (
            <div id={listId} className="mt-3 overflow-hidden rounded-md border border-border bg-background">
              {loading ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">Searching…</p>
              ) : suggestions.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">No matching products.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {suggestions.map((item, index) => (
                    <li key={item.slug}>
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-secondary/60',
                          activeIndex === index && 'bg-secondary/60',
                        )}
                      >
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-sm bg-muted">
                          <Image
                            src={item.image || '/placeholder.svg'}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-foreground">{item.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{item.category}</p>
                        </div>
                        <p className="shrink-0 text-sm text-foreground">{formatINR(item.price)}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {!loading ? (
                <button
                  type="button"
                  onClick={() => goToSearch()}
                  className="w-full border-t border-border px-4 py-3 text-left text-sm text-primary hover:bg-secondary/40"
                >
                  View all results for &ldquo;{trimmed}&rdquo;
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
