import nodemailer from 'nodemailer'

export type SendEmailInput = {
  to: string
  subject: string
  text: string
  html?: string
}

export type SendEmailResult =
  | { ok: true; provider: 'smtp' | 'resend' | 'log' }
  | { ok: false; reason: string }

function getFromAddress(): string {
  return (
    process.env.EMAIL_FROM?.trim() ||
    process.env.SMTP_USER?.trim() ||
    'noreply@sambhavihandloom.com'
  )
}

async function sendViaResend(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) return { ok: false, reason: 'RESEND_API_KEY not configured' }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html ?? undefined,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error('[email:resend]', res.status, body.slice(0, 200))
    return { ok: false, reason: 'Resend API request failed' }
  }

  return { ok: true, provider: 'resend' }
}

async function sendViaSmtp(input: SendEmailInput): Promise<SendEmailResult> {
  const host = process.env.SMTP_HOST?.trim()
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()
  if (!host || !user || !pass) {
    return { ok: false, reason: 'SMTP not configured' }
  }

  const port = Number(process.env.SMTP_PORT?.trim() || '587')
  const secure = process.env.SMTP_SECURE === 'true' || port === 465

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })

  await transporter.sendMail({
    from: getFromAddress(),
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  })

  return { ok: true, provider: 'smtp' }
}

/**
 * Sends email via Resend (preferred) or SMTP.
 * Never throws for delivery failures — callers must not fail orders.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const to = input.to.trim()
  if (!to) return { ok: false, reason: 'Missing recipient' }

  try {
    if (process.env.RESEND_API_KEY?.trim()) {
      return await sendViaResend(input)
    }

    if (process.env.SMTP_HOST?.trim()) {
      return await sendViaSmtp(input)
    }

    if (process.env.NODE_ENV !== 'production') {
      console.info('[email:log]', {
        to,
        subject: input.subject,
        textPreview: input.text.slice(0, 120),
      })
      return { ok: true, provider: 'log' }
    }

    return { ok: false, reason: 'No email provider configured' }
  } catch (error) {
    console.error('[email]', error instanceof Error ? error.message : 'send failed')
    return { ok: false, reason: 'Email send failed' }
  }
}

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() ||
      (process.env.SMTP_HOST?.trim() &&
        process.env.SMTP_USER?.trim() &&
        process.env.SMTP_PASS?.trim()),
  )
}
