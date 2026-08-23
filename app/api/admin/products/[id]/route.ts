import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import {
  assertAdminCanWrite,
  assertSameOriginMutation,
  adminAuthErrorResponse,
  requireAdminAccess,
} from '@/lib/admin/auth'
import { archiveProduct, getProductById, updateProduct } from '@/lib/admin/products'
import {
  parseCollectionsField,
  parseImagesField,
  productPatchSchema,
} from '@/lib/admin/validation'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdminAccess()
    const { id } = await params
    const product = await getProductById(id)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ product })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    assertSameOriginMutation(request)
    await assertAdminCanWrite()
    const { id } = await params
    const existing = await getProductById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const body = await request.json()
    const prepared = {
      ...body,
      ...(body.images !== undefined ? { images: parseImagesField(body.images) } : {}),
      ...(body.collections !== undefined
        ? { collections: parseCollectionsField(body.collections) }
        : {}),
    }

    const parsed = productPatchSchema.safeParse(prepared)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const product = await updateProduct(id, parsed.data)
    return NextResponse.json({ product })
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

/** Soft-archive (active=false). Hard delete is intentionally not exposed. */
export async function DELETE(request: Request, { params }: Params) {
  try {
    assertSameOriginMutation(request)
    await assertAdminCanWrite()
    const { id } = await params
    const existing = await getProductById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    const product = await archiveProduct(id)
    return NextResponse.json({ product, archived: true })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}
