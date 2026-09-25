/**
 * Product status helpers — pure, safe to import from scripts/tests.
 * Lifecycle DB writes live in product-lifecycle.ts (server-only).
 */

import { ProductStatus } from '@prisma/client'

export { ProductStatus }

export const LOW_STOCK_THRESHOLD = 3

/** Compatibility mirror: ACTIVE => true; DRAFT/ARCHIVED => false. */
export function activeMirrorForStatus(status: ProductStatus): boolean {
  return status === ProductStatus.ACTIVE
}

/** Map legacy boolean checkbox / bulk flag to authoritative status. */
export function statusFromActiveFlag(active: boolean): ProductStatus {
  return active ? ProductStatus.ACTIVE : ProductStatus.ARCHIVED
}

export function isStorefrontSellableStatus(status: ProductStatus): boolean {
  return status === ProductStatus.ACTIVE
}

/** Prisma-compatible where clause for publicly sellable products. */
export const storefrontActiveProductWhere = {
  status: ProductStatus.ACTIVE,
} as const
