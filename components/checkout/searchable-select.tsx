'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'

const inputClass =
  'h-11 w-full rounded-md border border-border bg-background px-4 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none'

type SearchableSelectProps = {
  id: string
  label: string
  value: string
  options: readonly string[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string | null
  onChange: (value: string) => void
  /** Extra action row at the bottom of the list (e.g. Enter manually) */
  footerAction?: { label: string; onSelect: () => void }
}

export function SearchableSelect({
  id,
  label,
  value,
  options,
  placeholder = 'Search or select…',
  required,
  disabled,
  error,
  onChange,
  footerAction,
}: SearchableSelectProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((opt) => opt.toLowerCase().includes(q))
  }, [options, query])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <div className="flex flex-col gap-2" ref={rootRef}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
          className={`${inputClass} flex items-center justify-between gap-2 text-left ${
            !value ? 'text-muted-foreground' : ''
          } ${disabled ? 'opacity-60' : ''}`}
        >
          <span className="truncate">{value || placeholder}</span>
          <span className="shrink-0 text-muted-foreground" aria-hidden>
            ▾
          </span>
        </button>

        {open ? (
          <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-border bg-background shadow-sm">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search…"
              className="h-10 w-full border-b border-border bg-background px-3 font-sans text-sm focus:outline-none"
              aria-label={`Search ${label}`}
            />
            <ul
              id={listId}
              role="listbox"
              className="max-h-56 overflow-y-auto py-1"
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted-foreground">No matches</li>
              ) : (
                filtered.map((opt) => (
                  <li key={opt} role="option" aria-selected={opt === value}>
                    <button
                      type="button"
                      className={`w-full px-3 py-2 text-left font-sans text-sm hover:bg-muted ${
                        opt === value ? 'bg-muted/70 text-foreground' : 'text-foreground'
                      }`}
                      onClick={() => {
                        onChange(opt)
                        setOpen(false)
                      }}
                    >
                      {opt}
                    </button>
                  </li>
                ))
              )}
              {footerAction ? (
                <li className="border-t border-border">
                  <button
                    type="button"
                    className="w-full px-3 py-2.5 text-left font-sans text-sm text-primary hover:bg-muted"
                    onClick={() => {
                      footerAction.onSelect()
                      setOpen(false)
                    }}
                  >
                    {footerAction.label}
                  </button>
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {required ? (
        <input
          tabIndex={-1}
          aria-hidden
          className="sr-only"
          required
          value={value}
          onChange={() => undefined}
        />
      ) : null}
    </div>
  )
}
