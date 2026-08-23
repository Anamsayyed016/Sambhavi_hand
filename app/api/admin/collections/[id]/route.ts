import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import {
  adminAuthErrorResponse,
  assertAdminCanWrite,
  assertSameOriginMutation,
  requireAdminAccess,
} from '@/lib/admin/auth'
import {
  archiveCollection,
  getCollectionById,
  removeProductFromCollection,
  setCollectionProducts,
  updateCollection,
} from '@/lib/admin/collections'
import { z } from 'zod'

const patchSchema = z.object({
  slug: z.string().trim().min(2).max(200).optional(),
  name: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().min(5).max(2000).optional(),
  image: z.string().trim().min(1).max(500).optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  productIds: z.array(z.string()).optional(),
  removeProductId: z.string().optional(),
})

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdminAccess()
    const { id } = await params
    const collection = await getCollectionById(id)
    if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ collection })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    assertSameOriginMutation(request)
    await assertAdminCanWrite()
    const { id } = await params
    const existing = await getCollectionById(id)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
    }

    if (parsed.data.productIds) {
      await setCollectionProducts(existing.slug, parsed.data.productIds)
    }
    if (parsed.data.removeProductId) {
      await removeProductFromCollection(parsed.data.removeProductId, existing.slug)
    }

    const { productIds, removeProductId, ...patch } = parsed.data
    const collection =
      Object.keys(patch).length > 0
        ? await updateCollection(id, patch)
        : existing

    return NextResponse.json({ collection })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Collection slug already exists' }, { status: 409 })
    }
    return adminAuthErrorResponse(error)
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    assertSameOriginMutation(request)
    await assertAdminCanWrite()
    const { id } = await params
    const collection = await archiveCollection(id)
    return NextResponse.json({ collection, archived: true })
  } catch (error) {
    return adminAuthErrorResponse(error)
  }
}
