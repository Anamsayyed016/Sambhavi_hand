/**
 * Upserts Ethereal Handwoven Muslin Jamdani Sarees under NAVRATRI COLLECTION.
 * Idempotent — does not modify Navratri Handloom Saree, Dharvi, CHHABILI,
 * JOBANIYU, Lehenga, or any other products.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789537450/file_0000000030ac81faa0ff733fd2d20445.png'

const IMAGES: string[] = [
  IMAGE,
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789537449/file_00000000e68881fabf733d37945197e3.png',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789537448/file_0000000015ec81fa8bb376e820ebb60f.png',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789537448/file_00000000860481faafaf28dffd333dbd.png',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789537447/file_00000000f45481fa856f1fe7c39e9b1c.png',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789537447/file_000000004d2481fa958fc8dd448abe7d.png',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789537447/file_00000000552881faa04c5a2ca43b1894.png',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789537446/file_00000000f5cc81fab317bdab3a12b565.png',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789537445/file_000000002de481f6a6d263f0292cb0b6.png',
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789537445/file_000000008e8081f58b38269648d66a2f.png',
]

const DESCRIPTION =
  'Ethereal handwoven Muslin Jamdani sarees crafted from an ultra-lightweight, semi-transparent premium fabric that offers a breezy and fluid drape. Perfect for festive occasions'

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
    where: { slug: 'ethereal-handwoven-muslin-jamdani-sarees' },
    create: {
      slug: 'ethereal-handwoven-muslin-jamdani-sarees',
      sku: 'SH-ETHEREAL-JAMDANI-01',
      name: 'Ethereal Handwoven Muslin Jamdani Sarees',
      description: DESCRIPTION,
      price: 1899,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'Navratri Collection',
      collections: ['navratri-collection'],
      fabric: 'Ultra-lightweight, semi-transparent premium fabric',
      weave: 'Handwoven Muslin Jamdani',
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
      sku: 'SH-ETHEREAL-JAMDANI-01',
      name: 'Ethereal Handwoven Muslin Jamdani Sarees',
      description: DESCRIPTION,
      price: 1899,
      originalPrice: null,
      image: IMAGE,
      images: IMAGES,
      category: 'Navratri Collection',
      collections: ['navratri-collection'],
      fabric: 'Ultra-lightweight, semi-transparent premium fabric',
      weave: 'Handwoven Muslin Jamdani',
      length: 'See product description',
      blouse: 'See product description',
      care: 'See product description',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(`Ethereal Jamdani product ready: ${product.id}`)
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
