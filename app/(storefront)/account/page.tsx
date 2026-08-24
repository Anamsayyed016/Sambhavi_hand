import type { Metadata } from 'next'
import Link from 'next/link'
import { User } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Account',
  description: 'Sambhavi Handloom customer account.',
  robots: { index: false, follow: false },
}

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center md:py-24">
      <User className="mx-auto size-10 text-muted-foreground" strokeWidth={1.25} aria-hidden />
      <h1 className="mt-6 font-serif text-3xl text-foreground">Your account</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Customer accounts are coming soon. You can still shop as a guest — checkout does not require
        an account.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button className="rounded-none" render={<Link href="/shop" />}>
          Continue Shopping
        </Button>
        <Button variant="outline" className="rounded-none" render={<Link href="/checkout" />}>
          Guest Checkout
        </Button>
      </div>
    </div>
  )
}
