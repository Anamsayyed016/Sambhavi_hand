/**
 * Idempotent seed — imports from existing frontend data sources.
 *
 * Stock defaults (NOT real inventory — update via admin later):
 * - IN_STOCK      → 10
 * - LOW_STOCK     → 3
 * - MADE_TO_ORDER → 0
 *
 * SKU defaults: "SH-" + slug uppercased (provisional until admin sets real SKUs).
 * featured: always false (no featured flag in current frontend data).
 * active: always true.
 */
import { PrismaClient, ProductAvailability } from '@prisma/client'
import { products } from '../lib/products'
import { categoryGroups, legacyCollectionSlugs } from '../lib/categories'

const prisma = new PrismaClient()

function mapAvailability(
  value: (typeof products)[number]['availability'],
): ProductAvailability {
  switch (value) {
    case 'In Stock':
      return ProductAvailability.IN_STOCK
    case 'Low Stock':
      return ProductAvailability.LOW_STOCK
    case 'Made to Order':
      return ProductAvailability.MADE_TO_ORDER
    default:
      return ProductAvailability.IN_STOCK
  }
}

function stockFor(availability: ProductAvailability): number {
  switch (availability) {
    case ProductAvailability.IN_STOCK:
      return 10
    case ProductAvailability.LOW_STOCK:
      return 3
    case ProductAvailability.MADE_TO_ORDER:
      return 0
    default:
      return 0
  }
}

function skuFor(slug: string): string {
  return `SH-${slug.toUpperCase()}`
}

function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/** Collections for admin DB — derived from categories + product collection tags. */
function buildSeedCollections(): {
  slug: string
  name: string
  description: string
  image: string
}[] {
  const bySlug = new Map<string, { slug: string; name: string; description: string; image: string }>()

  for (const group of categoryGroups) {
    bySlug.set(group.slug, {
      slug: group.slug,
      name: group.name,
      description: `${group.name} sarees.`,
      image: '/images/collection-silk.png',
    })
    for (const category of group.categories) {
      bySlug.set(category.slug, {
        slug: category.slug,
        name: category.name,
        description: `Browse ${category.name} sarees.`,
        image: '/images/collection-silk.png',
      })
    }
  }

  for (const slug of legacyCollectionSlugs) {
    if (!bySlug.has(slug)) {
      bySlug.set(slug, {
        slug,
        name: titleFromSlug(slug),
        description: `${titleFromSlug(slug)} collection.`,
        image: '/images/collection-silk.png',
      })
    }
  }

  for (const product of products) {
    for (const slug of product.collections) {
      if (!bySlug.has(slug)) {
        bySlug.set(slug, {
          slug,
          name: titleFromSlug(slug),
          description: `${titleFromSlug(slug)} collection.`,
          image: product.image,
        })
      }
    }
  }

  return [...bySlug.values()]
}

async function main() {
  const collections = buildSeedCollections()

  for (const collection of collections) {
    await prisma.collection.upsert({
      where: { slug: collection.slug },
      create: {
        slug: collection.slug,
        name: collection.name,
        description: collection.description,
        image: collection.image,
      },
      update: {
        name: collection.name,
        description: collection.description,
        image: collection.image,
      },
    })
  }

  for (const product of products) {
    const availability = mapAvailability(product.availability)
    const data = {
      sku: skuFor(product.slug),
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      image: product.image,
      images: product.images,
      category: product.category,
      collections: product.collections,
      fabric: product.fabric,
      weave: product.weave,
      length: product.length,
      blouse: product.blouse,
      care: product.care,
      availability,
      isNew: product.isNew ?? false,
      stock: stockFor(availability),
      active: true,
      featured: false,
    }

    await prisma.product.upsert({
      where: { slug: product.slug },
      create: {
        slug: product.slug,
        ...data,
      },
      update: {
        sku: data.sku,
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        image: data.image,
        images: data.images,
        category: data.category,
        collections: data.collections,
        fabric: data.fabric,
        weave: data.weave,
        length: data.length,
        blouse: data.blouse,
        care: data.care,
        availability: data.availability,
        isNew: data.isNew,
        // Preserve admin-managed inventory/active/featured on re-seed
      },
    })
  }

  const productCount = await prisma.product.count()
  const collectionCount = await prisma.collection.count()
  console.log(`Seed complete: ${productCount} products, ${collectionCount} collections`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
