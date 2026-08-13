import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase service role key is not configured for admin API')
}
const adminSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed')
  try {
    const { data: sellers, error } = await adminSupabase
      .from('sellers')
      .select('id, user_id, business_name, reference_no, created_at, notify_attempts')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (error) throw error

    const out = [] as any[]
    for (const s of sellers || []) {
      let email: string | null = null
      try {
        const { data } = await adminSupabase.auth.admin.getUserById(s.user_id)
        email = data?.user?.email || null
      } catch (e) {
        console.warn('list-pending-sellers: failed to resolve user', s.user_id)
      }
      out.push({ ...s, email })
    }

    return res.status(200).json({ sellers: out })
  } catch (err: any) {
    console.error('list-pending-sellers error', err)
    return res.status(500).json({ error: String(err) })
  }
}
