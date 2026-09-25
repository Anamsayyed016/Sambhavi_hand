/**
 * Cloudflare R2 helpers for admin product image uploads.
 * Server-only — credentials must never reach the browser.
 */

import 'server-only'

import { randomUUID } from 'crypto'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

export type R2UploadResult = {
  key: string
  url: string
}

export type R2UploadOptions = {
  /** Object key prefix without leading/trailing slashes (default: products). */
  keyPrefix?: string
  /** Original filename — used only to derive a safe extension. */
  filename?: string
  /** MIME type stored as Content-Type on the object. */
  contentType: string
}

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

function trimEnv(name: string): string {
  return process.env[name]?.trim() ?? ''
}

function getPublicBaseUrl(): string {
  return trimEnv('R2_PUBLIC_BASE_URL').replace(/\/+$/, '')
}

export function isR2UploadConfigured(): boolean {
  return Boolean(
    trimEnv('R2_ACCOUNT_ID') &&
      trimEnv('R2_ACCESS_KEY_ID') &&
      trimEnv('R2_SECRET_ACCESS_KEY') &&
      trimEnv('R2_BUCKET_NAME') &&
      trimEnv('R2_PUBLIC_BASE_URL'),
  )
}

function requireR2Config(): {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  publicBaseUrl: string
} {
  const accountId = trimEnv('R2_ACCOUNT_ID')
  const accessKeyId = trimEnv('R2_ACCESS_KEY_ID')
  const secretAccessKey = trimEnv('R2_SECRET_ACCESS_KEY')
  const bucketName = trimEnv('R2_BUCKET_NAME')
  const publicBaseUrl = getPublicBaseUrl()

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicBaseUrl) {
    throw new Error(
      'R2 upload is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_BASE_URL.',
    )
  }

  return { accountId, accessKeyId, secretAccessKey, bucketName, publicBaseUrl }
}

function createR2Client(accountId: string, accessKeyId: string, secretAccessKey: string): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

function sanitizeExtension(filename: string | undefined, contentType: string): string {
  const fromMime = MIME_TO_EXT[contentType.toLowerCase().trim()]
  if (fromMime) return fromMime

  const raw = filename?.split('.').pop()?.toLowerCase().trim() ?? ''
  const cleaned = raw.replace(/[^a-z0-9]/g, '')
  if (cleaned === 'jpeg') return 'jpg'
  if (cleaned === 'jpg' || cleaned === 'png' || cleaned === 'webp' || cleaned === 'gif') {
    return cleaned
  }

  throw new Error('Unsupported image type for R2 upload. Use JPG, PNG, WebP, or GIF.')
}

function buildObjectKey(keyPrefix: string, extension: string): string {
  const prefix = keyPrefix.replace(/^\/+|\/+$/g, '') || 'products'
  return `${prefix}/${randomUUID()}.${extension}`
}

/**
 * Upload an image buffer to Cloudflare R2 and return a stable public URL.
 * Does not log or return credentials.
 */
export async function uploadImageBufferToR2(
  buffer: Buffer,
  options: R2UploadOptions,
): Promise<R2UploadResult> {
  const { accountId, accessKeyId, secretAccessKey, bucketName, publicBaseUrl } = requireR2Config()

  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error('R2 upload requires a non-empty image buffer.')
  }

  const contentType = options.contentType?.trim()
  if (!contentType) {
    throw new Error('R2 upload requires a Content-Type.')
  }

  const extension = sanitizeExtension(options.filename, contentType)
  const key = buildObjectKey(options.keyPrefix ?? 'products', extension)

  const client = createR2Client(accountId, accessKeyId, secretAccessKey)

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    )
  } finally {
    client.destroy()
  }

  return {
    key,
    url: `${publicBaseUrl}/${key}`,
  }
}
