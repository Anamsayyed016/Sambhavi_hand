import { redirect } from 'next/navigation'

/** Legacy Phase 1 lock page — auth now uses /admin/login. */
export default function AdminLockedPage() {
  redirect('/admin/login')
}
