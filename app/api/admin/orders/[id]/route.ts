import { NextResponse } from 'next/server'
import {
  assertAdminCanWrite,
  assertSameOriginMutation,
  adminAuthErrorResponse,
  requireAdminAccess,
} from '@/lib/admin/auth'
import { getOrderById, updateOrderStatus } from '@/lib/admin/orders'
import { orderStatusPatchSchema } from '@/lib/admin/order-validation'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdminAccess()
    const { id } = await params
    if (!id?.trim()) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })
    }

    const order = await getOrderById(id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    assertSameOriginMutation(request)
    await assertAdminCanWrite()
    const { id } = await params

    if (!id?.trim()) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })
    }

    const existing = await getOrderById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const body = await request.json().catch(() => null)
    const parsed = orderStatusPatchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten() },
        { status: 400 },
      )
    }

    // Payment status is intentionally not accepted here (read-only in Phase 3).
    const order = await updateOrderStatus(id, parsed.data.status)
    return NextResponse.json({ order })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}
