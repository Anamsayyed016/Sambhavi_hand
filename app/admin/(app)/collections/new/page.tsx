import Link from 'next/link'
import { CollectionForm } from '@/components/admin/collection-form'

export default function NewCollectionPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/collections" className="text-xs text-muted-foreground hover:text-wine">← Collections</Link>
      <h1 className="font-serif text-3xl text-charcoal">Add collection</h1>
      <CollectionForm mode="create" />
    </div>
  )
}
