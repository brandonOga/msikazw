import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import * as authDb from '../../lib/db/auth';
import * as ordersDb from '../../lib/db/orders';
import * as sellersDb from '../../lib/db/sellers';
import * as productsDb from '../../lib/db/products';
import * as quotationsDb from '../../lib/db/quotations';
import { fetchZigRate } from '../../lib/exchange';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserRole = 'guest' | 'buyer' | 'seller' | 'admin';
export type Currency = 'USD' | 'ZiG';
export type EscrowStatus =
  | 'awaiting_payment' | 'payment_confirmed' | 'funds_held'
  | 'in_transit' | 'delivery_confirmed' | 'released' | 'disputed';

export type OnboardingStatus = 'none' | 'pending' | 'approved' | 'rejected';

export type DeliveryOption = 'platform' | 'own_driver' | 'pickup';
export type DeliveryTrackingStatus =
  | 'order_confirmed' | 'driver_assigned' | 'driver_to_pickup'
  | 'picked_up' | 'on_the_way' | 'delivered';

export interface DriverInfo {
  name: string;
  phone: string;
  verified: boolean;
  otpCode?: string;
}

export interface DeliveryDetails {
  option: DeliveryOption;
  partner?: 'DHL' | 'InDrive' | 'TapGo';
  driver?: DriverInfo;
  pickupLocation?: string;
  deliveryAddress?: string;
  estimatedTime?: string;
  cost: number;
  trackingStatus: DeliveryTrackingStatus;
  confirmationPIN?: string;
}

export interface QuotationRequest {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  sellerName: string;
  buyerName: string;
  buyerPhone: string;
  message: string;
  quantity: number;
  status: 'pending' | 'replied' | 'accepted' | 'declined';
  offeredPrice?: number;
  date: string;
}

export interface PreOrder {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  sellerName: string;
  depositAmount: number;
  totalAmount: number;
  remainingAmount: number;
  status: 'deposit_paid' | 'ready' | 'paid_full' | 'cancelled';
  date: string;
}

export interface DisputeEntry {
  id: string;
  orderId: string;
  reason: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  createdAt: string;
}

export interface SellerApplication {
  referenceNumber: string;
  businessName: string;
  businessType: string;
  category: string;
  phone: string;
  whatsapp: string;
  city: string;
  address: string;
  description: string;
  submittedAt: string;
  documents: string[];
  email?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  location?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PlacedOrder {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  escrowStatus: EscrowStatus;
  paymentMethod: string;
  deliveryMethod: string;
  name: string;
  phone: string;
  address?: string;
  date: string;
  trackingNumber?: string;
  deliveryPartner?: 'DHL' | 'InDrive' | 'Self';
  delivery?: DeliveryDetails;
  confirmationPIN?: string;
}

export interface Notification {
  id: string;
  type: 'order' | 'promo' | 'system';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

// ── localStorage helpers ───────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`msika_${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(`msika_${key}`, JSON.stringify(value));
  } catch {
    // storage quota exceeded — fail silently
  }
}

function usePersistedState<T>(key: string, initial: T) {
  const [state, setRaw] = useState<T>(() => load(key, initial));

  const setState = useCallback((value: T | ((prev: T) => T)) => {
    setRaw(prev => {
      const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
      save(key, next);
      return next;
    });
  }, [key]);

  return [state, setState] as const;
}

// ── Context type ──────────────────────────────────────────────────────────────

interface StoreContextType {
  user: User | null;
  authLoading: boolean;
  sellerDbId: string | null;  // UUID of the seller record in the sellers table
  login: (role: UserRole, name?: string, phone?: string, email?: string) => void;
  loginWithEmail: (email: string, password: string, role: 'buyer' | 'seller') => Promise<{ error: string | null }>;
  signUpWithEmail: (params: { email: string; password: string; name: string; phone?: string; role: 'buyer' | 'seller' }) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  verifyEmailOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;

  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemsCount: number;

  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  recentlyViewed: string[];
  addToRecentlyViewed: (productId: string) => void;

  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  currency: Currency;
  toggleCurrency: () => void;
  formatPrice: (usd: number) => string;

  placedOrders: PlacedOrder[];
  addPlacedOrder: (order: PlacedOrder) => void;
  confirmDelivery: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  reorder: (orderId: string) => void;

  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'time'>) => void;

  quotations: QuotationRequest[];
  addQuotation: (q: Omit<QuotationRequest, 'id' | 'status' | 'date'>) => void;

  preOrders: PreOrder[];
  addPreOrder: (p: Omit<PreOrder, 'id' | 'status' | 'date'>) => void;

  sellerProducts: Product[];
  addSellerProduct: (product: Omit<Product, 'id'>) => void;
  updateSellerProduct: (id: string, updates: Partial<Product>) => void;
  toggleProductStock: (id: string) => void;
  removeSellerProduct: (id: string) => void;

  onboardingStatus: OnboardingStatus;
  sellerApplication: SellerApplication | null;
  submitSellerApplication: (app: Omit<SellerApplication, 'referenceNumber' | 'submittedAt'>) => void;
  approveSellerAccount: () => void;

  addReview: (productId: string, review: { user: string; rating: number; comment: string }) => void;
  getProductReviews: (productId: string) => { user: string; rating: number; comment: string; date: string }[];
  hasUserReviewed: (productId: string) => boolean;

  backInStockIds: string[];
  toggleBackInStock: (productId: string) => void;
  isBackInStockNotified: (productId: string) => boolean;

  disputes: DisputeEntry[];
  submitDispute: (d: Omit<DisputeEntry, 'id' | 'status' | 'createdAt'>) => void;
}

// ── Provider ──────────────────────────────────────────────────────────────────

const StoreContext = createContext<StoreContextType | undefined>(undefined);


export const StoreProvider = ({ children }: { children: ReactNode }) => {
  // Auth state (not persisted directly — Supabase session handles it)
  const [user, setUser]           = useState<User | null>(() => load<User | null>('user', null));
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const [sellerDbId, setSellerDbId]   = useState<string | null>(() => load<string | null>('sellerDbId', null));
  const [zigRate, setZigRate]         = useState<number>(13.5);

  // Persisted state
  const [cart,             setCart]             = usePersistedState<CartItem[]>('cart', []);
  const [wishlist,         setWishlist]         = usePersistedState<string[]>('wishlist', []);
  const [recentlyViewed,   setRecentlyViewed]   = usePersistedState<string[]>('recentlyViewed', []);
  const [currency,         setCurrency]         = usePersistedState<Currency>('currency', 'USD');
  const [placedOrders,     setPlacedOrders]     = usePersistedState<PlacedOrder[]>('orders', []);
  const [notifications,    setNotifications]    = usePersistedState<Notification[]>('notifications', []);
  const [onboardingStatus, setOnboardingStatus] = usePersistedState<OnboardingStatus>('onboardingStatus', 'none');
  const [sellerApplication,setSellerApplication]= usePersistedState<SellerApplication | null>('sellerApplication', null);
  const [quotations,       setQuotations]       = usePersistedState<QuotationRequest[]>('quotations', []);
  const [preOrders,        setPreOrders]        = usePersistedState<PreOrder[]>('preOrders', []);
  const [backInStockIds,   setBackInStockIds]   = usePersistedState<string[]>('backInStock', []);
  const [disputes,         setDisputes]         = usePersistedState<DisputeEntry[]>('disputes', []);
  const [productReviews,   setProductReviews]   = usePersistedState<Record<string, { user: string; rating: number; comment: string; date: string }[]>>('reviews', {});
  const [sellerProducts,   setSellerProducts]   = usePersistedState<Product[]>('sellerProducts', []);

  // Non-persisted UI state
  const [isCartOpen, setIsCartOpen] = useState(false);

  // ── Live ZiG exchange rate ─────────────────────────────────────────────
  useEffect(() => { fetchZigRate().then(rate => setZigRate(rate)); }, []);

  // ── Sync helpers ────────────────────────────────────────────────────────────
  const syncOrdersFromSupabase = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return;
    const remoteOrders = await ordersDb.fetchOrders(userId);
    if (remoteOrders.length > 0) setPlacedOrders(remoteOrders);
  }, []);

  const syncQuotationsFromSupabase = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return;
    const remote = await quotationsDb.fetchQuotations(userId);
    if (remote.length > 0) setQuotations(remote);
  }, []);

  const syncPreOrdersFromSupabase = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return;
    const remote = await quotationsDb.fetchPreOrders(userId);
    if (remote.length > 0) setPreOrders(remote);
  }, []);

  const syncSellerDataFromSupabase = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return;
    const seller = await sellersDb.fetchSellerByUserId(userId);
    if (!seller) return;

    // Store the seller's DB UUID
    setSellerDbId(seller.id as string);
    save('sellerDbId', seller.id as string);

    // Upgrade profile role to 'seller' in DB so future logins are correct
    supabase.from('profiles').update({ role: 'seller' }).eq('id', userId).then(() => {});

    // Update local user role immediately
    setUser(prev => {
      if (!prev || prev.role === 'seller' || prev.role === 'admin') return prev;
      const updated = { ...prev, role: 'seller' as UserRole };
      save('user', updated);
      return updated;
    });

    // Load their products
    const prods = await productsDb.fetchProducts({ sellerId: seller.id as string });
    if (prods.length > 0) setSellerProducts(prods);
  }, []);

  const syncCartFromSupabase = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase.from('cart_items').select('*, products(*)').eq('user_id', userId);
    if (data && data.length > 0) {
      setCart(prev => {
        const remoteItems = (data as Record<string, unknown>[]).map(row => {
          const p = row.products as Record<string, unknown>;
          return {
            product: { id: p.id, name: p.name, price: Number(p.price), image: p.image, images: (p.images as string[]) || [], description: (p.description as string) || '', category: (p.category as string) || '', rating: Number(p.rating) || 0, reviews: [], reviewCount: Number(p.review_count) || 0, sellerId: p.seller_id as string, sellerName: '', tags: (p.tags as string[]) || [], inStock: p.in_stock !== false, deliveryBadge: (p.delivery_badge as string) || '', paymentMethods: (p.payment_methods as string[]) || [] } as Product,
            quantity: Number(row.quantity),
          };
        });
        const merged = [...remoteItems];
        prev.forEach(local => { if (!merged.some(r => r.product.id === local.product.id)) merged.push(local); });
        return merged;
      });
    }
  }, []);

  const syncWishlistFromSupabase = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase.from('wishlist').select('product_id').eq('user_id', userId);
    if (data && data.length > 0) {
      const remoteIds = (data as { product_id: string }[]).map(r => r.product_id);
      setWishlist(prev => [...new Set([...prev, ...remoteIds])]);
    }
  }, []);

  // ── Realtime: watch for seller approval ───────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured || !sellerDbId) return;

    const channel = supabase
      .channel(`seller-status-${sellerDbId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sellers', filter: `id=eq.${sellerDbId}` },
        (payload) => {
          const newStatus = (payload.new as Record<string, unknown>).status as string;
          if (newStatus === 'approved' && onboardingStatus !== 'approved') {
            setOnboardingStatus('approved');
            save('onboardingStatus', 'approved');
            setUser(prev => {
              if (!prev) return prev;
              const updated = { ...prev, role: 'seller' as UserRole };
              save('user', updated);
              return updated;
            });
            toast.success('🎉 Seller account approved!', {
              description: 'Your application has been approved. Your store is now live!',
              duration: 6000,
              position: 'bottom-center',
            });
          } else if (newStatus === 'rejected') {
            setOnboardingStatus('rejected');
            save('onboardingStatus', 'rejected');
            toast.error('Application not approved', {
              description: 'Your seller application was not approved. Please check your email for details.',
              duration: 8000,
              position: 'bottom-center',
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sellerDbId, onboardingStatus]);

  // ── Supabase auth session sync ─────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await authDb.getProfile(session.user.id);
        if (profile) {
          const u: User = {
            id: profile.id,
            name: profile.name,
            phone: profile.phone || '',
            email: session.user.email,
            role: profile.role,
            location: profile.location || undefined,
          };
          setUser(u);
          save('user', u);
          syncOrdersFromSupabase(profile.id);
          syncCartFromSupabase(profile.id);
          syncWishlistFromSupabase(profile.id);
          syncSellerDataFromSupabase(profile.id);
          syncQuotationsFromSupabase(profile.id);
          syncPreOrdersFromSupabase(profile.id);
        }
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        save('user', null);
        setSellerDbId(null);
        save('sellerDbId', null);
      } else if (session?.user && event === 'SIGNED_IN') {
        const profile = await authDb.getProfile(session.user.id);
        if (profile) {
          const u: User = {
            id: profile.id,
            name: profile.name,
            phone: profile.phone || '',
            email: session.user.email,
            role: profile.role,
            location: profile.location || undefined,
          };
          setUser(u);
          save('user', u);
          syncOrdersFromSupabase(profile.id);
          syncCartFromSupabase(profile.id);
          syncWishlistFromSupabase(profile.id);
          syncSellerDataFromSupabase(profile.id);
          syncQuotationsFromSupabase(profile.id);
          syncPreOrdersFromSupabase(profile.id);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Auth actions ───────────────────────────────────────────────────────────

  // Offline/demo login (used when Supabase is not configured or for quick testing)
  const login = (role: UserRole, name = 'Tatenda Moyo', phone = '+263 77 123 4567', email?: string) => {
    const u: User = { id: 'u1', name, phone, email, role, location: 'Harare, Zimbabwe' };
    setUser(u);
    save('user', u);
    setIsCartOpen(false);
  };

  const loginWithEmail = async (email: string, password: string, role: 'buyer' | 'seller'): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      login(role, 'Demo User', '', email);
      return { error: null };
    }

    const { data, error } = await authDb.signIn({ email, password });
    if (error) return { error: error.message };

    if (data?.user) {
      const profile = await authDb.getProfile(data.user.id);
      if (profile) {
        const u: User = {
          id: profile.id,
          name: profile.name,
          phone: profile.phone || '',
          email: data.user.email,
          role: profile.role,
          location: profile.location || undefined,
        };
        setUser(u);
        save('user', u);
      }
    }

    return { error: null };
  };

  const signUpWithEmail = async (params: {
    email: string; password: string; name: string; phone?: string; role: 'buyer' | 'seller';
  }): Promise<{ error: string | null; needsEmailConfirmation: boolean }> => {
    if (!isSupabaseConfigured) {
      login(params.role, params.name, params.phone || '', params.email);
      return { error: null, needsEmailConfirmation: false };
    }

    const { data, error } = await authDb.signUp(params);
    if (error) return { error: error.message, needsEmailConfirmation: false };

    // If session is null after signup, Supabase requires email confirmation
    const needsEmailConfirmation = !data?.session;
    return { error: null, needsEmailConfirmation };
  };

  const verifyEmailOtp = async (email: string, token: string): Promise<{ error: string | null }> => {
    return authDb.verifyEmailOtp(email, token);
    // onAuthStateChange listener will handle setting user state after success
  };

  const logout = () => {
    setUser(null);
    save('user', null);
    setIsCartOpen(false);
    if (isSupabaseConfigured) authDb.signOut();
  };

  const updateProfile = async (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      save('user', updated);
      return updated;
    });
    if (user?.id && isSupabaseConfigured) {
      await authDb.updateProfile(user.id, {
        name: data.name,
        phone: data.phone,
        location: data.location,
      });
    }
  };

  // ── Cart ───────────────────────────────────────────────────────────────────

  const openCart  = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
    // Sync to Supabase
    if (user?.id && isSupabaseConfigured) {
      supabase.from('cart_items').upsert(
        { user_id: user.id, product_id: product.id, quantity },
        { onConflict: 'user_id,product_id', ignoreDuplicates: false }
      ).then(() => {});
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
    if (user?.id && isSupabaseConfigured) {
      supabase.from('cart_items').update({ quantity }).eq('user_id', user.id).eq('product_id', productId).then(() => {});
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
    if (user?.id && isSupabaseConfigured) {
      supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', productId).then(() => {});
    }
  };

  const clearCart = () => {
    setCart([]);
    if (user?.id && isSupabaseConfigured) {
      supabase.from('cart_items').delete().eq('user_id', user.id).then(() => {});
    }
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const cartItemsCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // ── Wishlist & Recently Viewed ─────────────────────────────────────────────

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const isIn = prev.includes(productId);
      if (user?.id && isSupabaseConfigured) {
        if (isIn) supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId).then(() => {});
        else supabase.from('wishlist').insert({ user_id: user.id, product_id: productId }).then(() => {});
      }
      return isIn ? prev.filter(id => id !== productId) : [...prev, productId];
    });
  };
  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const addToRecentlyViewed = (productId: string) =>
    setRecentlyViewed(prev => {
      if (prev.includes(productId)) return prev;
      return [...prev, productId].slice(-5);
    });

  // ── Currency ───────────────────────────────────────────────────────────────

  const toggleCurrency = () => setCurrency(c => c === 'USD' ? 'ZiG' : 'USD');

  const formatPrice = (usd: number) => {
    if (currency === 'ZiG') return `ZiG ${(usd * zigRate).toFixed(0)}`;
    return `$${usd.toFixed(2).replace(/\.00$/, '')}`;
  };

  // ── Orders ─────────────────────────────────────────────────────────────────

  const addPlacedOrder = async (order: PlacedOrder) => {
    setPlacedOrders(prev => [order, ...prev]);
    addNotification({ type: 'order', title: 'Order Placed!', body: `Your order #${order.id} is confirmed.` });
    // Persist to Supabase if user is logged in
    if (user?.id && isSupabaseConfigured) {
      const saved = await ordersDb.createOrder(user.id, order);
      if (saved) {
        // Replace optimistic local order with DB record (gets real UUID)
        setPlacedOrders(prev => [saved, ...prev.filter(o => o.id !== order.id)]);
      }
    }
  };

  const confirmDelivery = (orderId: string) => {
    setPlacedOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: 'delivered', escrowStatus: 'released' } : o
    ));
    addNotification({ type: 'order', title: 'Delivery Confirmed', body: `Funds released to seller for order #${orderId}.` });
    if (isSupabaseConfigured) {
      ordersDb.updateOrderStatus(orderId, { status: 'delivered', escrow_status: 'released' });
    }
  };

  const cancelOrder = (orderId: string) => {
    setPlacedOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: 'cancelled', escrowStatus: 'disputed' } : o
    ));
    if (isSupabaseConfigured) {
      ordersDb.updateOrderStatus(orderId, { status: 'cancelled', escrow_status: 'disputed' });
    }
  };

  const reorder = (orderId: string) => {
    const order = placedOrders.find(o => o.id === orderId);
    if (order && order.items.length > 0) {
      order.items.forEach(item => addToCart(item.product, item.quantity));
      addNotification({ type: 'order', title: 'Items added to cart!', body: `${order.items.length} item(s) from order #${orderId} added to cart.` });
    }
  };

  // ── Notifications ──────────────────────────────────────────────────────────

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const addNotification = (n: Omit<Notification, 'id' | 'read' | 'time'>) => {
    const newN: Notification = { ...n, id: `n_${Date.now()}`, read: false, time: 'Just now' };
    setNotifications(prev => [newN, ...prev]);
  };

  // ── Seller products ────────────────────────────────────────────────────────

  const addSellerProduct = async (product: Omit<Product, 'id'>) => {
    const tempId = `sp_${Date.now()}`;
    const newProduct: Product = { ...product as Product, id: tempId };
    setSellerProducts(prev => [newProduct, ...prev]);
    // Persist to Supabase
    if (sellerDbId && isSupabaseConfigured) {
      const saved = await productsDb.createProduct(sellerDbId, product);
      if (saved) {
        // Replace temp ID with real DB UUID
        setSellerProducts(prev => [saved, ...prev.filter(p => p.id !== tempId)]);
      }
    }
  };

  const updateSellerProduct = async (id: string, updates: Partial<Product>) => {
    setSellerProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    if (isSupabaseConfigured) await productsDb.updateProduct(id, updates);
  };

  const toggleProductStock = async (id: string) => {
    let newInStock = true;
    setSellerProducts(prev => prev.map(p => {
      if (p.id === id) { newInStock = !p.inStock; return { ...p, inStock: !p.inStock }; }
      return p;
    }));
    if (isSupabaseConfigured) await productsDb.updateProduct(id, { inStock: newInStock });
  };

  const removeSellerProduct = async (id: string) => {
    setSellerProducts(prev => prev.filter(p => p.id !== id));
    if (isSupabaseConfigured) await productsDb.deleteProduct(id);
  };

  // ── Seller onboarding ──────────────────────────────────────────────────────

  const submitSellerApplication = async (app: Omit<SellerApplication, 'referenceNumber' | 'submittedAt'>) => {
    let referenceNumber = `MSK-S${Date.now().toString().slice(-6)}`;

    // Persist to Supabase if user is logged in
    if (user?.id && isSupabaseConfigured) {
      const result = await sellersDb.submitSellerApplication(user.id, app);
      if (result) referenceNumber = result.referenceNumber;
      // Immediately fetch and store the seller's DB UUID so product creation works right away
      const seller = await sellersDb.fetchSellerByUserId(user.id);
      if (seller) {
        setSellerDbId(seller.id as string);
        save('sellerDbId', seller.id as string);
      }
    }

    const application: SellerApplication = {
      ...app,
      referenceNumber,
      submittedAt: new Date().toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setSellerApplication(application);
    setOnboardingStatus('pending');
    addNotification({ type: 'system', title: 'Application Received', body: `Your seller application ${referenceNumber} is under review.` });

    // Trigger transactional email via serverless endpoint (non-blocking)
    try {
      if (application && application.phone) {
        // prefer email if available; fallback to phone (no-op)
      }
      if (typeof window !== 'undefined') {
        fetch('/api/send-seller-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: user?.email || application.email || '', name: user?.name || application.businessName || 'Seller', referenceNumber }),
        }).then(async res => {
          if (!res.ok) {
            const body = await res.text();
            console.warn('Failed to send seller email:', res.status, body);
          }
        }).catch(err => console.warn('Send seller email error', err));
      }
    } catch (err) {
      console.warn('Error triggering seller email', err);
    }
  };

  const approveSellerAccount = async () => {
    setOnboardingStatus('approved');
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, role: 'seller' as UserRole };
      save('user', updated);
      return updated;
    });
    // Sync seller DB ID and products in case it wasn't fetched yet
    if (user?.id && isSupabaseConfigured) {
      await syncSellerDataFromSupabase(user.id);
    }
    addNotification({ type: 'system', title: 'Seller Account Approved!', body: 'Your store is now live on Msika. Start adding products!' });
  };

  // ── Quotations & Pre-orders ────────────────────────────────────────────────

  const addQuotation = async (q: Omit<QuotationRequest, 'id' | 'status' | 'date'>) => {
    const localEntry: QuotationRequest = {
      ...q, id: `q_${Date.now()}`, status: 'pending',
      date: new Date().toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setQuotations(prev => [localEntry, ...prev]);
    if (user?.id && isSupabaseConfigured) {
      const saved = await quotationsDb.createQuotation(user.id, q);
      if (saved) setQuotations(prev => [saved, ...prev.filter(x => x.id !== localEntry.id)]);
    }
  };

  const addPreOrder = async (p: Omit<PreOrder, 'id' | 'status' | 'date'>) => {
    const localEntry: PreOrder = {
      ...p, id: `po_${Date.now()}`, status: 'deposit_paid',
      date: new Date().toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setPreOrders(prev => [localEntry, ...prev]);
    if (user?.id && isSupabaseConfigured) {
      const saved = await quotationsDb.createPreOrder(user.id, p);
      if (saved) setPreOrders(prev => [saved, ...prev.filter(x => x.id !== localEntry.id)]);
    }
  };

  // ── Reviews ────────────────────────────────────────────────────────────────

  const addReview = (productId: string, review: { user: string; rating: number; comment: string }) =>
    setProductReviews(prev => ({
      ...prev,
      [productId]: [...(prev[productId] || []), { ...review, date: 'Just now' }],
    }));

  const getProductReviews = (productId: string) => productReviews[productId] || [];

  const hasUserReviewed = (productId: string) => {
    if (!user) return false;
    return (productReviews[productId] || []).some(r => r.user === user.name);
  };

  // ── Back-in-stock ──────────────────────────────────────────────────────────

  const toggleBackInStock = (productId: string) =>
    setBackInStockIds(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  const isBackInStockNotified = (productId: string) => backInStockIds.includes(productId);

  // ── Disputes ───────────────────────────────────────────────────────────────

  const submitDispute = (d: Omit<DisputeEntry, 'id' | 'status' | 'createdAt'>) =>
    setDisputes(prev => [{
      ...d, id: `d_${Date.now()}`, status: 'open',
      createdAt: new Date().toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
    }, ...prev]);

  // ── Context value ──────────────────────────────────────────────────────────

  return (
    <StoreContext.Provider value={{
      user, authLoading, sellerDbId, login, loginWithEmail, signUpWithEmail, verifyEmailOtp, logout, updateProfile,
      cart, addToCart, updateQuantity, removeFromCart, clearCart, cartTotal, cartItemsCount,
      wishlist, toggleWishlist, isWishlisted,
      recentlyViewed, addToRecentlyViewed,
      isCartOpen, openCart, closeCart,
      currency, toggleCurrency, formatPrice,
      placedOrders, addPlacedOrder, confirmDelivery, cancelOrder, reorder,
      notifications, unreadCount, markAllRead, addNotification,
      sellerProducts, addSellerProduct, updateSellerProduct, toggleProductStock, removeSellerProduct,
      onboardingStatus, sellerApplication, submitSellerApplication, approveSellerAccount,
      quotations, addQuotation,
      preOrders, addPreOrder,
      addReview, getProductReviews, hasUserReviewed,
      backInStockIds, toggleBackInStock, isBackInStockNotified,
      disputes, submitDispute,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
