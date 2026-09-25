/**
 * Phase 2.1 — pure lifecycle helper checks (no DB required).
 * Run: pnpm exec tsx scripts/verify-product-lifecycle.ts
 */

import assert from 'node:assert/strict'
import { ProductStatus } from '@prisma/client'
import {
  activeMirrorForStatus,
  isStorefrontSellableStatus,
  statusFromActiveFlag,
} from '../lib/admin/product-status'

assert.equal(activeMirrorForStatus(ProductStatus.ACTIVE), true)
assert.equal(activeMirrorForStatus(ProductStatus.DRAFT), false)
assert.equal(activeMirrorForStatus(ProductStatus.ARCHIVED), false)

assert.equal(statusFromActiveFlag(true), ProductStatus.ACTIVE)
assert.equal(statusFromActiveFlag(false), ProductStatus.ARCHIVED)

assert.equal(isStorefrontSellableStatus(ProductStatus.ACTIVE), true)
assert.equal(isStorefrontSellableStatus(ProductStatus.DRAFT), false)
assert.equal(isStorefrontSellableStatus(ProductStatus.ARCHIVED), false)

console.log('verify-product-lifecycle: PASS')
