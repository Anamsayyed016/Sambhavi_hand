import { NextResponse } from 'next/server'
import { OrderStatus, PaymentStatus } from '@prisma/client'
import { adminAuthErrorResponse, requireAdminAccess } from '@/lib/admin/auth'
import { getOrderStats, listOrders } from '@/lib/admin/orders'

export async function GET(request: Request) {
  try {
    await requireAdminAccess()
    const { searchParams } = new URL(request.url)

    const statusParam = searchParams.get('status') ?? 'all'
    const paymentParam = searchParams.get('paymentStatus') ?? 'all'
    const sortParam = searchParams.get('sort') ?? 'newest'

    const status =
      statusParam === 'all' || Object.values(OrderStatus).includes(statusParam as OrderStatus)
        ? (statusParam as OrderStatus | 'all')
        : 'all'

    const paymentStatus =
      paymentParam === 'all' ||
      Object.values(PaymentStatus).includes(paymentParam as PaymentStatus)
        ? (paymentParam as PaymentStatus | 'all')
        : 'all'

    const sort = sortParam === 'oldest' ? 'oldest' : 'newest'

    const [result, stats] = await Promise.all([
      listOrders({
        q: searchParams.get('q') ?? undefined,
        status,
        paymentStatus,
        sort,
        page: Number(searchParams.get('page') ?? 1),
        pageSize: Number(searchParams.get('pageSize') ?? 20),
      }),
      getOrderStats(),
    ])

    return NextResponse.json({ ...result, stats })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}
