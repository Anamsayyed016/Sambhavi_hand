'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (email.trim()) setSubmitted(true)
  }

  return (
    <section className="relative overflow-hidden bg-primary py-20 md:py-28">
      <div className="absolute inset-0 opacity-15">
        <Image
          src="/images/editorial-drape.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          aria-hidden="true"
        />
      </div>
      <div className="relative mx-auto max-w-2xl px-5 text-center md:px-8">
        <p className="font-sans text-xs uppercase tracking-[0.25em] text-primary-foreground/70">
          The Sambhavi Circle
        </p>
        <h2 className="mt-4 font-serif text-3xl text-primary-foreground text-balance md:text-4xl">
          Be the first to see new weaves
        </h2>
        <p className="mx-auto mt-4 max-w-md font-sans text-sm leading-relaxed text-primary-foreground/80 text-pretty">
          Join our community for early access to collections, styling stories and an exclusive welcome offer.
        </p>

        {submitted ? (
          <p className="mt-8 font-serif text-lg text-primary-foreground">
            Thank you for joining. A welcome note is on its way.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="h-11 flex-1 rounded-md border border-primary-foreground/30 bg-primary-foreground/10 px-4 font-sans text-sm text-primary-foreground placeholder:text-primary-foreground/60 focus:border-primary-foreground/60 focus:outline-none"
            />
            <Button type="submit" variant="secondary" size="lg" className="shrink-0">
              Subscribe
            </Button>
          </form>
        )}
      </div>
    </section>
  )
}
