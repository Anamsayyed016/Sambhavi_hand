/**
 * Stock policy:
 * - Validate available stock for IN_STOCK / LOW_STOCK products at checkout
 * - MADE_TO_ORDER may checkout with stock = 0
 * - Decrement stock only after Razorpay payment is verified server-side
 */

export class CheckoutError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'CheckoutError'
    this.status = status
  }
}

export function checkoutErrorResponse(error: unknown): Response {
  if (error instanceof CheckoutError) {
    return Response.json({ error: error.message }, { status: error.status })
  }
  console.error('[checkout]', error instanceof Error ? error.message : 'error')
  return Response.json(
    { error: 'Unable to place your order. Please try again.' },
    { status: 500 },
  )
}

/** Apex + www aliases so Origin/Host mismatches (common with dual-domain Hostinger setups) do not block checkout. */
function hostAliases(hostHeader: string): string[] {
  const bare = hostHeader.split(':')[0]?.toLowerCase()
  if (!bare) return []
  const aliases = new Set<string>([bare])
  if (bare.startsWith('www.')) {
    aliases.add(bare.slice(4))
  } else {
    aliases.add(`www.${bare}`)
  }
  return [...aliases]
}

function expectedOriginsForHost(hostHeader: string): string[] {
  return hostAliases(hostHeader).flatMap((host) => [`https://${host}`, `http://${host}`])
}

export function assertCheckoutOrigin(request: Request): void {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')

  if (!host) {
    throw new CheckoutError('Invalid request', 403)
  }

  const expected = expectedOriginsForHost(host)

  if (origin) {
    if (!expected.some((value) => origin === value)) {
      throw new CheckoutError('Invalid request', 403)
    }
    return
  }

  if (referer) {
    if (!expected.some((value) => referer.startsWith(`${value}/`) || referer === value)) {
      throw new CheckoutError('Invalid request', 403)
    }
  }
}
