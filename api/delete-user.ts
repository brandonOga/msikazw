import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const adminSupabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const { userId, requesterId } = req.body || {}
  if (!userId || !requesterId) return res.status(400).json({ error: 'Missing fields' })
  if (userId === requesterId) return res.status(400).json({ error: 'Cannot delete yourself' })

  // Verify the requester is actually an admin
  const { data: requester } = await adminSupabase
    .from('profiles').select('role').eq('id', requesterId).single()
  if (requester?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })

  // Delete from auth.users — profile is removed automatically via CASCADE
  const { error } = await adminSupabase.auth.admin.deleteUser(userId)
  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({ deleted: true })
}
