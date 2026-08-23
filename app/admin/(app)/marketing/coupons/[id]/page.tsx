import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCouponById } from '@/lib/admin/coupons'
import { CouponForm } from '@/components/admin/coupon-form'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export default async function EditCouponPage({ params }: Params) {
  const coupon = await getCouponById((await params).id)
  if (!coupon) notFound()
  return (
    <div className="space-y-6">
      <Link href="/admin/marketing/coupons" className="text-xs text-muted-foreground hover:text-wine">← Coupons</Link>
      <h1 className="font-serif text-3xl text-charcoal">Edit {coupon.code}</h1>
      <CouponForm mode="edit" initial={{ ...coupon, id: coupon.id }} />
    </div>
  )
}
