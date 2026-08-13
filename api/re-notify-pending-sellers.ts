import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { sendTransactionalEmail } from './src/lib/email'

// Re-notify serverless endpoint: queries pending sellers and emails all admins.
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase service role key is not configured for re-notify API')
}
const adminSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

// Simple rate limiter to avoid accidental mass-sends
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 2
const RATE_WINDOW_MS = 30_000

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
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Too many requests' })

  try {
    // Fetch pending sellers
    const { data: sellers, error: sellersErr } = await adminSupabase
      .from('sellers')
      .select('id, user_id, business_name, reference_no, notify_attempts')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (sellersErr) throw sellersErr
    if (!sellers || sellers.length === 0) return res.status(200).json({ reNotified: 0 })

    // Fetch admin profiles
    const { data: admins, error: adminsErr } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
    if (adminsErr) throw adminsErr
    if (!admins || admins.length === 0) {
      console.warn('re-notify: no admins found to notify')
      return res.status(200).json({ reNotified: 0, adminCount: 0 })
    }

    // For each admin, resolve email and send per-seller summary emails in batch
    const adminEmails = new Set<string>()
    for (const admin of admins) {
      try {
        const { data } = await adminSupabase.auth.admin.getUserById(admin.id)
        const email = data?.user?.email
        if (email) adminEmails.add(email)
      } catch (e) {
        console.warn('re-notify: failed to resolve admin email', admin.id, e)
      }
    }

    if (adminEmails.size === 0) {
      console.warn('re-notify: no admin emails resolved')
      return res.status(200).json({ reNotified: 0, adminCount: admins.length })
    }

    const results: Array<{ sellerId: string; sentTo: number; errors?: any[] }> = []

    // Helper: send with retries
    async function sendWithRetries(email: string, subject: string, html: string) {
      const MAX = 3
      let attempt = 0
      while (attempt < MAX) {
        try {
          await sendTransactionalEmail({ to: email, subject, html })
          return { ok: true }
        } catch (err: any) {
          attempt++
          console.warn(`re-notify: attempt ${attempt} failed for ${email}`, String(err))
          if (attempt >= MAX) return { ok: false, error: String(err) }
        }
      }
      return { ok: false, error: 'unknown' }
    }

    // Send one email per seller to all admins (to keep audit and per-seller context clear)
    for (const s of sellers) {
      const subject = `Pending seller application — ${s.business_name || 'Untitled'} (${s.reference_no || s.id})`
      const html = `<p>A seller application is pending review:</p>
        <ul>
          <li><strong>Business:</strong> ${s.business_name || '—'}</li>
          <li><strong>Ref:</strong> ${s.reference_no || s.id}</li>
          <li><strong>Seller ID:</strong> ${s.id}</li>
        </ul>
        <p>Review it in the admin Stores tab.</p>`

      const perSellerErrors: any[] = []
      for (const email of adminEmails) {
        const r = await sendWithRetries(email, subject, html)
        if (!r.ok) {
          perSellerErrors.push({ email, error: r.error })
        }
      }

      // persist attempt count and timestamp
      try {
        const next = (s.notify_attempts || 0) + 1
        await adminSupabase.from('sellers').update({ notify_attempts: next, notified_at: new Date().toISOString() }).eq('id', s.id)
      } catch (e) {
        console.warn('re-notify: failed to persist notify_attempts for', s.id, e)
      }

      results.push({ sellerId: s.id, sentTo: adminEmails.size, errors: perSellerErrors.length ? perSellerErrors : undefined })
    }

    return res.status(200).json({ reNotified: results.length, results })
  } catch (err: any) {
    console.error('re-notify-pending-sellers error', err)
    return res.status(500).json({ error: String(err) })
  }
}
