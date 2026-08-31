import { DiscountType, type Coupon, type Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { CheckoutError } from '@/lib/checkout/errors'

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase()
}

export function calculateDiscountAmount(
  coupon: Pick<Coupon, 'discountType' | 'discountValue' | 'maxDiscount'>,
  subtotal: number,
): number {
  if (subtotal <= 0) return 0

  let discount = 0
  if (coupon.discountType === DiscountType.PERCENTAGE) {
    discount = Math.floor((subtotal * coupon.discountValue) / 100)
    if (coupon.maxDiscount != null) {
      discount = Math.min(discount, coupon.maxDiscount)
    }
  } else {
    discount = coupon.discountValue
  }

  return Math.min(discount, subtotal)
}

export function getCouponUnavailableReason(
  coupon: Coupon,
  subtotal: number,
  now = new Date(),
): string | null {
  if (!coupon.active) {
    return 'This coupon is no longer active.'
  }
  if (coupon.startsAt && now < coupon.startsAt) {
    return 'This coupon is not yet active.'
  }
  if (coupon.expiresAt && now > coupon.expiresAt) {
    return 'This coupon has expired.'
  }
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
    return 'This coupon has reached its usage limit.'
  }
  if (coupon.minOrderValue != null && subtotal < coupon.minOrderValue) {
    return `Minimum order value of ₹${coupon.minOrderValue.toLocaleString('en-IN')} is required for this coupon.`
  }
  return null
}

export type ResolvedCheckoutCoupon = {
  coupon: Coupon
  discount: number
  couponCode: string
  couponId: string
}

export async function resolveCheckoutCoupon(
  code: string | undefined | null,
  subtotal: number,
): Promise<ResolvedCheckoutCoupon | null> {
  if (!code?.trim()) return null

  const normalized = normalizeCouponCode(code)
  const coupon = await prisma.coupon.findUnique({ where: { code: normalized } })

  if (!coupon) {
    throw new CheckoutError('Invalid coupon code.')
  }

  const reason = getCouponUnavailableReason(coupon, subtotal)
  if (reason) {
    throw new CheckoutError(reason)
  }

  const discount = calculateDiscountAmount(coupon, subtotal)
  return {
    coupon,
    discount,
    couponCode: coupon.code,
    couponId: coupon.id,
  }
}

/** Increment coupon usage once after verified payment. Safe for retries and concurrent checkouts. */
export async function incrementCouponUsageOnPaidOrder(
  tx: Prisma.TransactionClient,
  couponId: string | null | undefined,
): Promise<void> {
  if (!couponId) return

  const coupon = await tx.coupon.findUnique({
    where: { id: couponId },
    select: { usageLimit: true, usageCount: true },
  })
  if (!coupon) return

  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
    console.warn('[coupon] usage limit already reached at payment time', couponId)
    return
  }

  await tx.coupon.update({
    where: { id: couponId },
    data: { usageCount: { increment: 1 } },
  })
}
