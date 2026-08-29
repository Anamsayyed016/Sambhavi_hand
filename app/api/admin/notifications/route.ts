import { NextResponse } from 'next/server'
import { z } from 'zod'
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
  markNotificationRead,
} from '@/lib/admin/notifications'

export async function GET() {
  try {
    await requireAdminAccess()
    await ensureLowStockNotifications().catch(() => undefined)
    const [items, unreadCount] = await Promise.all([
      listNotifications(30),
      getUnreadNotificationCount(),
    ])
    return NextResponse.json({
      items: items.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}

const patchSchema = z.object({
  id: z.string().min(1).max(64).optional(),
  markAll: z.boolean().optional(),
})

export async function PATCH(request: Request) {
  try {
    assertSameOriginMutation(request)
    await requireAdminAccess()

    const body = await request.json().catch(() => ({}))
    const parsed = patchSchema.safeParse(body)

    if (parsed.success && parsed.data.id) {
      await markNotificationRead(parsed.data.id)
      const unreadCount = await getUnreadNotificationCount()
      return NextResponse.json({ ok: true, unreadCount })
    }

    await markAllNotificationsRead()
    return NextResponse.json({ ok: true, unreadCount: 0 })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}
