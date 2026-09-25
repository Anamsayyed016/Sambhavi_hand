import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
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

function uniqueConstraintMessage(error: Prisma.PrismaClientKnownRequestError): string {
  const target = error.meta?.target
  const fields = Array.isArray(target) ? target.map(String) : typeof target === 'string' ? [target] : []
  if (fields.some((f) => f.includes('sku'))) {
    return 'SKU already exists. Please use a different SKU.'
  }
  if (fields.some((f) => f.includes('slug'))) {
    return 'This product URL already exists. Please choose another slug.'
  }
  return 'A product with this slug or SKU already exists. Please choose a different value.'
}

function validationFailedMessage(flatten: {
  formErrors: string[]
  fieldErrors: Record<string, string[] | undefined>
}): string {
  const fieldNames = Object.keys(flatten.fieldErrors).filter(
    (key) => (flatten.fieldErrors[key]?.length ?? 0) > 0,
  )
  if (fieldNames.length === 0) {
    return flatten.formErrors[0] ?? 'Validation failed'
  }
  const details = fieldNames
    .map((key) => {
      const msg = flatten.fieldErrors[key]?.[0]
      return msg ? `${key}: ${msg}` : key
    })
    .join('; ')
  return `Validation failed (${fieldNames.join(', ')}). ${details}`
}

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
      const issues = parsed.error.flatten()
      return NextResponse.json(
        { error: validationFailedMessage(issues), issues },
        { status: 400 },
      )
    }

    const product = await updateProduct(id, parsed.data)

    revalidatePath('/shop')
    revalidatePath('/collections')
    revalidatePath(`/product/${product.slug}`)
    if (existing.slug !== product.slug) {
      revalidatePath(`/product/${existing.slug}`)
    }
    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${product.id}`)

    return NextResponse.json({ product })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: uniqueConstraintMessage(error) }, { status: 409 })
    }
    return adminAuthErrorResponse(error)
  }
}

/** Soft-archive (status=ARCHIVED, active=false). Hard delete is intentionally not exposed. */
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
    revalidatePath('/shop')
    revalidatePath(`/product/${product.slug}`)
    return NextResponse.json({ product, archived: true })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}
