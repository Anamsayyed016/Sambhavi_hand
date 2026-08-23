import Image from 'next/image'
import Link from 'next/link'
import { listMediaPaths } from '@/lib/admin/media'
import { AdminEmptyState } from '@/components/admin/empty-state'

export const dynamic = 'force-dynamic'

export default async function MediaPage() {
  let paths
  try {
    paths = await listMediaPaths()
  } catch {
    return <AdminEmptyState title="Unable to load media" />
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/settings" className="text-xs text-muted-foreground hover:text-wine">← Settings</Link>
      <h1 className="font-serif text-3xl text-charcoal">Media library</h1>
      <p className="text-sm text-muted-foreground">Paths in use across the catalog. Copy a path into product or collection forms.</p>
      {paths.length === 0 ? (
        <AdminEmptyState title="No media paths found" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {paths.map((path) => (
            <div key={path} className="rounded-md border border-border bg-[#faf8f4] p-3">
              <div className="relative aspect-square overflow-hidden rounded bg-beige">
                <Image src={path} alt="" fill className="object-cover" sizes="200px" />
              </div>
              <p className="mt-2 truncate font-mono text-[11px]">{path}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
