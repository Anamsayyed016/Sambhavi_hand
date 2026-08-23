import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const storeSettingsPatchSchema = z.object({
  storeName: z.string().trim().min(1).max(200).optional(),
  storeEmail: z.string().trim().email().max(320).optional().or(z.literal('')),
  storePhone: z.string().trim().max(30).optional(),
  storeAddress: z.string().trim().max(500).optional(),
  currency: z.string().trim().max(10).optional(),
  timezone: z.string().trim().max(80).optional(),
  shippingFee: z.coerce.number().int().min(0).max(100_000).optional(),
  freeShippingThreshold: z.coerce.number().int().min(0).max(10_000_000).optional(),
})

export const adminProfilePatchSchema = z.object({
  name: z.string().trim().min(2).max(120),
})

export const adminPasswordPatchSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12).max(200),
})

export async function getStoreSettings() {
  let settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } })
  if (!settings) {
    settings = await prisma.storeSettings.create({ data: { id: 'default' } })
  }
  return settings
}

export async function updateStoreSettings(data: z.infer<typeof storeSettingsPatchSchema>) {
  await getStoreSettings()
  return prisma.storeSettings.update({
    where: { id: 'default' },
    data,
  })
}

export async function updateAdminProfile(adminId: string, name: string) {
  return prisma.adminUser.update({
    where: { id: adminId },
    data: { name },
    select: { id: true, email: true, name: true },
  })
}
