import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  adminAuthErrorResponse,
  assertAdminCanWrite,
  assertSameOriginMutation,
} from '@/lib/admin/auth'
import {
  setProductsStatus,
  statusFromActiveFlag,
} from '@/lib/admin/product-lifecycle'

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
    const status = statusFromActiveFlag(parsed.data.active)
    const updated = await setProductsStatus(parsed.data.ids, status)
    return NextResponse.json({ updated })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}
