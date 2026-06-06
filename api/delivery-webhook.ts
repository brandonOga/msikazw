import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const secret = process.env.DELIVERY_WEBHOOK_SECRET
  const sigHeader = (req.headers['x-delivery-signature'] as string) || (req.headers['x-signature'] as string)
  const event = req.body

  if (secret && sigHeader) {
    try {
      const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
      const h = crypto.createHmac('sha256', secret).update(payload).digest('hex')
      if (h !== sigHeader) {
        console.warn('Invalid delivery webhook signature')
        return res.status(401).json({ ok: false })
      }
    } catch (err) {
      console.warn('Signature verification error', err)
      return res.status(400).json({ ok: false })
    }
  }

  console.log('Delivery webhook received:', event)

  // Optionally update Supabase orders if service key and identifiable order info present
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (supabaseUrl && supabaseKey) {
    try {
      const sb = createClient(supabaseUrl, supabaseKey)
      const shipmentId = event.shipmentId || event.id || event.data?.id
      const status = event.status || event.data?.status
      if (shipmentId) {
        // try to find order with this shipment id
        const { data: orders } = await sb.from('orders').select('id').eq('shipment_id', shipmentId).limit(1)
        const orderId = orders && orders[0]?.id
        if (orderId && status) {
          await sb.from('orders').update({ shipment_status: status }).eq('id', orderId)
        }
      }
    } catch (err) {
      console.warn('Supabase update failed for delivery webhook', err)
    }
  }

  return res.status(200).json({ received: true })
}
