import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { sendTransactionalEmail } from '../src/lib/email'

// Service-role client: admin emails live in auth.users, and `profiles` RLS only
// lets a user read their own row — resolving "all admin emails" has to happen
// server-side with elevated privileges (same pattern as api/delete-user.ts).
const adminSupabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const ip = (req.headers?.['x-forwarded-for'] as string || '').split(',')[0].trim() || 'unknown'
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests' })
  }

  const { businessName, referenceNumber } = req.body || {}
  if (!businessName || !referenceNumber) return res.status(400).json({ error: 'Missing fields' })

  try {
    const { data: admins, error } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
    if (error) throw error

    const subject = `New seller application — ${businessName}`
    const html = `<p>${businessName} just applied to become a seller on Msika (ref: <strong>${referenceNumber}</strong>).</p><p>Review it in the admin dashboard's Stores tab.</p>`

    const results = await Promise.allSettled((admins || []).map(async admin => {
      const { data } = await adminSupabase.auth.admin.getUserById(admin.id)
      const email = data?.user?.email
      if (!email) return
      await sendTransactionalEmail({ to: email, subject, html })
    }))

    const failed = results.filter(r => r.status === 'rejected')
    if (failed.length > 0) console.warn('notify-admins-new-seller: some admin emails failed', failed)

    return res.status(200).json({ sent: true, adminCount: admins?.length || 0 })
  } catch (err: any) {
    console.error('notify-admins-new-seller error', err)
    return res.status(500).json({ error: String(err) })
  }
}
