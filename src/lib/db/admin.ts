import { supabase, isSupabaseConfigured } from '../supabase';
import type { SellerApplicationData, SellerApplicationStatus, Dispute, DisputeStatus } from '../../app/data/mockData';

// ── Seller Applications ───────────────────────────────────────────────────────

export async function fetchSellerApplications(): Promise<SellerApplicationData[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('sellers')
    .select('*, profiles(name, phone)')
    // Exclude the system/seed user used to populate demo products
    .neq('user_id', '00000000-0000-0000-0000-000000000000')
    .order('created_at', { ascending: false });

  if (error) { console.error('[admin] fetchSellerApplications:', error); return []; }

  return (data || []).map(row => ({
    id:           row.id as string,
    sellerName:   (row.profiles as { name: string } | null)?.name || (row.business_name as string),
    businessName: row.business_name as string,
    email:        '',
    phone:        (row.whatsapp as string) || '',
    whatsapp:     (row.whatsapp as string) || '',
    city:         (row.city as string) || '',
    address:      (row.address as string) || '',
    category:     (row.category as string) || '',
    description:  (row.description as string) || '',
    status:       (row.status as SellerApplicationStatus) || 'pending',
    submittedAt:  new Date(row.created_at as string).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
    documents:    [],
    reviewNotes:  undefined,
  }));
}

export async function updateSellerApplicationStatus(
  id: string,
  status: SellerApplicationStatus,
  reviewNotes?: string,
) {
  if (!isSupabaseConfigured) return;

  const update: Record<string, unknown> = { status };
  if (reviewNotes) update.review_notes = reviewNotes;

  const { error } = await supabase.from('sellers').update(update).eq('id', id);
  if (error) console.error('[admin] updateSellerApplicationStatus:', error);

  // If approved, also update the user's role in profiles
  if (status === 'approved' || status === 'rejected') {
    const { data: seller } = await supabase
      .from('sellers')
      .select('user_id, reference_no, profiles(name)')
      .eq('id', id)
      .single();

    if (seller?.user_id) {
      if (status === 'approved') {
        await supabase.from('profiles').update({ role: 'seller' }).eq('id', seller.user_id);
      }

      // Send status notification email (non-blocking)
      const { data: authUser } = await supabase.auth.admin.getUserById(seller.user_id).catch(() => ({ data: null }));
      const email = authUser?.user?.email;
      const name = (seller.profiles as unknown as Record<string, string> | null)?.name || 'Seller';
      const referenceNo = seller.reference_no as string;
      if (email && referenceNo && typeof window !== 'undefined') {
        fetch('/api/send-seller-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            name,
            referenceNumber: referenceNo,
            type: status === 'approved' ? 'application_approved' : 'application_rejected',
          }),
        }).catch(err => console.warn('[admin] notify email error', err));
      }
    }
  }
}

// ── Platform-wide stats ───────────────────────────────────────────────────────

export interface PlatformStats {
  totalOrders: number;
  totalRevenue: number;
  activeListings: number;
  approvedSellers: number;
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  if (!isSupabaseConfigured) return { totalOrders: 0, totalRevenue: 0, activeListings: 0, approvedSellers: 0 };

  const [ordersRes, productsRes, sellersRes] = await Promise.all([
    supabase.from('orders').select('total', { count: 'exact' }),
    supabase.from('products').select('id', { count: 'exact' }).eq('in_stock', true),
    supabase.from('sellers').select('id', { count: 'exact' }).eq('status', 'approved'),
  ]);

  const totalRevenue = ((ordersRes.data || []) as { total: number }[])
    .reduce((sum, r) => sum + Number(r.total), 0);

  return {
    totalOrders: ordersRes.count ?? 0,
    totalRevenue,
    activeListings: productsRes.count ?? 0,
    approvedSellers: sellersRes.count ?? 0,
  };
}

// ── Disputes ─────────────────────────────────────────────────────────────────

export async function fetchDisputes(): Promise<Dispute[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('disputes')
    .select('*, profiles(name), orders(total)')
    .order('created_at', { ascending: false });

  if (error) { console.error('[admin] fetchDisputes:', error); return []; }

  return (data || []).map(row => ({
    id:          row.id as string,
    orderId:     row.order_id as string,
    buyerName:   (row.profiles as { name: string } | null)?.name || 'Unknown',
    sellerName:  'Unknown',
    reason:      row.reason as Dispute['reason'],
    description: (row.description as string) || '',
    status:      (row.status as DisputeStatus) || 'open',
    createdAt:   new Date(row.created_at as string).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
    amount:      Number((row.orders as { total: number } | null)?.total) || 0,
  }));
}

export async function updateDisputeStatus(
  id: string,
  status: DisputeStatus,
  resolution?: string,
) {
  if (!isSupabaseConfigured) return;

  const update: Record<string, unknown> = { status };
  if (resolution) update.resolution = resolution;

  const { error } = await supabase.from('disputes').update(update).eq('id', id);
  if (error) console.error('[admin] updateDisputeStatus:', error);
}
