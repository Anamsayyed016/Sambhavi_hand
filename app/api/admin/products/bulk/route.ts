import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  adminAuthErrorResponse,
  assertAdminCanWrite,
  assertSameOriginMutation,
} from '@/lib/admin/auth'
import { prisma } from '@/lib/prisma'

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1).max(100),
  active: z.boolean(),
})

export async function PATCH(request: Request) {
  try {
    assertSameOriginMutation(request)
    await assertAdminCanWrite()
    const body = await request.json()
    const parsed = bulkSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
    }
    const result = await prisma.product.updateMany({
      where: { id: { in: parsed.data.ids } },
      data: { active: parsed.data.active },
    })
    return NextResponse.json({ updated: result.count })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}
