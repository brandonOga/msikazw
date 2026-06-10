import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendTransactionalEmail } from '../src/lib/email'

// Simple in-memory rate limiter: max 5 requests per IP per 60 seconds
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

type EmailType = 'application_received' | 'application_approved' | 'application_rejected'

function buildEmail(type: EmailType, name: string, referenceNumber: string): { subject: string; html: string } {
  switch (type) {
    case 'application_approved':
      return {
        subject: `🎉 Your Msika seller account is approved — ${referenceNumber}`,
        html: `<p>Hi ${name},</p><p>Great news! Your seller application <strong>${referenceNumber}</strong> has been <strong>approved</strong>.</p><p>Your store is now live on Msika. Log in to your seller dashboard to start listing products.</p><p>— Msika Team</p>`,
      }
    case 'application_rejected':
      return {
        subject: `Msika seller application update — ${referenceNumber}`,
        html: `<p>Hi ${name},</p><p>We reviewed your seller application <strong>${referenceNumber}</strong> and unfortunately were unable to approve it at this time.</p><p>Please ensure your business documents are up to date and reapply. If you have questions, reply to this email.</p><p>— Msika Team</p>`,
      }
    default:
      return {
        subject: `Msika seller application received — ${referenceNumber}`,
        html: `<p>Hi ${name},</p><p>Thanks for applying to be a seller on Msika. Your application <strong>${referenceNumber}</strong> has been received and is under review.</p><p>We'll notify you within 1–2 business days.</p><p>— Msika Team</p>`,
      }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const ip = (req.headers['x-forwarded-for'] as string || '').split(',')[0].trim() || 'unknown'
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests' })
  }

  const { to, name, referenceNumber, type = 'application_received' } = req.body || {}
  if (!to || !name || !referenceNumber) return res.status(400).json({ error: 'Missing fields' })

  try {
    const { subject, html } = buildEmail(type as EmailType, name, referenceNumber)
    await sendTransactionalEmail({ to, subject, html })
    return res.status(200).json({ sent: true })
  } catch (err: any) {
    console.error('send-seller-email error', err)
    return res.status(500).json({ error: String(err) })
  }
}
