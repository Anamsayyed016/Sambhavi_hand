/**
 * Cloudinary helpers for admin media uploads.
 * Uses existing Cloudinary cloud (res.cloudinary.com/tcjtyr02) when env is configured.
 */

export function getCloudinaryCloudName(): string {
  return (
    process.env.CLOUDINARY_CLOUD_NAME?.trim() ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ||
    'tcjtyr02'
  )
}

export function isCloudinaryUploadConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_API_KEY?.trim() && process.env.CLOUDINARY_API_SECRET?.trim(),
  )
}

function sha1Hex(input: string): string {
  // Use Node crypto for signature (server-only).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('crypto') as typeof import('crypto')
  return crypto.createHash('sha1').update(input).digest('hex')
}

export type CloudinaryUploadResult = {
  secureUrl: string
  publicId: string
  width?: number
  height?: number
  format?: string
}

export async function uploadImageBufferToCloudinary(
  buffer: Buffer,
  options?: { folder?: string; filename?: string },
): Promise<CloudinaryUploadResult> {
  const cloudName = getCloudinaryCloudName()
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim()
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim()

  if (!apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary upload is not configured. Set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
    )
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const folder = options?.folder ?? 'sambhavi/collections'
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
  const signature = sha1Hex(paramsToSign)

  const bytes = new Uint8Array(buffer)
  const form = new FormData()
  form.append('file', new Blob([bytes]), options?.filename ?? 'upload.jpg')
  form.append('api_key', apiKey)
  form.append('timestamp', String(timestamp))
  form.append('signature', signature)
  form.append('folder', folder)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  })

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>
  if (!response.ok) {
    const message =
      typeof data.error === 'object' &&
      data.error &&
      typeof (data.error as { message?: string }).message === 'string'
        ? (data.error as { message: string }).message
        : 'Cloudinary upload failed.'
    throw new Error(message)
  }

  const secureUrl = typeof data.secure_url === 'string' ? data.secure_url : ''
  const publicId = typeof data.public_id === 'string' ? data.public_id : ''
  if (!secureUrl) {
    throw new Error('Cloudinary did not return a secure URL.')
  }

  return {
    secureUrl,
    publicId,
    width: typeof data.width === 'number' ? data.width : undefined,
    height: typeof data.height === 'number' ? data.height : undefined,
    format: typeof data.format === 'string' ? data.format : undefined,
  }
}
