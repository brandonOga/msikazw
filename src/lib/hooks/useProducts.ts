import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';
import { type Product, type Seller } from '../../app/data/mockData';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UseProductsOptions {
  category?: string;
  sellerId?: string;   // Supabase UUID or legacy mock ID (s1, s2…)
  search?: string;
  limit?: number;
  page?: number;       // 0-based page index (used with limit for pagination)
  skip?: boolean;       // when true, don't fetch (e.g. query not ready yet)
}

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => void;
}

interface UseSellersResult {
  sellers: Seller[];
  loading: boolean;
  error: string | null;
}

// ── useProducts ───────────────────────────────────────────────────────────────

const DEFAULT_PAGE_SIZE = 24;

export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [hasMore, setHasMore]   = useState(false);
  const [tick, setTick]         = useState(0);

  const refresh = () => setTick(t => t + 1);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (options.skip) {
        if (!cancelled) { setProducts([]); setLoading(false); }
        return;
      }

      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        if (!cancelled) { setProducts([]); setLoading(false); }
        return;
      }

      try {
        const pageSize = options.limit ?? DEFAULT_PAGE_SIZE;
        const page = options.page ?? 0;
        const from = page * pageSize;
        const to   = from + pageSize - 1;

        let query = supabase
          .from('products')
          .select('*, sellers(business_name)', { count: 'exact' })
          .eq('in_stock', true)
          .range(from, to);

        if (options.category) query = query.eq('category', options.category);
        if (options.search)   query = query.ilike('name', `%${options.search}%`);

        const { data, error: err, count } = await query;

        if (err) throw err;

        const mapped = (data || []).map(dbRowToProduct);
        if (!cancelled) {
          setProducts(mapped);
          setHasMore((count ?? 0) > to + 1);
          setLoading(false);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load products';
        console.error('[useProducts]', msg);
        if (!cancelled) { setError(msg); setLoading(false); }
      }
    }

    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.category, options.search, options.sellerId, options.limit, options.page, options.skip, tick]);

  return { products, loading, error, hasMore, refresh };
}

// ── useTrendingCategories ────────────────────────────────────────────────────

interface UseTrendingCategoriesResult {
  categories: string[];
  loading: boolean;
}

// Ranks categories by live in-stock product count — no hardcoded list.
export function useTrendingCategories(limit: number = 6): UseTrendingCategoriesResult {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      if (!isSupabaseConfigured) {
        if (!cancelled) { setCategories([]); setLoading(false); }
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('in_stock', true);

      if (!cancelled) {
        if (error || !data) {
          setCategories([]);
        } else {
          const counts = data.reduce<Record<string, number>>((acc, row) => {
            const cat = row.category as string;
            if (cat) acc[cat] = (acc[cat] || 0) + 1;
            return acc;
          }, {});
          const ranked = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([name]) => name);
          setCategories(ranked);
        }
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [limit]);

  return { categories, loading };
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

      if (err) {
        if (!cancelled) { setSellers([]); setError(err.message); setLoading(false); }
        return;
      }

      const { data: productRows } = await supabase
        .from('products')
        .select('seller_id')
        .eq('in_stock', true);

      const counts = (productRows || []).reduce<Record<string, number>>((acc, row) => {
        const sellerId = row.seller_id as string;
        if (sellerId) acc[sellerId] = (acc[sellerId] || 0) + 1;
        return acc;
      }, {});

      if (!cancelled) {
        setSellers((data || []).map(row => {
          const seller = dbRowToSeller(row);
          seller.productCount = counts[row.id as string] || 0;
          return seller;
        }));
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
