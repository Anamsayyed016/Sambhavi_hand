import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/admin/shell'
import { clearAdminSessionCookie, getCurrentAdmin } from '@/lib/admin/auth'

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getCurrentAdmin()

  if (!ctx) {
    // Cookie present but invalid/expired — clear and force login
    await clearAdminSessionCookie()
    redirect('/admin/login')
  }

  return <AdminShell admin={ctx.admin}>{children}</AdminShell>
}
