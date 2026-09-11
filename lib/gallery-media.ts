/**
 * Shared gallery media helpers.
 * Product `images` arrays may include Cloudinary video URLs after stills.
 */

export function isGalleryVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false
  const value = url.trim()
  if (!value) return false
  return (
    /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(value) ||
    /\/video\/upload\//i.test(value) ||
    /\/video\/[^/]+\/upload\//i.test(value)
  )
}

/** First non-video URL in a gallery (safe for next/image / product cards). */
export function getGalleryStillUrl(
  images: string[] | null | undefined,
  fallback = '/placeholder.svg',
): string {
  const list = images?.filter(Boolean) ?? []
  const still = list.find((url) => !isGalleryVideoUrl(url))
  return still || fallback
}

/**
 * Derive a still poster from an existing Cloudinary video URL.
 * Does not upload or invent a new asset — transforms the same delivery URL.
 */
export function getGalleryVideoPosterUrl(url: string | null | undefined): string | undefined {
  if (!url || !isGalleryVideoUrl(url)) return undefined
  const trimmed = url.trim()

  if (/\/video\/upload\//i.test(trimmed)) {
    return trimmed
      .replace(/\/video\/upload\//i, '/video/upload/so_0,f_jpg,q_auto:eco/')
      .replace(/\.(mp4|webm|mov|m4v)(\?.*)?$/i, '.jpg$2')
  }

  if (/\/video\/[^/]+\/upload\//i.test(trimmed)) {
    return trimmed
      .replace(/(\/video\/[^/]+\/upload\/)/i, '$1so_0,f_jpg,q_auto:eco/')
      .replace(/\.(mp4|webm|mov|m4v)(\?.*)?$/i, '.jpg$2')
  }

  return undefined
}
