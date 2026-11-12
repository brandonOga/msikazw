import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { sendTransactionalEmail } from '../src/lib/email'

// Service-role client: admin emails live in auth.users, and `profiles` RLS only
// lets a user read their own row — resolving "all admin emails" has to happen
// server-side with elevated privileges (same pattern as api/delete-user.ts).
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase service role key is not configured for admin notification API')
}
const adminSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
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
      .select('id, name, email')
      .eq('role', 'admin')
    if (error) throw error
    if (!admins || admins.length === 0) {
      console.warn('notify-admins-new-seller: no admins found to notify')
      return res.status(200).json({ sent: true, adminCount: 0 })
    }

    const subject = `New seller application — ${businessName}`
    const html = `<p>${businessName} just applied to become a seller on Msika (ref: <strong>${referenceNumber}</strong>).</p><p>Review it in the admin dashboard's Stores tab.</p>`

    // Helper: send with retries
    async function sendWithRetries(email: string) {
      const MAX = 3
      let attempt = 0
      while (attempt < MAX) {
        try {
          await sendTransactionalEmail({ to: email, subject, html })
          return { ok: true }
        } catch (err: any) {
          attempt++
          console.warn(`notify-admins-new-seller: attempt ${attempt} failed for ${email}`, String(err))
          if (attempt >= MAX) return { ok: false, error: String(err) }
        }
      }
      return { ok: false, error: 'unknown' }
    }

    const results = await Promise.all((admins || []).map(async admin => {
      try {
        const email = (admin as unknown as { email: string }).email
        if (!email) return { adminId: admin.id, ok: false, error: 'no-email' }
        const r = await sendWithRetries(email)
        return { adminId: admin.id, ok: r.ok, error: r.error }
      } catch (err: any) {
        return { adminId: admin.id, ok: false, error: String(err) }
      }
    }))

    const failed = results.filter(r => !r.ok)
    if (failed.length > 0) console.warn('notify-admins-new-seller: some admin emails failed', failed)

    // Persist notification attempt to the sellers row (if reference exists)
    try {
      const { data: seller } = await adminSupabase
        .from('sellers')
        .select('id, notify_attempts')
        .eq('reference_no', referenceNumber)
        .maybeSingle()
      if (seller && seller.id) {
        const next = (seller.notify_attempts || 0) + 1
        await adminSupabase.from('sellers').update({ notify_attempts: next, notified_at: new Date().toISOString() }).eq('id', seller.id)
      }
    } catch (e) {
      console.warn('notify-admins-new-seller: failed to persist notify_attempts', e)
    }

    return res.status(200).json({ sent: true, adminCount: admins?.length || 0, failures: failed })
  } catch (err: any) {
    console.error('notify-admins-new-seller error', err)
    return res.status(500).json({ error: String(err) })
  }
}
