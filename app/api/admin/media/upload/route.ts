import { NextResponse } from 'next/server'
import {
  adminAuthErrorResponse,
  assertAdminCanWrite,
  assertSameOriginMutation,
} from '@/lib/admin/auth'
import {
  isCloudinaryUploadConfigured,
  uploadImageBufferToCloudinary,
} from '@/lib/cloudinary'

const MAX_BYTES = 8 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export async function POST(request: Request) {
  try {
    assertSameOriginMutation(request)
    await assertAdminCanWrite()

    if (!isCloudinaryUploadConfigured()) {
      return NextResponse.json(
        {
          error:
            'Cloudinary upload is not configured. Add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, or paste a Cloudinary URL.',
        },
        { status: 503 },
      )
    }

    const form = await request.formData()
    const file = form.get('file')
    const folderRaw = form.get('folder')
    const folder =
      typeof folderRaw === 'string' && folderRaw.trim()
        ? folderRaw.trim()
        : 'sambhavi/collections'

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Use JPG, PNG, WebP, or GIF.' },
        { status: 400 },
      )
    }

    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'Image must be between 1 byte and 8 MB.' },
        { status: 400 },
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const uploaded = await uploadImageBufferToCloudinary(buffer, {
      folder,
      filename: file.name || 'upload.jpg',
    })

    return NextResponse.json({
      url: uploaded.secureUrl,
      publicId: uploaded.publicId,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cloudinary')) {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }
    return adminAuthErrorResponse(error)
  }
}
