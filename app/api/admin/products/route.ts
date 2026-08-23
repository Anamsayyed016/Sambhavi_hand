import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import {
  assertAdminCanWrite,
  assertSameOriginMutation,
  adminAuthErrorResponse,
  requireAdminAccess,
} from '@/lib/admin/auth'
import { createProduct, listProducts } from '@/lib/admin/products'
import {
  parseCollectionsField,
  parseImagesField,
  productInputSchema,
} from '@/lib/admin/validation'

export async function GET(request: Request) {
  try {
    await requireAdminAccess()
    const { searchParams } = new URL(request.url)

    const result = await listProducts({
      q: searchParams.get('q') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      collection: searchParams.get('collection') ?? undefined,
      active: (searchParams.get('active') as 'true' | 'false' | 'all' | null) ?? 'all',
      availability: (searchParams.get('availability') as never) ?? 'all',
      sort: (searchParams.get('sort') as never) ?? 'updated',
      page: Number(searchParams.get('page') ?? 1),
      pageSize: Number(searchParams.get('pageSize') ?? 20),
    })

    return NextResponse.json(result)
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}

export async function POST(request: Request) {
  try {
    assertSameOriginMutation(request)
    await assertAdminCanWrite()
    const body = await request.json()
    const parsed = productInputSchema.safeParse({
      ...body,
      images: parseImagesField(body.images),
      collections: parseCollectionsField(body.collections),
      active: body.active ?? true,
      featured: body.featured ?? false,
      isNew: body.isNew ?? false,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const product = await createProduct(parsed.data)
    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A product with this slug or SKU already exists' },
        { status: 409 },
      )
    }
    return adminAuthErrorResponse(error)
  }
}
