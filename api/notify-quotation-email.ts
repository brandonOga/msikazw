import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { sendTransactionalEmail } from '../src/lib/email'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase service role key is not configured for quotation email API')
}
const adminSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const { event, ...data } = req.body || {}
  if (!event) return res.status(400).json({ error: 'Missing event' })

  try {
    if (event === 'new_request') {
      // Email seller when a buyer submits a new quotation request.
      // Requires: productId, buyerName, productName, quantity
      const { productId, buyerName, productName, quantity } = data
      if (!productId) return res.status(400).json({ error: 'Missing productId' })

      const { data: product } = await adminSupabase
        .from('products')
        .select('seller_id')
        .eq('id', productId)
        .maybeSingle()

      if (!product?.seller_id) return res.status(404).json({ error: 'Product/seller not found' })

      const { data: seller } = await adminSupabase
        .from('sellers')
        .select('user_id, business_name')
        .eq('id', product.seller_id)
        .maybeSingle()

      if (!seller?.user_id) return res.status(404).json({ error: 'Seller not found' })

      const { data: authUser } = await adminSupabase.auth.admin.getUserById(seller.user_id)
      const email = authUser?.user?.email
      if (!email) return res.status(200).json({ ok: true, skipped: 'no-email' })

      await sendTransactionalEmail({
        to: email,
        subject: `New quotation request — ${productName}`,
        html: `<p>Hi ${seller.business_name || 'Seller'},</p><p><strong>${buyerName}</strong> requested a quote for <strong>"${productName}"</strong> (qty: ${quantity || 1}).</p><p>Log in to your seller dashboard to view and respond to quotation requests.</p><p>— Msika Team</p>`,
      })

      return res.status(200).json({ ok: true })
    }

    if (event === 'status_change') {
      // Email buyer when seller changes quotation status.
      // Requires: quotationId, status
      const { quotationId, status } = data
      if (!quotationId || !status) return res.status(400).json({ error: 'Missing quotationId or status' })

      const { data: quotation } = await adminSupabase
        .from('quotations')
        .select('buyer_id, product_name, buyer_name')
        .eq('id', quotationId)
        .maybeSingle()

      if (!quotation?.buyer_id) return res.status(404).json({ error: 'Quotation not found' })

      const { data: authUser } = await adminSupabase.auth.admin.getUserById(quotation.buyer_id)
      const email = authUser?.user?.email
      if (!email) return res.status(200).json({ ok: true, skipped: 'no-email' })

      let subject: string
      let html: string
      const productName = quotation.product_name
      const buyerName = quotation.buyer_name

      if (status === 'declined') {
        subject = `Quotation declined — ${productName}`
        html = `<p>Hi ${buyerName},</p><p>The seller has <strong>declined</strong> your quotation request for <strong>"${productName}"</strong>.</p><p>You can browse similar products on Msika.</p><p>— Msika Team</p>`
      } else if (status === 'accepted') {
        subject = `Quotation accepted — ${productName}`
        html = `<p>Hi ${buyerName},</p><p>Great news! The seller has <strong>accepted</strong> your quotation request for <strong>"${productName}"</strong>.</p><p>Log in to your dashboard to view the details and proceed.</p><p>— Msika Team</p>`
      } else if (status === 'replied') {
        subject = `Quotation update — ${productName}`
        html = `<p>Hi ${buyerName},</p><p>The seller has responded to your quotation request for <strong>"${productName}"</strong>.</p><p>Log in to your dashboard to view their response.</p><p>— Msika Team</p>`
      } else {
        return res.status(200).json({ ok: true, skipped: 'unknown-status' })
      }

      await sendTransactionalEmail({ to: email, subject, html })
      return res.status(200).json({ ok: true })
    }

    return res.status(400).json({ error: `Unknown event: ${event}` })
  } catch (err: any) {
    console.error('notify-quotation-email error', err)
    return res.status(500).json({ error: String(err) })
  }
}
