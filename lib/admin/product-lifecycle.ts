/**
 * Product lifecycle mutations — Product.status is the only source of truth.
 * Product.active is a temporary compatibility mirror and must never be written independently.
 */

import 'server-only'

import { ProductStatus, type Product, type Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { activeMirrorForStatus } from '@/lib/admin/product-status'

export {
  ProductStatus,
  activeMirrorForStatus,
  isStorefrontSellableStatus,
  statusFromActiveFlag,
  storefrontActiveProductWhere,
} from '@/lib/admin/product-status'

export type SetProductStatusOptions = {
  /** Optional Prisma transaction client. */
  tx?: Prisma.TransactionClient
}

/**
 * Single approved lifecycle mutation path.
 * Updates status + active mirror in one write.
 */
export async function setProductStatus(
  productId: string,
  status: ProductStatus,
  options?: SetProductStatusOptions,
): Promise<Product> {
  const db = options?.tx ?? prisma
  return db.product.update({
    where: { id: productId },
    data: {
      status,
      active: activeMirrorForStatus(status),
    },
  })
}

/**
 * Bulk lifecycle update — always sets status + active together.
 */
export async function setProductsStatus(
  productIds: string[],
  status: ProductStatus,
): Promise<number> {
  if (productIds.length === 0) return 0
  const result = await prisma.product.updateMany({
    where: { id: { in: productIds } },
    data: {
      status,
      active: activeMirrorForStatus(status),
    },
  })
  return result.count
}
