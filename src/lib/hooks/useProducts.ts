import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';
import { type Product, type Seller } from '../../app/data/mockData';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UseProductsOptions {
  category?: string;
  sellerId?: string;   // Supabase UUID or legacy mock ID (s1, s2…)
  search?: string;
  limit?: number;
}

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

interface UseSellersResult {
  sellers: Seller[];
  loading: boolean;
  error: string | null;
}

// ── useProducts ───────────────────────────────────────────────────────────────

export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [tick, setTick]         = useState(0);

  const refresh = () => setTick(t => t + 1);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        if (!cancelled) { setProducts([]); setLoading(false); }
        return;
      }

      try {
        let query = supabase
          .from('products')
          .select('*, sellers(business_name)')
          .eq('in_stock', true);

        if (options.category) query = query.eq('category', options.category);
        if (options.search)   query = query.ilike('name', `%${options.search}%`);
        if (options.limit)    query = query.limit(options.limit);

        const { data, error: err } = await query;

        if (err) throw err;

        const mapped = (data || []).map(dbRowToProduct);
        if (!cancelled) { setProducts(mapped); setLoading(false); }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load products';
        console.error('[useProducts]', msg);
        if (!cancelled) { setError(msg); setLoading(false); }
      }
    }

    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.category, options.search, options.sellerId, options.limit, tick]);

  return { products, loading, error, refresh };
}

// ── useProductById ────────────────────────────────────────────────────────────

export function useProductById(id: string): { product: Product | null; loading: boolean } {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      if (!isSupabaseConfigured) {
        if (!cancelled) { setProduct(null); setLoading(false); }
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('*, sellers(business_name)')
        .eq('id', id)
        .maybeSingle();

      if (!cancelled) {
        setProduct(data ? dbRowToProduct(data) : null);
        setLoading(false);
      }
    }

    if (id) load();
  }, [id]);

  return { product, loading };
}

// ── useSellers ────────────────────────────────────────────────────────────────

export function useSellers(): UseSellersResult {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      if (!isSupabaseConfigured) {
        if (!cancelled) { setSellers([]); setLoading(false); }
        return;
      }

      const { data, error: err } = await supabase
        .from('sellers')
        .select('*')
        .eq('status', 'approved')
        .order('rating', { ascending: false });

      if (!cancelled) {
        setSellers(err ? [] : (data || []).map(dbRowToSeller));
        if (err) setError(err.message);
        setLoading(false);
      }
    }

    load();
  }, []);

  return { sellers, loading, error };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function dbRowToProduct(row: Record<string, unknown>): Product {
  const sellers = row.sellers as Record<string, string> | null;
  return {
    id:             row.id as string,
    name:           row.name as string,
    description:    (row.description as string) || '',
    price:          Number(row.price),
    originalPrice:  row.original_price ? Number(row.original_price) : undefined,
    category:       row.category as string,
    image:          (row.image as string) || '',
    images:         (row.images as string[]) || [],
    rating:         Number(row.rating) || 0,
    reviews:        [],
    reviewCount:    Number(row.review_count) || 0,
    sellerId:       row.seller_id as string,
    sellerName:     sellers?.business_name || '',
    tags:           (row.tags as string[]) || [],
    isNew:          Boolean(row.is_new),
    isDeal:         Boolean(row.is_deal),
    inStock:        row.in_stock !== false,
    deliveryBadge:  (row.delivery_badge as string) || 'Standard Delivery',
    paymentMethods: (row.payment_methods as string[]) || [],
  };
}

function dbRowToSeller(row: Record<string, unknown>): Seller {
  return {
    id:           row.id as string,
    name:         (row.business_name as string) || '',
    rating:       Number(row.rating) || 0,
    reviewCount:  Number(row.review_count) || 0,
    logo:         (row.logo_url as string) || '',
    banner:       (row.banner_url as string) || '',
    verified:     Boolean(row.verified),
    location:     (row.location as string) || (row.city as string) || '',
    category:     (row.category as string) || '',
    description:  (row.description as string) || '',
    whatsapp:     (row.whatsapp as string) || '',
    followers:    Number(row.followers) || 0,
    joined:       new Date(row.created_at as string).toLocaleDateString('en-ZW', { month: 'long', year: 'numeric' }),
    responseTime: (row.response_time as string) || '< 1 hour',
    productCount: 0,
  };
}
