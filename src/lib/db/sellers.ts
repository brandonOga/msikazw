import { supabase, isSupabaseConfigured } from '../supabase';
import type { Seller } from '../../app/data/mockData';
import type { SellerApplication } from '../../app/context/StoreContext';

export async function fetchSellers(): Promise<Seller[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('sellers')
    .select('*')
    .eq('status', 'approved')
    .order('rating', { ascending: false });

  if (error) { console.error('[sellers] fetchSellers:', error); return []; }
  return (data || []).map(dbRowToSeller);
}

export async function fetchSellerById(id: string): Promise<Seller | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('sellers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) { console.error('[sellers] fetchSellerById:', error); return null; }
  return dbRowToSeller(data);
}

export async function fetchSellerByUserId(userId: string) {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('sellers')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    console.error('[sellers] fetchSellerByUserId:', error);
  }
  return data || null;
}

export async function submitSellerApplication(
  userId: string,
  app: Omit<SellerApplication, 'referenceNumber' | 'submittedAt'>
): Promise<{ referenceNumber: string } | null> {
  if (!isSupabaseConfigured) return null;

  const referenceNumber = `MSK-S${Date.now().toString().slice(-6)}`;

  const { data, error } = await supabase
    .from('sellers')
    .insert({
      user_id: userId,
      business_name: app.businessName,
      business_type: app.businessType,
      category: app.category,
      description: app.description,
      whatsapp: app.whatsapp,
      city: app.city,
      address: app.address,
      reference_no: referenceNumber,
    })
    .select()
    .single();

  if (error) { console.error('[sellers] submitApplication:', error); return null; }

  if (app.documents.length > 0) {
    const docs = app.documents.map(name => ({ seller_id: data.id, name, url: '' }));
    await supabase.from('seller_documents').insert(docs);
  }

  return { referenceNumber };
}

export async function updateSeller(sellerId: string, updates: Partial<Seller>) {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('sellers')
    .update({
      business_name: updates.name,
      description: updates.description,
      logo_url: updates.logo,
      banner_url: updates.banner,
      whatsapp: updates.whatsapp,
      location: updates.location,
    })
    .eq('id', sellerId)
    .select()
    .single();

  if (error) { console.error('[sellers] updateSeller:', error); return null; }
  return dbRowToSeller(data);
}

// ── Helper ────────────────────────────────────────────────────────────────────

function dbRowToSeller(row: Record<string, unknown>): Seller {
  return {
    id: row.id as string,
    name: (row.business_name as string) || '',
    rating: Number(row.rating) || 0,
    reviewCount: Number(row.review_count) || 0,
    logo: (row.logo_url as string) || '',
    banner: (row.banner_url as string) || '',
    verified: Boolean(row.verified),
    location: (row.location as string) || (row.city as string) || '',
    category: (row.category as string) || '',
    description: (row.description as string) || '',
    whatsapp: (row.whatsapp as string) || '',
    followers: Number(row.followers) || 0,
    joined: new Date(row.created_at as string).toLocaleDateString('en-ZW', { month: 'long', year: 'numeric' }),
    responseTime: (row.response_time as string) || '< 1 hour',
    productCount: 0,
  };
}
