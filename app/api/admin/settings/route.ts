import { NextResponse } from 'next/server'
import {
  adminAuthErrorResponse,
  assertAdminCanWrite,
  assertSameOriginMutation,
  requireAdminAccess,
} from '@/lib/admin/auth'
import { hashPassword, verifyPassword } from '@/lib/admin/password'
import {
  adminPasswordPatchSchema,
  adminProfilePatchSchema,
  getStoreSettings,
  storeSettingsPatchSchema,
  updateAdminProfile,
  updateStoreSettings,
} from '@/lib/admin/settings'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const admin = await requireAdminAccess()
    const settings = await getStoreSettings()
    return NextResponse.json({ settings, admin: admin.admin })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOriginMutation(request)
    const ctx = await assertAdminCanWrite()
    const body = await request.json()
    const section = body.section as string

    if (section === 'store') {
      const parsed = storeSettingsPatchSchema.safeParse(body.data)
      if (!parsed.success) {
        return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
      }
      const settings = await updateStoreSettings(parsed.data)
      return NextResponse.json({ settings })
    }

    if (section === 'profile') {
      const parsed = adminProfilePatchSchema.safeParse(body.data)
      if (!parsed.success) {
        return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
      }
      const admin = await updateAdminProfile(ctx.admin.id, parsed.data.name)
      return NextResponse.json({ admin })
    }

    if (section === 'password') {
      const parsed = adminPasswordPatchSchema.safeParse(body.data)
      if (!parsed.success) {
        return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
      }
      const user = await prisma.adminUser.findUnique({
        where: { id: ctx.admin.id },
        select: { passwordHash: true },
      })
      if (!user || !(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
      }
      const passwordHash = await hashPassword(parsed.data.newPassword)
      await prisma.adminUser.update({ where: { id: ctx.admin.id }, data: { passwordHash } })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown section' }, { status: 400 })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}
