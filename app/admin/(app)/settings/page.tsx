import { getCurrentAdmin } from '@/lib/admin/auth'
import { getStoreSettings } from '@/lib/admin/settings'
import { SettingsForms } from '@/components/admin/settings-forms'
import { AdminEmptyState } from '@/components/admin/empty-state'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  try {
    const [ctx, settings] = await Promise.all([getCurrentAdmin(), getStoreSettings()])
    if (!ctx) return <AdminEmptyState title="Unauthorized" />
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-3xl text-charcoal">Settings</h1>
        <SettingsForms settings={settings} admin={ctx.admin} />
      </div>
    )
  } catch {
    return <AdminEmptyState title="Unable to load settings" />
  }
}
