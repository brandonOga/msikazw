import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const secret = process.env.EMAIL_WEBHOOK_SECRET
  const sigHeader = (req.headers['x-email-signature'] as string) || (req.headers['x-signature'] as string)
  const event = req.body

  if (secret && sigHeader) {
    try {
      const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
      const h = crypto.createHmac('sha256', secret).update(payload).digest('hex')
      if (h !== sigHeader) {
        console.warn('Invalid email webhook signature')
        return res.status(401).json({ ok: false })
      }
    } catch (err) {
      console.warn('Signature verification error', err)
      return res.status(400).json({ ok: false })
    }
  }

  const eventType: string = event?.event || event?.type || ''
  console.log('Email webhook received:', eventType, event)

  // Handle SendGrid event types
  if (eventType === 'bounce' || eventType === 'blocked') {
    const email: string = event?.email || ''
    console.warn(`[email-webhook] Bounce/block for ${email}:`, event?.reason || event?.status)
    // TODO: record bounced address in DB to suppress future sends
  } else if (eventType === 'spamreport' || eventType === 'unsubscribe') {
    const email: string = event?.email || ''
    console.warn(`[email-webhook] Unsubscribe/spam report for ${email}`)
    // TODO: record unsubscribe in DB and honour in sendTransactionalEmail
  }

  res.status(200).json({ received: true })
}
