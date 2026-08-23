'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Status = 'idle' | 'submitting' | 'invalid' | 'inactive' | 'error' | 'success'

export function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setMessage(null)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.status === 429) {
        setStatus('error')
        setMessage(data.error ?? 'Too many login attempts. Please try again later.')
        return
      }

      if (!res.ok) {
        // Generic auth failure (invalid credentials or inactive) — do not leak which
        setStatus('invalid')
        setMessage(data.error ?? 'Invalid email or password.')
        return
      }

      setStatus('success')
      const safeNext =
        nextPath.startsWith('/admin') && !nextPath.startsWith('/admin/login')
          ? nextPath
          : '/admin'
      router.replace(safeNext)
      router.refresh()
    } catch {
      setStatus('error')
      setMessage('Unable to sign in. Please try again.')
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="admin-email"
          className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground"
        >
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setStatus('idle')
            setMessage(null)
          }}
          className="mt-1.5 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div>
        <label
          htmlFor="admin-password"
          className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground"
        >
          Password
        </label>
        <div className="relative mt-1.5">
          <input
            id="admin-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setStatus('idle')
              setMessage(null)
            }}
            className="w-full rounded-md border border-border bg-white px-3 py-2.5 pr-10 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-charcoal focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
          </button>
        </div>
      </div>

      {message ? (
        <p
          className={`rounded-md border px-3 py-2 text-sm ${
            status === 'error' || status === 'invalid' || status === 'inactive'
              ? 'border-destructive/30 bg-destructive/5 text-destructive'
              : 'border-border bg-beige/50 text-muted-foreground'
          }`}
          role="alert"
        >
          {message}
        </p>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={status === 'submitting' || status === 'success'}
      >
        {status === 'submitting' ? 'Signing in…' : status === 'success' ? 'Signed in' : 'Sign in'}
      </Button>
    </form>
  )
}
