import Link from 'next/link'
import { listNewsletterSubscribers } from '@/lib/admin/newsletter'
import { formatDate } from '@/lib/admin/format'
import { AdminEmptyState } from '@/components/admin/empty-state'

export const dynamic = 'force-dynamic'

export default async function NewsletterPage() {
  let result
  try {
    result = await listNewsletterSubscribers()
  } catch {
    return <AdminEmptyState title="Unable to load subscribers" />
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/marketing" className="text-xs text-muted-foreground hover:text-wine">← Marketing</Link>
      <h1 className="font-serif text-3xl text-charcoal">Newsletter subscribers</h1>
      {result.total === 0 ? (
        <AdminEmptyState title="No newsletter subscribers yet" />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-[#faf8f4]">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-beige/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Subscribed</th><th className="px-4 py-3 text-left">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.items.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(s.subscribedAt)}</td>
                  <td className="px-4 py-3">{s.active ? 'Active' : 'Unsubscribed'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
