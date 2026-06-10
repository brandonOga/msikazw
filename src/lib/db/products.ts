import { supabase, isSupabaseConfigured } from '../supabase';
import type { Product } from '../../app/data/mockData';

export async function fetchProducts(filters?: {
  category?: string;
  sellerId?: string;
  search?: string;
  limit?: number;
}): Promise<Product[]> {
  if (!isSupabaseConfigured) return [];

  let query = supabase
    .from('products')
    .select(`
      *,
      sellers!inner(id, business_name, status)
    `)
    .eq('sellers.status', 'approved');

  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.sellerId) query = query.eq('seller_id', filters.sellerId);
  if (filters?.search) query = query.ilike('name', `%${filters.search}%`);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) { console.error('[products] fetchProducts:', error); return []; }

  return (data || []).map(dbRowToProduct);
}

export async function fetchProductById(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('products')
    .select('*, sellers(business_name)')
    .eq('id', id)
    .single();

  if (error) { console.error('[products] fetchProductById:', error); return null; }
  return dbRowToProduct(data);
}

export async function createProduct(
  sellerId: string,
  product: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'rating' | 'reviews' | 'reviewCount'>
) {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('products')
    .insert({
      seller_id: sellerId,
      name: product.name,
      description: product.description,
      price: product.price,
      original_price: product.originalPrice,
      category: product.category,
      image: product.image,
      images: product.images,
      tags: product.tags,
      is_new: true,
      is_deal: false,
      in_stock: product.inStock,
      delivery_badge: product.deliveryBadge,
      payment_methods: product.paymentMethods,
    })
    .select()
    .single();

  if (error) { console.error('[products] createProduct:', error); return null; }
  return dbRowToProduct(data);
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('products')
    .update({
      name: updates.name,
      description: updates.description,
      price: updates.price,
      original_price: updates.originalPrice,
      category: updates.category,
      image: updates.image,
      images: updates.images,
      tags: updates.tags,
      is_new: updates.isNew,
      is_deal: updates.isDeal,
      in_stock: updates.inStock,
      delivery_badge: updates.deliveryBadge,
      payment_methods: updates.paymentMethods,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) { console.error('[products] updateProduct:', error); return null; }
  return dbRowToProduct(data);
}

export async function deleteProduct(id: string) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) console.error('[products] deleteProduct:', error);
}

// ── Reviews ──────────────────────────────────────────────────────────────────

export async function fetchReviews(productId: string) {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) { console.error('[products] fetchReviews:', error); return []; }
  return (data || []).map((r: Record<string, unknown>) => ({
    user: r.user_name as string,
    rating: r.rating as number,
    comment: r.comment as string,
    date: new Date(r.created_at as string).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
  }));
}

export async function submitReview(
  productId: string,
  userId: string,
  review: { user_name: string; rating: number; comment: string }
) {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('reviews')
    .upsert({ product_id: productId, user_id: userId, ...review })
    .select()
    .single();

  if (error) { console.error('[products] submitReview:', error); return null; }
  return data;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function dbRowToProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || '',
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    category: row.category as string,
    image: (row.image as string) || '',
    images: (row.images as string[]) || [],
    rating: Number(row.rating) || 0,
    reviews: [],
    reviewCount: Number(row.review_count) || 0,
    sellerId: row.seller_id as string,
    sellerName: (row as Record<string, Record<string, string>>).sellers?.business_name || '',
    tags: (row.tags as string[]) || [],
    isNew: Boolean(row.is_new),
    isDeal: Boolean(row.is_deal),
    inStock: Boolean(row.in_stock),
    deliveryBadge: (row.delivery_badge as string) || 'Standard Delivery',
    paymentMethods: (row.payment_methods as string[]) || [],
    createdAt: row.created_at as string | undefined,
  };
}
