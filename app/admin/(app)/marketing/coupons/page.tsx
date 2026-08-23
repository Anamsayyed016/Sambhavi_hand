import Link from 'next/link'
import { listCoupons } from '@/lib/admin/coupons'
import { AdminEmptyState } from '@/components/admin/empty-state'

export const dynamic = 'force-dynamic'

export default async function CouponsPage() {
  let items
  try {
    items = await listCoupons()
  } catch {
    return <AdminEmptyState title="Unable to load coupons" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/marketing" className="text-xs text-muted-foreground hover:text-wine">← Marketing</Link>
          <h1 className="mt-2 font-serif text-3xl text-charcoal">Coupons</h1>
        </div>
        <Link href="/admin/marketing/coupons/new" className="rounded-md bg-wine px-3 py-2 text-sm text-primary-foreground">Add Coupon</Link>
      </div>
      {items.length === 0 ? (
        <AdminEmptyState title="No coupons yet" />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-[#faf8f4]">
          <table className="min-w-[640px] w-full text-sm">
            <thead className="border-b border-border bg-beige/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Discount</th>
                <th className="px-4 py-3 text-left">Usage</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3"><Link href={`/admin/marketing/coupons/${c.id}`} className="font-medium hover:text-wine">{c.code}</Link></td>
                  <td className="px-4 py-3">{c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                  <td className="px-4 py-3">{c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                  <td className="px-4 py-3">{c.active ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
