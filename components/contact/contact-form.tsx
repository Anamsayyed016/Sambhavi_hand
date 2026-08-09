'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const inputClass =
  'h-11 w-full rounded-md border border-border bg-background px-4 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none'

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-md border border-border bg-card p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
          <Check className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
        </span>
        <h3 className="font-serif text-2xl text-foreground">Thank you for reaching out</h3>
        <p className="max-w-sm font-sans text-sm leading-relaxed text-muted-foreground text-pretty">
          We&apos;ve received your message and our team will get back to you within one business day.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="font-sans text-sm font-medium text-foreground">
            Full Name
          </label>
          <input id="name" name="name" type="text" required placeholder="Your name" className={inputClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-sans text-sm font-medium text-foreground">
            Email
          </label>
          <input id="email" name="email" type="email" required placeholder="you@example.com" className={inputClass} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="subject" className="font-sans text-sm font-medium text-foreground">
          Subject
        </label>
        <input id="subject" name="subject" type="text" required placeholder="How can we help?" className={inputClass} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="font-sans text-sm font-medium text-foreground">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell us a little more..."
          className="w-full rounded-md border border-border bg-background px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>
      <Button type="submit" size="lg" className="h-12 w-fit px-10">
        Send Message
      </Button>
    </form>
  )
}
