/**
 * Upserts Navratri Handloom Saree under NAVRATRI COLLECTION.
 * Idempotent — does not modify Dharvi, CHHABILI, JOBANIYU, Lehenga, or any other products.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789537375/file_0000000010e48211bb9ac2c8aee1234d.png'

const IMAGES: string[] = [
  IMAGE,
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789537374/file_0000000005588211bcb8370400629448.png',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789537375/file_00000000e7dc8211ac70bae0774bf038.png',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789537377/file_000000006dc48211b65189af7245ec65.png',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789537377/file_00000000b6908211ac984871141e8051.png',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789537380/file_0000000028448211a3cbefb74e1984a5.png',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789537374/file_0000000000f48207bfbbcfa01960fa92.png',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789537374/file_00000000828882118becbd7e03cfed8a.png',
]

const DESCRIPTION =
  'Crafted from a lightweight, breathable open-weave linen blend, it offers a crisp drape that combines traditional handloom aesthetics with comfort, making it popular for both smart casual wear and daytime festivities.'

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
      // Keep existing collection metadata; only ensure it stays active.
      active: true,
    },
  })

  const product = await prisma.product.upsert({
    where: { slug: 'navratri-handloom-saree' },
    create: {
      slug: 'navratri-handloom-saree',
      sku: 'SH-NAVRATRI-HANDLOOM-01',
      name: 'Navratri Handloom Saree',
      description: DESCRIPTION,
      price: 1499,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'Navratri Collection',
      collections: ['navratri-collection'],
      fabric: 'Lightweight, breathable open-weave linen blend',
      weave: 'Open-weave handloom',
      length: 'See product description',
      blouse: 'See product description',
      care: 'See product description',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      sku: 'SH-NAVRATRI-HANDLOOM-01',
      name: 'Navratri Handloom Saree',
      description: DESCRIPTION,
      price: 1499,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'Navratri Collection',
      collections: ['navratri-collection'],
      fabric: 'Lightweight, breathable open-weave linen blend',
      weave: 'Open-weave handloom',
      length: 'See product description',
      blouse: 'See product description',
      care: 'See product description',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(`Navratri Handloom Saree ready: ${product.id}`)
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
