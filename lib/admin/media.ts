import { prisma } from '@/lib/prisma'

export async function listMediaPaths(): Promise<string[]> {
  const products = await prisma.product.findMany({
    select: { image: true, images: true },
  })
  const collections = await prisma.collection.findMany({ select: { image: true } })

  const set = new Set<string>()
  for (const p of products) {
    if (p.image) set.add(p.image)
    for (const img of p.images) set.add(img)
  }
  for (const c of collections) {
    if (c.image) set.add(c.image)
  }

  return Array.from(set).sort()
}
