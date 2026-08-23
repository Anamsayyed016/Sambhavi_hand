import { NextResponse } from 'next/server'
import {
  adminAuthErrorResponse,
  assertSameOriginMutation,
  requireAdminAccess,
} from '@/lib/admin/auth'
import {
  ensureLowStockNotifications,
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
} from '@/lib/admin/notifications'

export async function GET() {
  try {
    await requireAdminAccess()
    await ensureLowStockNotifications()
    const [items, unreadCount] = await Promise.all([
      listNotifications(20),
      getUnreadNotificationCount(),
    ])
    return NextResponse.json({ items, unreadCount })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOriginMutation(request)
    await requireAdminAccess()
    await markAllNotificationsRead()
    return NextResponse.json({ ok: true })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}
