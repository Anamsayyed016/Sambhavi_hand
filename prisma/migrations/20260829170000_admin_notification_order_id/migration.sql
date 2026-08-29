-- AlterTable
ALTER TABLE "AdminNotification" ADD COLUMN IF NOT EXISTS "orderId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AdminNotification_orderId_idx" ON "AdminNotification"("orderId");
