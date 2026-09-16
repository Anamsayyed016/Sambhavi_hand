/**
 * Upserts sahajanand New Launch – Series under Lehenga Collection (Navratri nested).
 * Idempotent — does not modify other lehenga or Navratri products.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789239842/IMG_20260913_002921_179.jpg'

const IMAGES: string[] = [
  IMAGE,
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789240136/IMG_20260913_002920_854.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789239879/IMG_20260913_002921_111.jpg',
  'https://res.cloudinary.com/tcjtyr02/video/upload/v1789240138/VID_20260913_002921_289.mp4',
]

const DESCRIPTION = [
  '💃 Featuring Our Own Real Modeling – A Boutique Statement Piece!',
  '',
  '👗 LEHENGA DETAILS',
  '✦ Fabric: Havy Reyon',
  '✦ Work: Gota Patti Lace',
  '✦ Type: Full-Stitched With Side Zeep | Fits up to Size 44',
  '✦ Inner: Soft Micro Lining',
  '✦ Flair: 9-Meter Grand Flair with Canvas Patta ❤️‍🔥',
  '',
  '👘 CHOLI (Blouse)',
  '✦ Fabric: Havy Reyon',
  '✦ Work: Plain',
  '✦ Cut: 0.80 C.M | Unstitched | Fits up to Size 44',
  '',
  '🥻 KOTI',
  '✦ Fabric: Havy Reyon',
  '✦ Work: Embroidery Thread With Mirror 🪞 Detailing',
  '✦ Size: Up to 42',
  '',
  '🪶 Weight: Approx. 1 KG',
  '',
  '🌟 Styled with Our Own Real Model – Crafted for the Modern Queen',
  '💫 Perfect for Weddings, Sangeet, Festive Celebrations & Premium Occasions',
  '📦 Ready to Dispatch | 💯 Boutique Quality Guaranteed',
].join('\n')

async function main() {
  await prisma.collection.upsert({
    where: { slug: 'lehanga' },
    create: {
      slug: 'lehanga',
      name: 'Lehenga Collection',
      description: 'NAVRATRI COLLECTION · Explore the Lehenga Collection.',
      image: IMAGE,
      active: true,
      featured: false,
    },
    update: {
      active: true,
    },
  })

  const product = await prisma.product.upsert({
    where: { slug: 'sahajanand-new-launch-series' },
    create: {
      slug: 'sahajanand-new-launch-series',
      sku: 'SH-SAHAJANAND-01',
      name: 'sahajanand New Launch – Series ✨',
      description: DESCRIPTION,
      price: 2499,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'Lehenga Collection',
      collections: ['lehanga', 'navratri-collection'],
      fabric: 'Havy Reyon',
      weave: 'Gota Patti Lace · Embroidery Thread With Mirror',
      length: 'Full-Stitched With Side Zeep | Fits up to Size 44 · 9-Meter Grand Flair',
      blouse: 'Havy Reyon Plain · Cut: 0.80 C.M | Unstitched | Fits up to Size 44',
      care: 'Weight: Approx. 1 KG · Ready to Dispatch | Boutique Quality Guaranteed',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      sku: 'SH-SAHAJANAND-01',
      name: 'sahajanand New Launch – Series ✨',
      description: DESCRIPTION,
      price: 2499,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'Lehenga Collection',
      collections: ['lehanga', 'navratri-collection'],
      fabric: 'Havy Reyon',
      weave: 'Gota Patti Lace · Embroidery Thread With Mirror',
      length: 'Full-Stitched With Side Zeep | Fits up to Size 44 · 9-Meter Grand Flair',
      blouse: 'Havy Reyon Plain · Cut: 0.80 C.M | Unstitched | Fits up to Size 44',
      care: 'Weight: Approx. 1 KG · Ready to Dispatch | Boutique Quality Guaranteed',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(`sahajanand New Launch ready: ${product.id}`)
  console.log(`  slug: ${product.slug}`)
  console.log(`  price: ₹${product.price.toLocaleString('en-IN')}`)
  console.log(`  category: ${product.category}`)
  console.log(`  collections: ${product.collections.join(', ')}`)
  console.log(`  images: ${product.images.length}`)
  console.log(`  primary: ${product.image}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
