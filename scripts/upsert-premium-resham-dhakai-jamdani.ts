/**
 * Upserts Premium Resham Dhakai Jamdani Saree under NAVRATRI COLLECTION.
 * Idempotent — does not modify other Navratri or catalog products.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789500075/IMG-20260914-WA0441.jpg'

const IMAGES: string[] = [
  IMAGE,
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789500074/IMG-20260914-WA0448.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789500072/IMG-20260914-WA0443.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789500074/IMG-20260914-WA0447.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789500074/IMG-20260914-WA0442.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789500074/IMG-20260914-WA0436.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789500073/IMG-20260914-WA0439.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789500072/IMG-20260914-WA0444.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789500072/IMG-20260914-WA0437.jpg',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789500072/IMG-20260914-WA0440.jpg',
]

const DESCRIPTION = [
  '✦ With Running Blouse Piece',
  '',
  '✦ Beautiful Allover Weaving Work',
  '',
  '✦ Finely Crafted with Premium Finishing',
  '',
  '🩵 Quality Superior to Any Regular Dhakai Saree Available in the Market.',
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
    where: { slug: 'premium-resham-dhakai-jamdani-saree' },
    create: {
      slug: 'premium-resham-dhakai-jamdani-saree',
      sku: 'SH-DHAKAI-JAMDANI-01',
      name: 'Premium Resham Dhakai Jamdani Saree',
      description: DESCRIPTION,
      price: 1470,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'Navratri Collection',
      collections: ['navratri-collection'],
      fabric: 'Premium Resham Dhakai',
      weave: 'Beautiful Allover Weaving Work',
      length: 'See product description',
      blouse: 'With Running Blouse Piece',
      care: 'Quality Superior to Any Regular Dhakai Saree Available in the Market.',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      sku: 'SH-DHAKAI-JAMDANI-01',
      name: 'Premium Resham Dhakai Jamdani Saree',
      description: DESCRIPTION,
      price: 1470,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'Navratri Collection',
      collections: ['navratri-collection'],
      fabric: 'Premium Resham Dhakai',
      weave: 'Beautiful Allover Weaving Work',
      length: 'See product description',
      blouse: 'With Running Blouse Piece',
      care: 'Quality Superior to Any Regular Dhakai Saree Available in the Market.',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(`Premium Resham Dhakai Jamdani ready: ${product.id}`)
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
