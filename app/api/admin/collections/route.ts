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
  createCollection,
  getCollectionById,
  listCollections,
  updateCollection,
} from '@/lib/admin/collections'
import { slugify } from '@/lib/admin/format'
import { z } from 'zod'

const collectionSchema = z.object({
  slug: z.string().trim().min(2).max(200).optional(),
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().min(5).max(2000),
  image: z.string().trim().min(1).max(500),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
})

export async function GET(request: Request) {
  try {
    await requireAdminAccess()
    const q = new URL(request.url).searchParams.get('q') ?? undefined
    const active = (new URL(request.url).searchParams.get('active') as 'true' | 'false' | 'all' | null) ?? 'all'
    const items = await listCollections({ q, active })
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
    const parsed = collectionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
    }
    const slug = parsed.data.slug ?? slugify(parsed.data.name)
    const item = await createCollection({ ...parsed.data, slug })
    return NextResponse.json({ collection: item }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Collection slug already exists' }, { status: 409 })
    }
    return adminAuthErrorResponse(error)
  }
}
