import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sendTransactionalEmail } from '../src/lib/email'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const { to, name, referenceNumber } = req.body || {}
  if (!to || !name || !referenceNumber) return res.status(400).json({ error: 'Missing fields' })

  try {
    const subject = `Msika seller application received — ${referenceNumber}`
    const html = `<p>Hi ${name},</p><p>Thanks for applying to be a seller on Msika. Your application <strong>${referenceNumber}</strong> has been received and is under review.</p><p>We'll notify you when your application is approved.</p><p>— Msika Team</p>`
    await sendTransactionalEmail({ to, subject, html })
    return res.status(200).json({ sent: true })
  } catch (err: any) {
    console.error('send-seller-email error', err)
    return res.status(500).json({ error: String(err) })
  }
}
