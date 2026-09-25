import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import {
  assertAdminCanWrite,
  assertSameOriginMutation,
  adminAuthErrorResponse,
  requireAdminAccess,
} from '@/lib/admin/auth'
import { createProduct, listProducts } from '@/lib/admin/products'
import {
  omitClientIdentifiers,
  parseCollectionsField,
  parseImagesField,
  productCreateSchema,
} from '@/lib/admin/validation'

function uniqueConstraintMessage(error: Prisma.PrismaClientKnownRequestError): string {
  const target = error.meta?.target
  const fields = Array.isArray(target) ? target.map(String) : typeof target === 'string' ? [target] : []
  if (fields.some((f) => f.includes('sku')) || fields.some((f) => f.includes('slug'))) {
    return 'Unable to create product right now. Please try saving again.'
  }
  return 'A unique constraint failed. Please try again.'
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
    const body = omitClientIdentifiers(await request.json())
    const parsed = productCreateSchema.safeParse({
      ...body,
      images: parseImagesField(body.images),
      collections: parseCollectionsField(body.collections),
      active: body.active ?? true,
      featured: body.featured ?? false,
      isNew: body.isNew ?? false,
    })

    if (!parsed.success) {
      const issues = parsed.error.flatten()
      return NextResponse.json(
        { error: validationFailedMessage(issues), issues },
        { status: 400 },
      )
    }

    const product = await createProduct(parsed.data)

    revalidatePath('/shop')
    revalidatePath('/collections')
    revalidatePath(`/product/${product.slug}`)
    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${product.id}`)

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: uniqueConstraintMessage(error) }, { status: 409 })
    }
    return adminAuthErrorResponse(error)
  }
}
