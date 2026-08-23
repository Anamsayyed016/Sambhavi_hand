import { NextResponse } from 'next/server'
import { adminAuthErrorResponse, requireAdminAccess } from '@/lib/admin/auth'
import { getCustomerByEmail } from '@/lib/admin/customers'

type Params = { params: Promise<{ email: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdminAccess()
    const { email } = await params
    const customer = await getCustomerByEmail(decodeURIComponent(email))
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }
    return NextResponse.json({ customer })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}
