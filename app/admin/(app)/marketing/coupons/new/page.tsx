import Link from 'next/link'
import { CouponForm } from '@/components/admin/coupon-form'

export default function NewCouponPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/marketing/coupons" className="text-xs text-muted-foreground hover:text-wine">← Coupons</Link>
      <h1 className="font-serif text-3xl text-charcoal">Add coupon</h1>
      <CouponForm mode="create" />
    </div>
  )
}
