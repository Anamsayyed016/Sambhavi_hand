/**
 * One-time / idempotent admin bootstrap.
 *
 * Usage:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME="..." pnpm admin:create
 *
 * - Creates the admin if the email does not exist
 * - Skips if the email already exists (does not reset password)
 * - Never prints the password
 */
import { prisma } from '../lib/prisma'
import { hashPassword } from '../lib/admin/password'

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME?.trim() || 'Sambhavi Admin'

  if (!email || !password) {
    console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variables.')
    process.exit(1)
  }

  if (password.length < 12) {
    console.error('ADMIN_PASSWORD must be at least 12 characters.')
    process.exit(1)
  }

  const existing = await prisma.adminUser.findUnique({
    where: { email },
    select: { id: true, email: true },
  })

  if (existing) {
    console.log(`Admin already exists for ${existing.email} — skipping (idempotent).`)
    return
  }

  const passwordHash = await hashPassword(password)

  const admin = await prisma.adminUser.create({
    data: {
      email,
      name,
      passwordHash,
      active: true,
    },
    select: { id: true, email: true, name: true },
  })

  console.log(`Created admin ${admin.email} (${admin.name}).`)
}

main()
  .catch((error) => {
    console.error('Failed to create admin:', error instanceof Error ? error.message : 'error')
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
