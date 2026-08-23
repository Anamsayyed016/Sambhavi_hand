type IdempotencyEntry = {
  orderNumber: string
  orderId: string
  total: number
  expiresAt: number
}

const store = new Map<string, IdempotencyEntry>()
const TTL_MS = 15 * 60 * 1000

export function getIdempotentCheckoutResult(key: string): Omit<IdempotencyEntry, 'expiresAt'> | null {
  const entry = store.get(key)
  if (!entry) return null
  if (entry.expiresAt <= Date.now()) {
    store.delete(key)
    return null
  }
  return {
    orderNumber: entry.orderNumber,
    orderId: entry.orderId,
    total: entry.total,
  }
}

export function saveIdempotentCheckoutResult(
  key: string,
  result: { orderNumber: string; orderId: string; total: number },
): void {
  store.set(key, { ...result, expiresAt: Date.now() + TTL_MS })
}
