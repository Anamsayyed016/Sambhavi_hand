import Link from 'next/link'
import { Tag, Mail } from 'lucide-react'

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-charcoal">Marketing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Coupons, newsletter, and promotions.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/marketing/coupons" className="flex gap-4 rounded-md border border-border bg-[#faf8f4] p-5 hover:border-wine/30">
          <Tag className="size-8 text-wine" strokeWidth={1.5} />
          <div>
            <p className="font-medium">Coupons</p>
            <p className="text-sm text-muted-foreground">Create discount codes (checkout integration pending)</p>
          </div>
        </Link>
        <Link href="/admin/marketing/newsletter" className="flex gap-4 rounded-md border border-border bg-[#faf8f4] p-5 hover:border-wine/30">
          <Mail className="size-8 text-wine" strokeWidth={1.5} />
          <div>
            <p className="font-medium">Newsletter</p>
            <p className="text-sm text-muted-foreground">View subscribers from the storefront</p>
          </div>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">Promotional banners are managed via storefront content for now — no full CMS in this phase.</p>
    </div>
  )
}
