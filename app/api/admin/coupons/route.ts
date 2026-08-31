import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import {
  adminAuthErrorResponse,
  assertAdminCanWrite,
  assertSameOriginMutation,
  requireAdminAccess,
} from '@/lib/admin/auth'
import { archiveCoupon, createCoupon, getCouponById, listCoupons, updateCoupon } from '@/lib/admin/coupons'
import { couponInputSchema, couponPatchSchema } from '@/lib/admin/coupon-validation'

export async function GET(request: Request) {
  try {
    await requireAdminAccess()
    const { searchParams } = new URL(request.url)
    const items = await listCoupons({
      q: searchParams.get('q') ?? undefined,
      active: (searchParams.get('active') as 'true' | 'false' | 'all' | null) ?? 'all',
      status: (searchParams.get('status') as 'active' | 'inactive' | 'expired' | 'all' | null) ?? 'all',
    })
    return NextResponse.json({ items })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}

export async function POST(request: Request) {
  try {
    assertSameOriginMutation(request)
    await assertAdminCanWrite()
    const body = await request.json()
    const parsed = couponInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 })
    }
    const coupon = await createCoupon(parsed.data)
    return NextResponse.json({ coupon }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 })
    }
    return adminAuthErrorResponse(error)
  }
}
