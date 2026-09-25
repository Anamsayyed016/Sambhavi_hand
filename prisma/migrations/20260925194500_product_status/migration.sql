-- Phase 2.1: Additive ProductStatus lifecycle (keep Product.active as compatibility mirror).
-- Backfill: active=true -> ACTIVE; active=false -> ARCHIVED.
-- No deletes, truncates, or drops.

CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- Add column with temporary default so existing rows are valid, then backfill from active.
ALTER TABLE "Product" ADD COLUMN "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE';

UPDATE "Product" SET "status" = 'ACTIVE' WHERE "active" = true;
UPDATE "Product" SET "status" = 'ARCHIVED' WHERE "active" = false;

CREATE INDEX "Product_status_idx" ON "Product"("status");
