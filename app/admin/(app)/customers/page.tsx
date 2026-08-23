import Link from 'next/link'
import { listCustomers } from '@/lib/admin/customers'
import { formatDate, formatINR } from '@/lib/admin/format'
import { AdminEmptyState } from '@/components/admin/empty-state'

export const dynamic = 'force-dynamic'

type SP = Promise<Record<string, string | string[] | undefined>>
function one(v: string | string[] | undefined) { return Array.isArray(v) ? v[0] : v }

export default async function CustomersPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const q = one(sp.q) ?? ''
  const page = Number(one(sp.page) ?? 1)

  let result
  try {
    result = await listCustomers({ q, page })
  } catch {
    return <AdminEmptyState title="Unable to load customers" description="Please try again." />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-charcoal">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">Guest customers from order history.</p>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, email, phone…"
          className="flex-1 rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-ring"
        />
        <button type="submit" className="rounded-md bg-wine px-3 py-2 text-sm text-primary-foreground">Search</button>
      </form>

      {result.total === 0 ? (
        <AdminEmptyState title="No customers yet" description="Customers appear after their first order." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border border-border bg-[#faf8f4]">
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="border-b border-border bg-beige/50 text-xs uppercase tracking-[0.1em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Total spent</th>
                  <th className="px-4 py-3">Last order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.items.map((c) => (
                  <tr key={c.email}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/customers/${encodeURIComponent(c.email)}`} className="font-medium hover:text-wine">
                        {c.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                    <td className="px-4 py-3">{c.orderCount}</td>
                    <td className="px-4 py-3">{formatINR(c.totalSpent)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.lastOrderAt ? formatDate(c.lastOrderAt) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.pageCount > 1 ? (
            <p className="text-sm text-muted-foreground">Page {result.page} of {result.pageCount}</p>
          ) : null}
        </>
      )}
    </div>
  )
}
