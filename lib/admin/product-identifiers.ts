import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/admin/format'

const MAX_ATTEMPTS = 50

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Compact uppercase product code from name for SKU prefixes.
 * "Tirupati Durga Puja Special" → "TIRUPATI-DURGA"
 * "Test Sambhavi Saree" → "TEST-SAMBHAVI"
 */
export function productCodeFromName(name: string): string {
  const tokens = slugify(name).split('-').filter(Boolean)
  const picked = tokens.slice(0, 2)
  if (picked.length === 0) return 'PRODUCT'
  return picked.map((t) => t.toUpperCase().slice(0, 12)).join('-')
}

/**
 * Unique kebab-case slug from product name.
 * First available: base, then base-2, base-3, …
 */
export async function generateUniqueProductSlug(name: string): Promise<string> {
  const base = (slugify(name) || 'product').slice(0, 180)

  for (let n = 1; n <= MAX_ATTEMPTS; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`.slice(0, 200)
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })
    if (!existing) return candidate
  }

  // Extremely unlikely collision storm — append timestamp suffix.
  const fallback = `${base}-${Date.now()}`.slice(0, 200)
  return fallback
}

/**
 * Unique Sambhavi SKU: SH-{CODE}-{NNN}
 * Example: SH-TIRUPATI-DURGA-001
 */
export async function generateUniqueProductSku(name: string): Promise<string> {
  const code = productCodeFromName(name)
  const prefix = `SH-${code}-`

  const existing = await prisma.product.findMany({
    where: { sku: { startsWith: prefix } },
    select: { sku: true },
  })

  let maxSeq = 0
  const seqRe = new RegExp(`^${escapeRegExp(prefix)}(\\d+)$`)
  for (const row of existing) {
    const match = row.sku.match(seqRe)
    if (match) maxSeq = Math.max(maxSeq, Number.parseInt(match[1], 10))
  }

  for (let n = maxSeq + 1; n <= maxSeq + MAX_ATTEMPTS; n++) {
    const candidate = `${prefix}${String(n).padStart(3, '0')}`
    const taken = await prisma.product.findUnique({
      where: { sku: candidate },
      select: { id: true },
    })
    if (!taken) return candidate
  }

  return `${prefix}${Date.now().toString().slice(-6)}`
}
