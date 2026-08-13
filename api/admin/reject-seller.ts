import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { sendTransactionalEmail } from '../../src/lib/email'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase service role key is not configured for admin API')
}
const adminSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')
  const { sellerId, reason } = req.body || {}
  if (!sellerId) return res.status(400).json({ error: 'Missing sellerId' })
  try {
    const { data: s, error: sErr } = await adminSupabase.from('sellers').select('id, user_id, business_name, reference_no').eq('id', sellerId).maybeSingle()
    if (sErr) throw sErr
    if (!s) return res.status(404).json({ error: 'Seller not found' })

    const update: Record<string, unknown> = { status: 'rejected', updated_at: new Date().toISOString() }
    if (reason) update.review_notes = reason
    await adminSupabase.from('sellers').update(update).eq('id', sellerId)

    let email: string | null = null
    try {
      const { data } = await adminSupabase.auth.admin.getUserById(s.user_id)
      email = data?.user?.email || null
    } catch (e) {
      console.warn('reject-seller: failed to resolve user', s.user_id)
    }
    if (email) {
      const subject = `Msika seller application update — ${s.reference_no || s.id}`
      const html = `<p>Hi ${s.business_name || 'Seller'},</p><p>We reviewed your seller application <strong>${s.reference_no || s.id}</strong> and were unable to approve it at this time.${reason ? `<p>Reason: ${reason}</p>` : ''}</p>`
      try {
        await sendTransactionalEmail({ to: email, subject, html })
      } catch (e) {
        console.error('reject-seller: failed to send email', e)
      }
    }

    return res.status(200).json({ ok: true })
  } catch (err: any) {
    console.error('reject-seller error', err)
    return res.status(500).json({ error: String(err) })
  }
}
