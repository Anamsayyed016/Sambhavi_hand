import Link from 'next/link'
import { listCoupons } from '@/lib/admin/coupons'
import { formatDate, formatINR } from '@/lib/admin/format'
import { AdminEmptyState } from '@/components/admin/empty-state'
import { CouponFilters } from '@/components/admin/coupon-filters'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ q?: string; status?: string }>

function couponStatus(coupon: {
  active: boolean
  expiresAt: Date | null
  usageLimit: number | null
  usageCount: number
}): string {
  const now = new Date()
  if (coupon.expiresAt && coupon.expiresAt < now) return 'Expired'
  if (!coupon.active) return 'Inactive'
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) return 'Limit reached'
  return 'Active'
}

function formatDiscount(coupon: { discountType: string; discountValue: number }): string {
  return coupon.discountType === 'PERCENTAGE'
    ? `${coupon.discountValue}% OFF`
    : `${formatINR(coupon.discountValue)} OFF`
}

export default async function CouponsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const q = params.q?.trim()
  const status = (params.status as 'active' | 'inactive' | 'expired' | 'all' | undefined) ?? 'all'

  let items
  try {
    items = await listCoupons({ q, status })
  } catch {
    return <AdminEmptyState title="Unable to load coupons" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/marketing" className="text-xs text-muted-foreground hover:text-wine">
            ← Marketing
          </Link>
          <h1 className="mt-2 font-serif text-3xl text-charcoal">Coupons</h1>
        </div>
        <Link
          href="/admin/marketing/coupons/new"
          className="rounded-md bg-wine px-3 py-2 text-sm text-primary-foreground"
        >
          Add Coupon
        </Link>
      </div>

      <CouponFilters initialQuery={q ?? ''} initialStatus={status} />

      {items.length === 0 ? (
        <AdminEmptyState title="No coupons yet" />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-[#faf8f4]">
          <table className="min-w-[960px] w-full text-sm">
            <thead className="border-b border-border bg-beige/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Discount</th>
                <th className="px-4 py-3 text-left">Min order</th>
                <th className="px-4 py-3 text-left">Max discount</th>
                <th className="px-4 py-3 text-left">Usage</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Expiry</th>
                <th className="px-4 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/marketing/coupons/${c.id}`}
                      className="font-medium hover:text-wine"
                    >
                      {c.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{formatDiscount(c)}</td>
                  <td className="px-4 py-3">
                    {c.minOrderValue != null ? formatINR(c.minOrderValue) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {c.maxDiscount != null ? formatINR(c.maxDiscount) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {c.usageCount}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ''}
                  </td>
                  <td className="px-4 py-3">{couponStatus(c)}</td>
                  <td className="px-4 py-3">
                    {c.expiresAt ? formatDate(c.expiresAt) : '—'}
                  </td>
                  <td className="px-4 py-3">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
