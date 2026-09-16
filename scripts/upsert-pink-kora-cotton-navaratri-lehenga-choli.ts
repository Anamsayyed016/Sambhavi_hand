/**
 * Upserts Pink Kora Cotton Navaratri Lehenga Choli under NAVRATRI COLLECTION.
 * Idempotent — does not modify Sahajanand, Dharvi, CHHABILI, JOBANIYU, or other products.
 * Price is 0 because no MRP was provided (do not invent a price).
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1789241314/IMG-20260913-WA0116.jpg'

const DESCRIPTION = [
  "Embrace the festive spirit with Kloth Trend's exquisite Pink Kora Cotton Navaratri Lehenga Choli. This handcrafted traditional silhouette boasts attractive Gota-Lace work on the voluminous 6-meter flair lehenga, perfectly complemented by a soft cotton inner. The vibrant green hue, combined with the luxurious fabric, makes this designer party wear an ideal choice for those seeking elegant Indian ethnic boutique attire for festive celebrations.",
  '',
  'Perfect for Navaratri festivities, garba nights, or cultural events, this ensemble features a stunning Faux Georgette blouse adorned with intricate Bandhani Print and Kutchi Gamthi Patchwork, adding a touch of authentic charm. Kloth Trend ensures a seamless shopping experience with this beautiful, full-stitched lehenga choli, ready to make you shine. Enjoy the convenience of worldwide express shipping and elevate your ethnic wardrobe.',
  '',
  'LEHENGA DETAILS:',
  '✦ Fabric: Kora Cotton',
  '✦ Work: Attractive Gota-Lace',
  '✦ Inner: Cotton',
  '✦ Flair: 6 Mtr',
  '✦ Closure: Chain Attached & With Dori Drawstring',
  '✦ Waist: 42"',
  '✦ Length: 42"',
  '',
  'TOP DETAILS:',
  '✦ Fabric: Faux Georgette',
  '✦ Work: Bandhani Print work with Kutchi Gamthi Patchwork Work',
  '✦ Length: 26',
  '✦ Size: 40 Stitched (User can Alter upto 44")',
  '',
  'PACKAGE CONTAIN:',
  '✦ Lehenga',
  '✦ Top',
  '',
  'WEIGHT:',
  '✦ 1 Kg',
  '',
  'ADDITIONAL INFORMATION:',
  '✨ 100% Quality Products Only',
  '✨ Worldwide Express Shipping',
  '✨ Slight Color Variations Possible Due to Digital Photography',
  '✨ Dry Clean Recommended for Lasting Radiance',
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
    where: { slug: 'pink-kora-cotton-navaratri-lehenga-choli' },
    create: {
      slug: 'pink-kora-cotton-navaratri-lehenga-choli',
      sku: 'SH-PINK-KORA-NAVRATRI-01',
      name: 'Pink Kora Cotton Navaratri Lehenga Choli',
      description: DESCRIPTION,
      price: 0,
      originalPrice: null,
      image: IMAGE,
      images: [IMAGE],
      category: 'Navratri Collection',
      collections: ['navratri-collection'],
      fabric: 'Kora Cotton · Faux Georgette blouse',
      weave: 'Attractive Gota-Lace · Bandhani Print with Kutchi Gamthi Patchwork',
      length: 'Lehenga Length: 42" · Flair: 6 Mtr · Waist: 42"',
      blouse: 'Faux Georgette · Length: 26 · Size: 40 Stitched (alter up to 44")',
      care: 'Dry Clean Recommended · Weight: 1 Kg · Package: Lehenga, Top',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      stock: 10,
      active: true,
      featured: false,
    },
    update: {
      sku: 'SH-PINK-KORA-NAVRATRI-01',
      name: 'Pink Kora Cotton Navaratri Lehenga Choli',
      description: DESCRIPTION,
      price: 0,
      originalPrice: null,
      image: IMAGE,
      images: [IMAGE],
      category: 'Navratri Collection',
      collections: ['navratri-collection'],
      fabric: 'Kora Cotton · Faux Georgette blouse',
      weave: 'Attractive Gota-Lace · Bandhani Print with Kutchi Gamthi Patchwork',
      length: 'Lehenga Length: 42" · Flair: 6 Mtr · Waist: 42"',
      blouse: 'Faux Georgette · Length: 26 · Size: 40 Stitched (alter up to 44")',
      care: 'Dry Clean Recommended · Weight: 1 Kg · Package: Lehenga, Top',
      availability: ProductAvailability.IN_STOCK,
      isNew: true,
      active: true,
    },
  })

  console.log(`Pink Kora Cotton Navaratri ready: ${product.id}`)
  console.log(`  slug: ${product.slug}`)
  console.log(`  price: ${product.price} (no MRP provided)`)
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
