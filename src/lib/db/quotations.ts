import { supabase, isSupabaseConfigured } from '../supabase';
import type { QuotationRequest, PreOrder } from '../../app/context/StoreContext';

// ── Quotations ────────────────────────────────────────────────────────────────

export async function fetchQuotations(userId: string): Promise<QuotationRequest[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false });

  if (error) { console.error('[quotations] fetch:', error); return []; }

  return (data || []).map(r => ({
    id: r.id as string,
    productId: (r.product_id as string) || '',
    productName: r.product_name as string,
    productImage: (r.product_image as string) || '',
    sellerName: (r.seller_name as string) || '',
    buyerName: r.buyer_name as string,
    buyerPhone: (r.buyer_phone as string) || '',
    message: (r.message as string) || '',
    quantity: Number(r.quantity) || 1,
    status: (r.status as QuotationRequest['status']) || 'pending',
    offeredPrice: r.offered_price ? Number(r.offered_price) : undefined,
    date: new Date(r.created_at as string).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
  }));
}

export async function createQuotation(
  userId: string,
  q: Omit<QuotationRequest, 'id' | 'status' | 'date'>,
): Promise<QuotationRequest | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('quotations')
    .insert({
      product_id: q.productId || null,
      product_name: q.productName,
      product_image: q.productImage,
      seller_name: q.sellerName,
      buyer_id: userId,
      buyer_name: q.buyerName,
      buyer_phone: q.buyerPhone,
      message: q.message,
      quantity: q.quantity,
    })
    .select()
    .single();

  if (error) { console.error('[quotations] create:', error); return null; }

  return {
    id: data.id as string,
    productId: (data.product_id as string) || '',
    productName: data.product_name as string,
    productImage: (data.product_image as string) || '',
    sellerName: (data.seller_name as string) || '',
    buyerName: data.buyer_name as string,
    buyerPhone: (data.buyer_phone as string) || '',
    message: (data.message as string) || '',
    quantity: Number(data.quantity) || 1,
    status: 'pending',
    date: new Date(data.created_at as string).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
  };
}

// ── Pre-Orders ────────────────────────────────────────────────────────────────

export async function fetchPreOrders(userId: string): Promise<PreOrder[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('pre_orders')
    .select('*')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false });

  if (error) { console.error('[preOrders] fetch:', error); return []; }

  return (data || []).map(r => ({
    id: r.id as string,
    productId: (r.product_id as string) || '',
    productName: r.product_name as string,
    productImage: (r.product_image as string) || '',
    sellerName: (r.seller_name as string) || '',
    depositAmount: Number(r.deposit_amount),
    totalAmount: Number(r.total_amount),
    remainingAmount: Number(r.remaining_amount),
    status: (r.status as PreOrder['status']) || 'deposit_paid',
    date: new Date(r.created_at as string).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
  }));
}

export async function createPreOrder(
  userId: string,
  p: Omit<PreOrder, 'id' | 'status' | 'date'>,
): Promise<PreOrder | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('pre_orders')
    .insert({
      product_id: p.productId || null,
      product_name: p.productName,
      product_image: p.productImage,
      seller_name: p.sellerName,
      buyer_id: userId,
      deposit_amount: p.depositAmount,
      total_amount: p.totalAmount,
      remaining_amount: p.remainingAmount,
    })
    .select()
    .single();

  if (error) { console.error('[preOrders] create:', error); return null; }

  return {
    id: data.id as string,
    productId: (data.product_id as string) || '',
    productName: data.product_name as string,
    productImage: (data.product_image as string) || '',
    sellerName: (data.seller_name as string) || '',
    depositAmount: Number(data.deposit_amount),
    totalAmount: Number(data.total_amount),
    remainingAmount: Number(data.remaining_amount),
    status: 'deposit_paid',
    date: new Date(data.created_at as string).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
  };
}
