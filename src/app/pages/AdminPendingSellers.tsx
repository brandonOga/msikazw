import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

type PendingSeller = {
  id: string
  business_name: string
  reference_no: string
  created_at: string
  notify_attempts?: number
  email?: string | null
}

export function AdminPendingSellers() {
  const [sellers, setSellers] = useState<PendingSeller[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/list-pending-sellers')
      const json = await res.json()
      setSellers(json.sellers || [])
    } catch (e) {
      toast.error('Failed to load pending sellers')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const reNotify = async (s: PendingSeller) => {
    try {
      const res = await fetch('/api/notify-admins-new-seller', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessName: s.business_name, referenceNumber: s.reference_no || s.id }) })
      const j = await res.json()
      if (res.ok) {
        toast.success('Re-notified admins')
        load()
      } else {
        toast.error(j.error || 'Failed to re-notify')
      }
    } catch (e) {
      toast.error('Failed to re-notify')
    }
  }

  const approve = async (s: PendingSeller) => {
    try {
      const res = await fetch('/api/admin/approve-seller', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sellerId: s.id }) })
      const j = await res.json()
      if (res.ok) {
        toast.success('Seller approved')
        load()
      } else {
        toast.error(j.error || 'Failed to approve')
      }
    } catch (e) {
      toast.error('Failed to approve')
    }
  }

  const reject = async (s: PendingSeller) => {
    const reason = window.prompt('Optional rejection reason') || ''
    try {
      const res = await fetch('/api/admin/reject-seller', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sellerId: s.id, reason }) })
      const j = await res.json()
      if (res.ok) {
        toast('Seller rejected')
        load()
      } else {
        toast.error(j.error || 'Failed to reject')
      }
    } catch (e) {
      toast.error('Failed to reject')
    }
  }

  return (
    <div className="p-6 max-w-6xl">
      <h2 className="text-lg font-semibold mb-4">Pending Seller Applications</h2>
      {loading ? <p>Loading…</p> : (
        <table className="w-full bg-white border rounded-lg overflow-hidden">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Business</th>
              <th className="p-3">Reference</th>
              <th className="p-3">Email</th>
              <th className="p-3">Submitted</th>
              <th className="p-3">Notified</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map(s => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{s.business_name}</td>
                <td className="p-3">{s.reference_no}</td>
                <td className="p-3">{s.email || '—'}</td>
                <td className="p-3">{new Date(s.created_at).toLocaleString()}</td>
                <td className="p-3">{s.notify_attempts || 0}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => reNotify(s)} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded">Re-notify</button>
                  <button onClick={() => approve(s)} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                  <button onClick={() => reject(s)} className="px-3 py-1 bg-red-100 text-red-800 rounded">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
