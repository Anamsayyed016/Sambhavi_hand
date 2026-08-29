import { formatINR } from '@/lib/admin/format'
import { getStoreSettings } from '@/lib/admin/settings'
import { sendEmail } from '@/lib/email/send'

export type OrderEmailPayload = {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  city: string
  state: string
  postalCode: string
  country: string
  subtotal: number
  shipping: number
  total: number
  paymentStatus: string
  paymentMethod: string | null
  razorpayOrderId: string | null
  paymentId: string | null
  items: Array<{
    productName: string
    quantity: number
    price: number
    subtotal: number
  }>
}

function adminBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    ''
  return raw.replace(/\/$/, '')
}

function formatAddress(order: OrderEmailPayload): string {
  return [
    order.shippingAddress,
    `${order.city}, ${order.state} ${order.postalCode}`,
    order.country,
  ].join('\n')
}

function itemsText(order: OrderEmailPayload): string {
  return order.items
    .map(
      (item) =>
        `- ${item.productName} × ${item.quantity} @ ${formatINR(item.price)} = ${formatINR(item.subtotal)}`,
    )
    .join('\n')
}

function itemsHtml(order: OrderEmailPayload): string {
  return order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${escapeHtml(item.productName)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${formatINR(item.price)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${formatINR(item.subtotal)}</td>
        </tr>`,
    )
    .join('')
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

async function resolveAdminInbox(): Promise<string | null> {
  const fromEnv =
    process.env.ADMIN_ORDER_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    ''
  if (fromEnv) return fromEnv

  try {
    const settings = await getStoreSettings()
    if (settings.storeEmail?.trim()) return settings.storeEmail.trim()
  } catch {
    // ignore
  }
  return null
}

/** Admin alert after server-verified PAID order. Never throws. */
export async function sendAdminNewOrderEmail(order: OrderEmailPayload): Promise<void> {
  const to = await resolveAdminInbox()
  if (!to) {
    console.error('[email] Admin order email skipped: no ADMIN_ORDER_EMAIL / store email')
    return
  }

  const base = adminBaseUrl()
  const viewUrl = base ? `${base}/admin/orders/${order.id}` : `/admin/orders/${order.id}`

  const subject = `New Order Received — #${order.orderNumber}`
  const text = [
    'New order received.',
    '',
    `Order Number: ${order.orderNumber}`,
    `Customer: ${order.customerName}`,
    `Email: ${order.customerEmail}`,
    `Phone: ${order.customerPhone}`,
    '',
    'Shipping Address:',
    formatAddress(order),
    '',
    'Products:',
    itemsText(order),
    '',
    `Subtotal: ${formatINR(order.subtotal)}`,
    `Shipping: ${order.shipping === 0 ? 'FREE' : formatINR(order.shipping)}`,
    `Total: ${formatINR(order.total)}`,
    '',
    `Payment Status: ${order.paymentStatus}`,
    `Payment Method: ${order.paymentMethod ?? 'Razorpay'}`,
    `Razorpay Order ID: ${order.razorpayOrderId ?? '—'}`,
    `Razorpay Payment ID: ${order.paymentId ?? '—'}`,
    '',
    `View Order: ${viewUrl}`,
  ].join('\n')

  const html = `
    <div style="font-family:Georgia,serif;color:#2b2118;max-width:560px;">
      <h1 style="font-size:22px;">New order received</h1>
      <p><strong>#${escapeHtml(order.orderNumber)}</strong></p>
      <p>
        ${escapeHtml(order.customerName)}<br/>
        ${escapeHtml(order.customerEmail)}<br/>
        ${escapeHtml(order.customerPhone)}
      </p>
      <p style="white-space:pre-line;">${escapeHtml(formatAddress(order))}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 0;">Product</th>
            <th style="text-align:center;padding:8px 0;">Qty</th>
            <th style="text-align:right;padding:8px 0;">Price</th>
            <th style="text-align:right;padding:8px 0;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml(order)}</tbody>
      </table>
      <p>
        Subtotal: ${formatINR(order.subtotal)}<br/>
        Shipping: ${order.shipping === 0 ? 'FREE' : formatINR(order.shipping)}<br/>
        <strong>Total: ${formatINR(order.total)}</strong>
      </p>
      <p>
        Payment: ${escapeHtml(order.paymentStatus)} · ${escapeHtml(order.paymentMethod ?? 'Razorpay')}<br/>
        Razorpay Order: ${escapeHtml(order.razorpayOrderId ?? '—')}<br/>
        Razorpay Payment: ${escapeHtml(order.paymentId ?? '—')}
      </p>
      <p><a href="${escapeHtml(viewUrl)}" style="display:inline-block;background:#7a1f2b;color:#fff;padding:10px 16px;text-decoration:none;">View Order</a></p>
    </div>
  `

  const result = await sendEmail({ to, subject, text, html })
  if (!result.ok) {
    console.error('[email] Admin new-order email failed:', result.reason)
  }
}

/** Customer confirmation after server-verified PAID order. Never throws. */
export async function sendCustomerOrderConfirmationEmail(
  order: OrderEmailPayload,
): Promise<void> {
  const settings = await getStoreSettings().catch(() => null)
  const supportEmail =
    settings?.storeEmail?.trim() ||
    process.env.ADMIN_ORDER_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    ''
  const storeName = settings?.storeName?.trim() || 'Sambhavi Handloom'
  const supportPhone = settings?.storePhone?.trim() || ''

  const subject = `Order Confirmed — #${order.orderNumber}`
  const text = [
    `Thank you for your order, ${order.customerName}.`,
    '',
    `Order Number: ${order.orderNumber}`,
    `Payment Status: ${order.paymentStatus}`,
    '',
    'Items:',
    itemsText(order),
    '',
    `Subtotal: ${formatINR(order.subtotal)}`,
    `Shipping: ${order.shipping === 0 ? 'FREE' : formatINR(order.shipping)}`,
    `Total: ${formatINR(order.total)}`,
    '',
    'Shipping to:',
    formatAddress(order),
    '',
    supportEmail || supportPhone
      ? `Questions? Contact us${supportEmail ? ` at ${supportEmail}` : ''}${supportPhone ? ` · ${supportPhone}` : ''}.`
      : `Thank you for shopping with ${storeName}.`,
  ].join('\n')

  const html = `
    <div style="font-family:Georgia,serif;color:#2b2118;max-width:560px;">
      <h1 style="font-size:22px;">Order confirmed</h1>
      <p>Thank you, ${escapeHtml(order.customerName)}. Your payment was received.</p>
      <p><strong>Order #${escapeHtml(order.orderNumber)}</strong><br/>Payment: ${escapeHtml(order.paymentStatus)}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 0;">Product</th>
            <th style="text-align:center;padding:8px 0;">Qty</th>
            <th style="text-align:right;padding:8px 0;">Price</th>
            <th style="text-align:right;padding:8px 0;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml(order)}</tbody>
      </table>
      <p>
        Subtotal: ${formatINR(order.subtotal)}<br/>
        Shipping: ${order.shipping === 0 ? 'FREE' : formatINR(order.shipping)}<br/>
        <strong>Total: ${formatINR(order.total)}</strong>
      </p>
      <p style="white-space:pre-line;"><strong>Shipping address</strong><br/>${escapeHtml(formatAddress(order))}</p>
      ${
        supportEmail || supportPhone
          ? `<p>Need help? ${supportEmail ? escapeHtml(supportEmail) : ''}${supportPhone ? ` · ${escapeHtml(supportPhone)}` : ''}</p>`
          : `<p>Thank you for shopping with ${escapeHtml(storeName)}.</p>`
      }
    </div>
  `

  const result = await sendEmail({
    to: order.customerEmail,
    subject,
    text,
    html,
  })
  if (!result.ok) {
    console.error('[email] Customer confirmation email failed:', result.reason)
  }
}
