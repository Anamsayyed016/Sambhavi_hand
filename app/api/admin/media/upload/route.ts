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
import { isR2UploadConfigured, uploadImageBufferToR2 } from '@/lib/r2'

const MAX_BYTES = 8 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function isProductUploadRequest(folder: string, purposeRaw: FormDataEntryValue | null): boolean {
  if (typeof purposeRaw === 'string' && purposeRaw.trim().toLowerCase() === 'product') {
    return true
  }
  return folder === 'sambhavi/products' || folder.startsWith('sambhavi/products/')
}

export async function POST(request: Request) {
  try {
    assertSameOriginMutation(request)
    await assertAdminCanWrite()

    const form = await request.formData()
    const file = form.get('file')
    const folderRaw = form.get('folder')
    const purposeRaw = form.get('purpose')
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
    const productUpload = isProductUploadRequest(folder, purposeRaw)

    if (productUpload) {
      if (!isR2UploadConfigured()) {
        return NextResponse.json(
          {
            error:
              'R2 upload is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_BASE_URL.',
          },
          { status: 503 },
        )
      }

      try {
        const uploaded = await uploadImageBufferToR2(buffer, {
          keyPrefix: 'products',
          filename: file.name || 'upload.jpg',
          contentType: file.type,
        })

        return NextResponse.json({
          url: uploaded.url,
          key: uploaded.key,
        })
      } catch {
        return NextResponse.json(
          { error: 'Image upload to R2 failed. Please try again.' },
          { status: 502 },
        )
      }
    }

    if (!isCloudinaryUploadConfigured()) {
      return NextResponse.json(
        {
          error:
            'Cloudinary upload is not configured. Add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, or paste a Cloudinary URL.',
        },
        { status: 503 },
      )
    }

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
