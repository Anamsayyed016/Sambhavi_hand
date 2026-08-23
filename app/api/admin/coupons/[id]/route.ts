import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import {
  adminAuthErrorResponse,
  assertAdminCanWrite,
  assertSameOriginMutation,
  requireAdminAccess,
} from '@/lib/admin/auth'
import { archiveCoupon, getCouponById, updateCoupon } from '@/lib/admin/coupons'
import { couponPatchSchema } from '@/lib/admin/coupon-validation'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdminAccess()
    const coupon = await getCouponById((await params).id)
    if (!coupon) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ coupon })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    assertSameOriginMutation(request)
    await assertAdminCanWrite()
    const body = await request.json()
    const parsed = couponPatchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
    }
    const coupon = await updateCoupon((await params).id, parsed.data)
    return NextResponse.json({ coupon })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 })
    }
    return adminAuthErrorResponse(error)
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    assertSameOriginMutation(request)
    await assertAdminCanWrite()
    const coupon = await archiveCoupon((await params).id)
    return NextResponse.json({ coupon, archived: true })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}
