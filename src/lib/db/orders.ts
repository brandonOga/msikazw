import { supabase, isSupabaseConfigured } from '../supabase';
import type { PlacedOrder, EscrowStatus } from '../../app/context/StoreContext';

// ── Seller-side order model ───────────────────────────────────────────────────
export interface SellerOrderItem {
  id: string;           // order_items.id
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  buyerName: string;
  buyerPhone: string;
  quantity: number;
  price: number;
  deliveryMethod: string;
  trackingNumber?: string;
  deliveryPartner?: string;
  escrowStatus: EscrowStatus;
  date: string;
  address?: string;
}

export async function fetchSellerOrders(sellerId: string): Promise<SellerOrderItem[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('order_items')
    .select(`
      id,
      order_id,
      product_id,
      product_name,
      product_image,
      price,
      quantity,
      orders (
        id, escrow_status, delivery_method, delivery_partner,
        tracking_number, name, phone, address, date
      ),
      products!inner ( seller_id )
    `)
    .eq('products.seller_id', sellerId)
    .order('id', { ascending: false });

  if (error) { console.error('[orders] fetchSellerOrders:', error); return []; }

  return (data || []).map(row => {
    const o = (row.orders as unknown as Record<string, unknown>) || {};
    return {
      id: row.id as string,
      orderId: row.order_id as string,
      productId: row.product_id as string,
      productName: row.product_name as string,
      productImage: (row.product_image as string) || '',
      price: Number(row.price),
      quantity: Number(row.quantity),
      buyerName: (o.name as string) || 'Customer',
      buyerPhone: (o.phone as string) || '',
      address: o.address as string | undefined,
      escrowStatus: ((o.escrow_status as EscrowStatus) || 'awaiting_payment'),
      deliveryMethod: (o.delivery_method as string) || '',
      deliveryPartner: o.delivery_partner as string | undefined,
      trackingNumber: o.tracking_number as string | undefined,
      date: new Date(o.date as string).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
  });
}

export async function fetchOrders(userId: string): Promise<PlacedOrder[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('buyer_id', userId)
    .order('date', { ascending: false });

  if (error) { console.error('[orders] fetchOrders:', error); return []; }
  return (data || []).map(dbRowToOrder);
}

export async function createOrder(userId: string, order: Omit<PlacedOrder, 'id'>): Promise<PlacedOrder | null> {
  if (!isSupabaseConfigured) return null;

  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .insert({
      buyer_id: userId,
      status: order.status,
      escrow_status: order.escrowStatus,
      total: order.total,
      payment_method: order.paymentMethod,
      delivery_method: order.deliveryMethod,
      delivery_partner: order.deliveryPartner,
      name: order.name,
      phone: order.phone,
      address: order.address,
      tracking_number: order.trackingNumber,
      confirmation_pin: order.confirmationPIN,
    })
    .select()
    .single();

  if (orderError) { console.error('[orders] createOrder:', orderError); return null; }

  const items = order.items.map(item => ({
    order_id: orderRow.id,
    product_id: item.product.id,
    product_name: item.product.name,
    product_image: item.product.image,
    seller_name: item.product.sellerName,
    price: item.product.price,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(items);
  if (itemsError) console.error('[orders] createOrder items:', itemsError);

  return dbRowToOrder({ ...orderRow, order_items: items });
}

export async function updateOrderStatus(
  orderId: string,
  updates: { status?: PlacedOrder['status']; escrow_status?: PlacedOrder['escrowStatus'] }
) {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId);

  if (error) console.error('[orders] updateOrderStatus:', error);
}

// ── Disputes ─────────────────────────────────────────────────────────────────

export async function createDispute(
  userId: string,
  dispute: { order_id: string; reason: string; description: string }
) {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('disputes')
    .insert({ buyer_id: userId, ...dispute })
    .select()
    .single();

  if (error) { console.error('[orders] createDispute:', error); return null; }
  return data;
}

// ── Helper ────────────────────────────────────────────────────────────────────

function dbRowToOrder(row: Record<string, unknown>): PlacedOrder {
  const items = ((row.order_items as Record<string, unknown>[]) || []).map(i => ({
    product: {
      id: (i.product_id as string) || '',
      name: i.product_name as string,
      image: (i.product_image as string) || '',
      images: [],
      price: Number(i.price),
      description: '',
      category: '',
      rating: 0,
      reviews: [],
      reviewCount: 0,
      sellerId: '',
      sellerName: (i.seller_name as string) || '',
      tags: [],
      inStock: true,
      deliveryBadge: '',
      paymentMethods: [],
    },
    quantity: Number(i.quantity),
  }));

  return {
    id: row.id as string,
    items,
    total: Number(row.total),
    status: row.status as PlacedOrder['status'],
    escrowStatus: row.escrow_status as PlacedOrder['escrowStatus'],
    paymentMethod: (row.payment_method as string) || '',
    deliveryMethod: (row.delivery_method as string) || '',
    deliveryPartner: row.delivery_partner as PlacedOrder['deliveryPartner'],
    name: (row.name as string) || '',
    phone: (row.phone as string) || '',
    address: row.address as string | undefined,
    date: new Date(row.date as string).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
    trackingNumber: row.tracking_number as string | undefined,
    confirmationPIN: row.confirmation_pin as string | undefined,
  };
}
