/**
 * Upserts Off-White Lehenga Set under NAVRATRI COLLECTION.
 * Idempotent — does not modify Sahajanand, other lehenga, or Navratri products.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789241317/IMG-20260913-WA0065.jpg'

const IMAGES: string[] = [
  IMAGE,
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789241323/IMG-20260913-WA0068.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789241321/IMG-20260913-WA0064.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789241320/IMG-20260913-WA0067.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789241320/IMG-20260913-WA0069.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789241317/IMG-20260913-WA0066.jpg',
]

const DESCRIPTION = [
  'Crafted from pure cotton with detailed embroidery work, this off-white lehenga set is the perfect blend of elegance and tradition. Featuring a layered ruffle flair lehenga, an embroidered blouse, and a matching embroidered koti, this set is an ideal pick for Navratri Garba, festive events, cultural functions, and weddings.',
  '',
  'LEHENGA (SKIRT):',
  '✦ Fabric: Pure Cotton',
  '✦ Work: Intricate Embroidery Work with Canvas Finishing',
  '✦ Closure: Drawstring with Latkan',
  '✦ Inner: Soft Micro Cotton',
  '✦ Flair: 7 meters (Three-Layer Ruffle Design for Grand Volume)',
  '✦ Length: 42 inches',
  '',
  'BLOUSE (CHOLI):',
  '✦ Fabric: Pure Cotton',
  '✦ Work: Embroidered Neckline Detailing',
  '✦ Size: Fully Stitched, Free Size (Fits up to XXL)',
  '',
  'KOTI (JACKET):',
  '✦ Fabric: Pure Cotton',
  '✦ Work: Embroidery Work',
  '✦ Size: Fits up to XXL',
  '',
  'OTHER DETAILS:',
  '✦ Color: Off-White',
  '✦ Weight: Approx. 1 kg',
  '✦ Package Contains: Lehenga + Blouse + Koti + Drawstring',
  '✦ Style: Ready-to-Wear Premium Quality Set',
  '',
  'KEY HIGHLIGHTS:',
  '✦ Premium pure cotton lehenga choli with embroidery work',
  '✦ Elegant three-layer ruffle lehenga with 7-meter flair',
  '✦ Designer embroidered blouse & matching koti jacket',
  '✦ Lightweight & comfortable with micro cotton lining',
  '✦ Perfect for Navratri Garba nights, festive functions, weddings & cultural occasions',
  '✦ Premium Quality | Ready to Ship | Beware of Low-Quality Imitations',
].join('\n')

async function main() {
  await prisma.collection.upsert({
    where: { slug: 'navratri-collection' },
    create: {
      slug: 'navratri-collection',
      name: 'Navratri Collection',
      description: 'Festive Navratri Collection.',
      image: IMAGE,
      active: true,
      featured: false,
    },
    update: {
      active: true,
    },
  })

  const product = await prisma.product.upsert({
    where: { slug: 'off-white-lehenga-set' },
    create: {
      slug: 'off-white-lehenga-set',
      sku: 'SH-OFF-WHITE-LEHENGA-01',
      name: 'Off-White Lehenga Set',
      description: DESCRIPTION,
      price: 2999,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'Navratri Collection',
      collections: ['navratri-collection'],
      fabric: 'Pure Cotton',
      weave: 'Intricate Embroidery Work with Canvas Finishing',
      length: '42 inches · Flair: 7 meters (Three-Layer Ruffle)',
      blouse: 'Pure Cotton Embroidered · Fully Stitched Free Size (Fits up to XXL)',
      care: 'Weight: Approx. 1 kg · Package: Lehenga + Blouse + Koti + Drawstring · Ready to Ship',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      sku: 'SH-OFF-WHITE-LEHENGA-01',
      name: 'Off-White Lehenga Set',
      description: DESCRIPTION,
      price: 2999,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'Navratri Collection',
      collections: ['navratri-collection'],
      fabric: 'Pure Cotton',
      weave: 'Intricate Embroidery Work with Canvas Finishing',
      length: '42 inches · Flair: 7 meters (Three-Layer Ruffle)',
      blouse: 'Pure Cotton Embroidered · Fully Stitched Free Size (Fits up to XXL)',
      care: 'Weight: Approx. 1 kg · Package: Lehenga + Blouse + Koti + Drawstring · Ready to Ship',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(`Off-White Lehenga Set ready: ${product.id}`)
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
