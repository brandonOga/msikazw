import { supabase, isSupabaseConfigured } from '../supabase';
import type { SellerApplicationData, SellerApplicationStatus, Dispute, DisputeStatus } from '../../app/data/mockData';

// ── Seller Applications ───────────────────────────────────────────────────────

export async function fetchSellerApplications(): Promise<SellerApplicationData[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('sellers')
    .select('id, user_id, business_name, business_type, category, description, whatsapp, city, location, address, status, reference_no, logo_url, created_at, profiles(name, email)')
    // Exclude the system/seed user used to populate demo products
    .neq('user_id', '00000000-0000-0000-0000-000000000000')
    .order('created_at', { ascending: false });

  if (error) { console.error('[admin] fetchSellerApplications:', error); return []; }

  return (data || []).map(row => ({
    id:           row.id as string,
    sellerName:   (row.profiles as unknown as { name: string; email: string } | null)?.name || (row.business_name as string),
    businessName: row.business_name as string,
    email:        (row.profiles as unknown as { name: string; email: string } | null)?.email || '',
    phone:        (row.whatsapp as string) || '',
    whatsapp:     (row.whatsapp as string) || '',
    city:         (row.location as string) || (row.city as string) || '',
    address:      (row.address as string) || '',
    category:     (row.category as string) || '',
    description:  (row.description as string) || '',
    status:       (row.status as SellerApplicationStatus) || 'pending',
    submittedAt:  new Date(row.created_at as string).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
    documents:    [],
    reviewNotes:  undefined,
    logo:         (row.logo_url as string) || '',
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

// ── Users ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  city: string;
  createdAt: string;
  status: 'active' | 'suspended';
}

export async function fetchUsers(): Promise<AdminUser[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, role, email, location, created_at')
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .order('created_at', { ascending: false });

  if (error) { console.error('[admin] fetchUsers:', error); return []; }

  return (data || []).map(row => ({
    id:        row.id as string,
    name:      (row.name as string) || 'Unknown',
    email:     (row.email as string) || '',
    role:      (row.role as AdminUser['role']) || 'buyer',
    city:      (row.location as string) || '',
    createdAt: new Date(row.created_at as string).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
    status:    'active',
  }));
}

export async function updateUserStatus(id: string, status: 'active' | 'suspended') {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
  if (error) console.error('[admin] updateUserStatus:', error);
}

// ── Admins ────────────────────────────────────────────────────────────────────

export interface AdminRecord {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function fetchAdmins(): Promise<AdminRecord[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, created_at')
    .eq('role', 'admin')
    .order('created_at', { ascending: true });

  if (error) { console.error('[admin] fetchAdmins:', error); return []; }

  return (data || []).map(row => ({
    id:    row.id as string,
    name:  (row.name as string) || 'Admin',
    email: (row.email as string) || '',
    role:  'Super Admin',
  }));
}

export async function addAdmin(email: string, name: string, password: string, adminRole: string): Promise<string | null> {
  if (!isSupabaseConfigured) return 'Supabase not configured';

  const { data: { session } } = await supabase.auth.getSession();
  const res = await supabase.functions.invoke('add-admin', {
    body: { email: email.toLowerCase(), name, password, adminRole },
    headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
  });

  if (res.error) return res.error.message ?? 'Failed to create admin account.';
  if (res.data?.error) return res.data.error;
  return null;
}

export async function removeAdmin(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from('profiles').update({ role: 'buyer' }).eq('id', id);
}

// ── Orders ────────────────────────────────────────────────────────────────────

export interface AdminOrder {
  id: string;
  buyer: string;
  seller: string;
  amount: number;
  status: string;
  escrowStatus: string;
  createdAt: string;
}

export async function fetchOrders(): Promise<AdminOrder[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('id, total, status, escrow_status, updated_at, profiles(name)')
    .order('updated_at', { ascending: false })
    .limit(100);

  if (error) { console.error('[admin] fetchOrders:', error); return []; }

  return (data || []).map(row => ({
    id:           String(row.id),
    buyer:        (row.profiles as unknown as { name: string } | null)?.name || 'Unknown',
    seller:       'N/A',
    amount:       Number(row.total) || 0,
    status:       (row.status as string) || 'pending',
    escrowStatus: (row.escrow_status as string) || 'funds_held',
    createdAt:    new Date(row.updated_at as string).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
  }));
}

// ── GMV chart (last 7 days) ───────────────────────────────────────────────────

export interface DayRevenue { label: string; value: number }

export async function fetchWeeklyGMV(): Promise<DayRevenue[]> {
  if (!isSupabaseConfigured) return [];

  const now = new Date();
  const since = new Date(now);
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('orders')
    .select('total, updated_at')
    .gte('updated_at', since.toISOString());

  if (error) { console.error('[admin] fetchWeeklyGMV:', error); return []; }

  const days: DayRevenue[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const value = ((data || []) as { total: number; updated_at: string }[])
      .filter(r => r.updated_at.slice(0, 10) === dateStr)
      .reduce((s, r) => s + Number(r.total), 0);
    days.push({ label: d.toLocaleDateString('en', { weekday: 'short' }), value });
  }
  return days;
}
