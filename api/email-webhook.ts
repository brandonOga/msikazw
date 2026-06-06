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

  // Process event: e.g., bounce, complaint, or inbound email
  console.log('Email webhook received:', event)

  res.status(200).json({ received: true })
}
