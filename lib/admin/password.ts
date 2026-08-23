import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import bcrypt from 'bcryptjs'

const BCRYPT_ROUNDS = 12

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash)
}

/** Opaque session token for the cookie (never stored raw in DB). */
export function createSessionToken(): string {
  return randomBytes(32).toString('base64url')
}

/**
 * Hash session token for DB storage.
 * Peppers with ADMIN_SESSION_SECRET when configured.
 */
export function hashSessionToken(token: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET ?? ''
  return createHash('sha256').update(`${secret}:${token}`).digest('hex')
}

export function safeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}
