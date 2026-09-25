/**
 * Simulate storefront pipeline for tirupati-durga-puja-special (read-only).
 */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const SLUG = 'tirupati-durga-puja-special'

function mapDbProductToStorefront(row) {
  return {
    slug: row.slug,
    image: row.image,
    images: row.images.length > 0 ? row.images : [row.image],
  }
}

function mergeDbProductWithStaticFallback(row, staticProduct) {
  const mapped = mapDbProductToStorefront(row)
  const dbHasGallery = row.images.length > 0
  const images = dbHasGallery
    ? [...row.images]
    : staticProduct && staticProduct.images.length > 0
      ? [...staticProduct.images]
      : mapped.images
  const image = (row.image?.trim() || staticProduct?.image || mapped.image || '').trim()
  return { slug: row.slug, image, images }
}

async function main() {
  const row = await prisma.product.findUnique({ where: { slug: SLUG } })
  console.log('STAGE_DATABASE', {
    count: row.images.length,
    image: row.image,
    images: row.images,
  })

  const mapped = mapDbProductToStorefront(row)
  console.log('STAGE_MAP_DB', { count: mapped.images.length, images: mapped.images })

  // static catalog same as lib/products for this slug
  const staticProduct = {
    slug: SLUG,
    image:
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1790243072/file_00000000436c821197f216240f4cd1d4.png',
    images: [
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1790243072/file_00000000436c821197f216240f4cd1d4.png',
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1790243073/IMG-20260924-WA0137.jpg',
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1790243074/IMG-20260924-WA0131.jpg',
    ],
  }

  const merged = mergeDbProductWithStaticFallback(row, staticProduct)
  console.log('STAGE_MERGE_DB_PRICING', {
    count: merged.images.length,
    image: merged.image,
    images: merged.images,
  })

  // product-detail gallery useMemo
  const gallery =
    merged.images.length > 0 ? merged.images : [merged.image]
  console.log('STAGE_PRODUCT_DETAIL_GALLERY', {
    count: gallery.length,
    images: gallery,
  })

  // ProductImageZoom
  const zoomGallery = gallery.length > 0 ? gallery : ['/placeholder.svg']
  console.log('STAGE_IMAGE_ZOOM_GALLERY', {
    count: zoomGallery.length,
    images: zoomGallery,
    thumbsWouldRender: zoomGallery.length > 1 ? zoomGallery.length : 0,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
