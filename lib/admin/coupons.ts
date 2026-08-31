import { Prisma, type Coupon } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { CouponInput } from '@/lib/admin/coupon-validation'

function parseDate(v: string | null | undefined): Date | null {
  if (!v || v === '') return null
  return new Date(v)
}

export async function listCoupons(params?: {
  q?: string
  active?: 'true' | 'false' | 'all'
  status?: 'active' | 'inactive' | 'expired' | 'all'
}) {
  const where: Prisma.CouponWhereInput = {}
  if (params?.q?.trim()) {
    where.code = { contains: params.q.trim(), mode: 'insensitive' }
  }
  if (params?.active === 'true') where.active = true
  if (params?.active === 'false') where.active = false

  const now = new Date()
  if (params?.status === 'active') {
    where.active = true
    where.OR = [{ expiresAt: null }, { expiresAt: { gt: now } }]
  } else if (params?.status === 'inactive') {
    where.active = false
  } else if (params?.status === 'expired') {
    where.expiresAt = { lt: now }
  }

  return prisma.coupon.findMany({ where, orderBy: { createdAt: 'desc' } })
}

export async function getCouponById(id: string) {
  return prisma.coupon.findUnique({ where: { id } })
}

export async function createCoupon(data: CouponInput): Promise<Coupon> {
  return prisma.coupon.create({
    data: {
      code: data.code.toUpperCase(),
      discountType: data.discountType,
      discountValue: data.discountValue,
      minOrderValue: data.minOrderValue,
      maxDiscount: data.maxDiscount && data.maxDiscount > 0 ? data.maxDiscount : null,
      startsAt: parseDate(data.startsAt as string | undefined),
      expiresAt: parseDate(data.expiresAt as string | undefined),
      usageLimit: data.usageLimit,
      active: data.active,
    },
  })
}

export async function updateCoupon(id: string, data: Partial<CouponInput>): Promise<Coupon> {
  const patch: Prisma.CouponUpdateInput = {}
  if (data.code !== undefined) patch.code = data.code.toUpperCase()
  if (data.discountType !== undefined) patch.discountType = data.discountType
  if (data.discountValue !== undefined) patch.discountValue = data.discountValue
  if (data.minOrderValue !== undefined) patch.minOrderValue = data.minOrderValue
  if (data.maxDiscount !== undefined) {
    patch.maxDiscount = data.maxDiscount && data.maxDiscount > 0 ? data.maxDiscount : null
  }
  if (data.startsAt !== undefined) patch.startsAt = parseDate(data.startsAt as string | undefined)
  if (data.expiresAt !== undefined) patch.expiresAt = parseDate(data.expiresAt as string | undefined)
  if (data.usageLimit !== undefined) patch.usageLimit = data.usageLimit
  if (data.active !== undefined) patch.active = data.active
  return prisma.coupon.update({ where: { id }, data: patch })
}

export async function archiveCoupon(id: string): Promise<Coupon> {
  return prisma.coupon.update({ where: { id }, data: { active: false } })
}
