import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, products as allProducts } from '../data/mockData';

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
  documents: string[]; // filenames
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

interface StoreContextType {
  user: User | null;
  login: (role: UserRole, name?: string, phone?: string, email?: string) => void;
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

  // Quotations
  quotations: QuotationRequest[];
  addQuotation: (q: Omit<QuotationRequest, 'id' | 'status' | 'date'>) => void;

  // Pre-orders
  preOrders: PreOrder[];
  addPreOrder: (p: Omit<PreOrder, 'id' | 'status' | 'date'>) => void;

  // Seller
  sellerProducts: Product[];
  addSellerProduct: (product: Omit<Product, 'id'>) => void;
  updateSellerProduct: (id: string, updates: Partial<Product>) => void;
  toggleProductStock: (id: string) => void;
  removeSellerProduct: (id: string) => void;

  // Onboarding
  onboardingStatus: OnboardingStatus;
  sellerApplication: SellerApplication | null;
  submitSellerApplication: (app: Omit<SellerApplication, 'referenceNumber' | 'submittedAt'>) => void;
  approveSellerAccount: () => void;

  // Reviews
  addReview: (productId: string, review: { user: string; rating: number; comment: string }) => void;
  getProductReviews: (productId: string) => { user: string; rating: number; comment: string; date: string }[];
  hasUserReviewed: (productId: string) => boolean;

  // Back-in-stock
  backInStockIds: string[];
  toggleBackInStock: (productId: string) => void;
  isBackInStockNotified: (productId: string) => boolean;

  // Disputes
  disputes: DisputeEntry[];
  submitDispute: (d: Omit<DisputeEntry, 'id' | 'status' | 'createdAt'>) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const ZIG_RATE = 13.5;

const SEED_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'order', title: 'Order Dispatched', body: 'Your Wireless Earbuds Pro has been dispatched via DHL.', time: '2h ago', read: false },
  { id: 'n2', type: 'promo', title: 'Flash Sale — 30% off Electronics', body: 'Today only! Use code FLASH30 at checkout.', time: '5h ago', read: false },
  { id: 'n3', type: 'system', title: 'Welcome to Msika!', body: 'Your account is verified. Start shopping or open a store.', time: '1d ago', read: true },
];

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);
  const [sellerProducts, setSellerProducts] = useState<Product[]>(
    allProducts.filter(p => p.sellerId === 's1')
  );
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>('none');
  const [sellerApplication, setSellerApplication] = useState<SellerApplication | null>(null);

  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [backInStockIds, setBackInStockIds] = useState<string[]>([]);
  const [disputes, setDisputes] = useState<DisputeEntry[]>([]);
  const [productReviews, setProductReviews] = useState<Record<string, { user: string; rating: number; comment: string; date: string }[]>>({});

  const login = (role: UserRole, name = 'Tatenda Moyo', phone = '+263 77 123 4567', email?: string) => {
    setUser({ id: 'u1', name, phone, email, role, location: 'Harare, Zimbabwe' });
  };

  const logout = () => {
    setUser(null);
    setIsCartOpen(false);
  };

  const updateProfile = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : prev);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const toggleCurrency = () => setCurrency(c => c === 'USD' ? 'ZiG' : 'USD');

  const formatPrice = (usd: number) => {
    if (currency === 'ZiG') return `ZiG ${(usd * ZIG_RATE).toFixed(0)}`;
    return `$${usd.toFixed(2).replace(/\.00$/, '')}`;
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
  };

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(i => i.product.id !== productId));
  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const cartItemsCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };
  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const addToRecentlyViewed = (productId: string) => {
    setRecentlyViewed(prev => {
      if (prev.includes(productId)) return prev;
      return [...prev, productId].slice(-5); // Keep only the last 5 viewed products
    });
  };

  const addPlacedOrder = (order: PlacedOrder) => {
    setPlacedOrders(prev => [order, ...prev]);
    addNotification({ type: 'order', title: 'Order Placed!', body: `Your order #${order.id} is confirmed.` });
  };

  const confirmDelivery = (orderId: string) => {
    setPlacedOrders(prev => prev.map(o => o.id === orderId
      ? { ...o, status: 'delivered', escrowStatus: 'released' }
      : o
    ));
    addNotification({ type: 'order', title: 'Delivery Confirmed', body: `Funds released to seller for order #${orderId}.` });
  };

  const cancelOrder = (orderId: string) => {
    setPlacedOrders(prev => prev.map(o => o.id === orderId
      ? { ...o, status: 'cancelled', escrowStatus: 'disputed' }
      : o
    ));
  };

  const reorder = (orderId: string) => {
    const order = placedOrders.find(o => o.id === orderId);
    if (order && order.items.length > 0) {
      order.items.forEach(item => addToCart(item.product, item.quantity));
      addNotification({ type: 'order', title: 'Items added to cart!', body: `${order.items.length} item(s) from order #${orderId} added to cart.` });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const addNotification = (n: Omit<Notification, 'id' | 'read' | 'time'>) => {
    const newN: Notification = { ...n, id: `n_${Date.now()}`, read: false, time: 'Just now' };
    setNotifications(prev => [newN, ...prev]);
  };

  // Seller product management
  const addSellerProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...product as Product, id: `sp_${Date.now()}` };
    setSellerProducts(prev => [newProduct, ...prev]);
  };

  const updateSellerProduct = (id: string, updates: Partial<Product>) => {
    setSellerProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const toggleProductStock = (id: string) => {
    setSellerProducts(prev => prev.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p));
  };

  const removeSellerProduct = (id: string) => {
    setSellerProducts(prev => prev.filter(p => p.id !== id));
  };

  const submitSellerApplication = (app: Omit<SellerApplication, 'referenceNumber' | 'submittedAt'>) => {
    const application: SellerApplication = {
      ...app,
      referenceNumber: `MSK-S${Date.now().toString().slice(-6)}`,
      submittedAt: new Date().toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setSellerApplication(application);
    setOnboardingStatus('pending');
    addNotification({ type: 'system', title: 'Application Received', body: `Your seller application ${application.referenceNumber} is under review.` });
  };

  const approveSellerAccount = () => {
    setOnboardingStatus('approved');
    setUser(prev => prev ? { ...prev, role: 'seller' } : prev);
    addNotification({ type: 'system', title: '🎉 Seller Account Approved!', body: 'Your store is now live on Msika. Start adding products!' });
  };

  const addQuotation = (q: Omit<QuotationRequest, 'id' | 'status' | 'date'>) => {
    const newQuotation: QuotationRequest = {
      ...q,
      id: `q_${Date.now()}`,
      status: 'pending',
      date: new Date().toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setQuotations(prev => [newQuotation, ...prev]);
  };

  const addPreOrder = (p: Omit<PreOrder, 'id' | 'status' | 'date'>) => {
    const newPreOrder: PreOrder = {
      ...p,
      id: `po_${Date.now()}`,
      status: 'deposit_paid',
      date: new Date().toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setPreOrders(prev => [newPreOrder, ...prev]);
  };

  const addReview = (productId: string, review: { user: string; rating: number; comment: string }) => {
    setProductReviews(prev => ({
      ...prev,
      [productId]: [
        ...(prev[productId] || []),
        { ...review, date: 'Just now' },
      ],
    }));
  };

  const getProductReviews = (productId: string) => productReviews[productId] || [];
  const hasUserReviewed = (productId: string) => {
    if (!user) return false;
    return (productReviews[productId] || []).some(r => r.user === user.name);
  };

  const toggleBackInStock = (productId: string) => {
    setBackInStockIds(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };
  const isBackInStockNotified = (productId: string) => backInStockIds.includes(productId);

  const submitDispute = (d: Omit<DisputeEntry, 'id' | 'status' | 'createdAt'>) => {
    const newDispute: DisputeEntry = {
      ...d,
      id: `d_${Date.now()}`,
      status: 'open',
      createdAt: new Date().toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setDisputes(prev => [newDispute, ...prev]);
  };

  return (
    <StoreContext.Provider value={{
      user, login, logout, updateProfile,
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