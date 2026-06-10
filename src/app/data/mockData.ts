// ─── Types ───────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  emoji: string;
  count: number;
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  images: string[];
  rating: number;
  reviews: Review[];
  reviewCount: number;
  sellerId: string;
  sellerName: string;
  tags: string[];
  isNew?: boolean;
  isDeal?: boolean;
  inStock: boolean;
  deliveryBadge: string;
  paymentMethods: string[];
  createdAt?: string;
}

export interface Seller {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  logo: string;
  banner: string;
  verified: boolean;
  location: string;
  category: string;
  description: string;
  whatsapp: string;
  followers: number;
  joined: string;
  responseTime: string;
  productCount: number;
}

export interface Order {
  id: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  escrowStatus: 'awaiting_payment' | 'payment_confirmed' | 'funds_held' | 'in_transit' | 'delivery_confirmed' | 'released' | 'disputed';
  trackingNumber?: string;
  deliveryPartner?: 'DHL' | 'InDrive' | 'Self';
  productImage: string;
  productName: string;
  sellerName: string;
  quantity: number;
  date: string;
  deliveryMethod: string;
  price: number;
}

// ─── Admin / Seller Application Types ─────────────────────────────────
export type SellerApplicationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface SellerApplicationData {
  id: string;
  sellerName: string;
  businessName: string;
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  address: string;
  category: string;
  description: string;
  status: SellerApplicationStatus;
  submittedAt: string;
  documents: string[];
  reviewNotes?: string;
}

// ─── Dispute Types ────────────────────────────────────────────────────
export type DisputeStatus = 'open' | 'under_review' | 'resolved_buyer' | 'resolved_seller' | 'closed';
export type DisputeReason = 'not_received' | 'wrong_item' | 'damaged' | 'not_as_described' | 'other';

export interface Dispute {
  id: string;
  orderId: string;
  buyerName: string;
  sellerName: string;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
  amount: number;
}

// ─── Testimonial Type ─────────────────────────────────────────────────
export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  text: string;
  rating: number;
  role: 'buyer' | 'seller';
}

// ─── Categories (Online Marketplace) ──────────────────────────────────

export const categories: Category[] = [
  { id: 'c1',  name: 'Fashion & Clothing',      emoji: '👗', count: 120 },
  { id: 'c2',  name: 'Electronics & Gadgets',   emoji: '📱', count: 95  },
  { id: 'c3',  name: 'Beauty & Personal Care',  emoji: '💄', count: 85  },
  { id: 'c4',  name: 'Home & Furniture',        emoji: '🏠', count: 60  },
  { id: 'c5',  name: 'Food & Groceries',        emoji: '🛒', count: 110 },
  { id: 'c6',  name: 'Farming & Agriculture',   emoji: '🌾', count: 45  },
  { id: 'c7',  name: 'Vehicles & Auto Parts',   emoji: '🚗', count: 35  },
  { id: 'c8',  name: 'Phones & Computers',      emoji: '💻', count: 150 },
  { id: 'c9',  name: 'Services',                emoji: '🛠️', count: 40  },
  { id: 'c10', name: 'Property & Rentals',      emoji: '🔑', count: 25  },
  { id: 'c11', name: 'Handmade & Crafts',       emoji: '🎨', count: 30  },
  { id: 'c12', name: 'Thrift / Second Hand',    emoji: '👕', count: 80  },
  { id: 'c13', name: 'Baby Products',           emoji: '👶', count: 50  },
  { id: 'c14', name: 'Sports & Fitness',        emoji: '⚽', count: 20  },
  { id: 'c15', name: 'Books & Education',       emoji: '📚', count: 45  },
  { id: 'c16', name: 'Construction Materials',  emoji: '🧱', count: 15  },
  { id: 'c17', name: "Women's Dresses",         emoji: '👗', count: 98  },
  { id: 'c18', name: "Women's Tops",            emoji: '👚', count: 112 },
  { id: 'c19', name: "Women's Bottoms",         emoji: '👖', count: 76  },
  { id: 'c20', name: 'Outerwear & Jackets',     emoji: '🧥', count: 54  },
  { id: 'c21', name: 'Activewear',              emoji: '🏋️', count: 67  },
  { id: 'c22', name: "Men's Shirts & Tops",     emoji: '👔', count: 89  },
  { id: 'c23', name: "Men's Shorts & Pants",    emoji: '🩳', count: 61  },
  { id: 'c24', name: "Kids' Clothing",          emoji: '🧒', count: 73  },
  { id: 'c25', name: 'Swimwear',                emoji: '👙', count: 42  },
  { id: 'c26', name: 'Lingerie & Sleepwear',    emoji: '🌙', count: 38  },
  { id: 'c27', name: 'Heels & Sandals',         emoji: '👠', count: 59  },
  { id: 'c28', name: 'Backpacks & Luggage',     emoji: '🎒', count: 47  },
  { id: 'c29', name: 'Sunglasses & Eyewear',    emoji: '🕶️', count: 33  },
  { id: 'c30', name: 'Hair Care & Wigs',        emoji: '💇', count: 88  },
  { id: 'c31', name: 'Makeup & Cosmetics',      emoji: '💋', count: 104 },
  { id: 'c32', name: 'Nail Care',               emoji: '💅', count: 29  },
  { id: 'c33', name: 'Home Decor',              emoji: '🏡', count: 65  },
  { id: 'c34', name: 'Bedding & Pillows',       emoji: '🛏️', count: 41  },
  { id: 'c35', name: 'Kitchen Gadgets',         emoji: '🍳', count: 57  },
  { id: 'c36', name: 'Yoga & Pilates',          emoji: '🧘', count: 31  },
  { id: 'c37', name: 'Plus Size Fashion',       emoji: '🌟', count: 82  },
  { id: 'c38', name: 'Pet Supplies',            emoji: '🐾', count: 36  },
  { id: 'c39', name: 'Fresh Produce',           emoji: '🥬', count: 65  },
  { id: 'c40', name: 'Dairy & Eggs',            emoji: '🥛', count: 48  },
  { id: 'c41', name: 'Meat & Poultry',          emoji: '🥩', count: 42  },
  { id: 'c42', name: 'Beverages & Drinks',      emoji: '🥤', count: 58  },
  { id: 'c43', name: 'Household Cleaning',      emoji: '🧹', count: 35  },
  { id: 'c44', name: 'Bread & Bakery',          emoji: '🍞', count: 30  },
  { id: 'c45', name: 'Smart TVs & Displays',    emoji: '📺', count: 45  },
  { id: 'c46', name: 'Gaming & Consoles',       emoji: '🎮', count: 38  },
  { id: 'c47', name: 'Cameras & Photography',   emoji: '📷', count: 29  },
  { id: 'c48', name: 'Living Room Furniture',   emoji: '🛋️', count: 52  },
  { id: 'c49', name: 'Bedroom Furniture',       emoji: '🛏️', count: 44  },
  { id: 'c50', name: 'Office Furniture',        emoji: '🪑', count: 33  },
];

// ─── Data arrays (moved to Supabase) ─────────────────────────────────
// These are intentionally empty. Use the hooks in src/lib/hooks/useProducts.ts
// to fetch live data: useProducts(), useSellers()

export const sellers: Seller[] = [];
export const products: Product[] = [];
export const mockProducts = products; // backwards compat alias
export const mockOrders: Order[] = [];


// ─── Testimonials ─────────────────────────────────────────────────────
export const testimonials: Testimonial[] = [
  {
    id: 't1', name: 'Tino M.', location: 'Bulawayo', role: 'buyer', rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    text: 'Ordered earbuds from TechHaven and got them same day via InDrive. The escrow gave me peace of mind — my money was safe the whole time.',
  },
  {
    id: 't2', name: 'Rumbidzai C.', location: 'Harare', role: 'buyer', rating: 5,
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face',
    text: 'Finally a platform where I can shop from verified sellers without worrying about scams. The EcoCash integration is seamless!',
  },
  {
    id: 't3', name: 'Farai P.', location: 'Chitungwiza', role: 'seller', rating: 5,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
    text: 'I started selling on Msika 3 months ago and already have 50+ orders. The seller dashboard makes managing everything so easy.',
  },
  {
    id: 't4', name: 'Chipo N.', location: 'Masvingo', role: 'buyer', rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    text: 'Love that I can pay with EcoCash and choose my own delivery driver. Bought a craft basket and it arrived perfectly packed.',
  },
];

// ─── Helper functions ─────────────────────────────────────────────────
// These operate on whatever array is passed in or on the (now empty) products/sellers arrays.
// Pages should pass in data from useProducts() / useSellers() hooks instead.

export const getProductById  = (id: string) => products.find(p => p.id === id);
export const getSellerById   = (id: string) => sellers.find(s => s.id === id);
export const getProductsBySeller   = (sellerId: string) => products.filter(p => p.sellerId === sellerId);
export const getProductsByCategory = (cat: string)      => products.filter(p => p.category === cat);
export const getFeaturedSellers    = ()                  => sellers.filter(s => s.verified).slice(0, 3);
export const getTrendingProducts   = ()                  => products.slice(0, 8);
export const getDealProducts       = ()                  => products.filter(p => p.isDeal).slice(0, 4);

export const getSimilarProducts = (productId: string, limit = 4): Product[] => {
  const product = getProductById(productId);
  if (!product) return [];
  return products.filter(p => p.id !== productId && p.category === product.category).slice(0, limit);
};

export const getCustomersAlsoBought = (productId: string, limit = 4): Product[] => {
  const product = getProductById(productId);
  if (!product) return [];
  const priceMin = product.price * 0.5;
  const priceMax = product.price * 2;
  return products
    .filter(p => p.id !== productId && p.category !== product.category && p.price >= priceMin && p.price <= priceMax)
    .slice(0, limit);
};

export const getFrequentlyBoughtTogether = (productId: string, limit = 3): Product[] => {
  const product = getProductById(productId);
  if (!product) return [];
  const sellerProds = products.filter(p => p.id !== productId && p.sellerId === product.sellerId);
  const otherProds  = products.filter(p => p.id !== productId && p.sellerId !== product.sellerId && p.category !== product.category);
  return [...sellerProds.slice(0, 2), ...otherProds.slice(0, 1)].slice(0, limit);
};

// ─── Stat helpers (deterministic, based on ID hash) ──────────────────

export const getStockLeft = (id: string): number => {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return (hash % 12) + 2;
};

export const getViewingCount = (id: string): number => {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return (hash % 18) + 3;
};

export const getRecentPurchaseCount = (id: string): number => {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return (hash % 30) + 5;
};

export const getBoughtTodayCount = (id: string): number => {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return (hash % 20) + 3;
};

export const getDealEndTime = (productId: string): { hours: number; minutes: number; seconds: number } => {
  const hash = productId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return { hours: (hash % 23) + 1, minutes: (hash % 59) + 1, seconds: (hash % 59) + 1 };
};

// Returns a platform-generated badge — sellers cannot control this directly.
// Priority: high sales → discounts → rating
export const getSmartBadge = (product: Product): { label: string; color: string } | null => {
  if (product.reviewCount >= 50) return { label: 'Best Seller', color: '#CE1126' };
  if (product.originalPrice && product.originalPrice > product.price) {
    const disc = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    if (disc >= 15) return { label: 'Hot Deal', color: '#f97316' };
  }
  if (product.rating >= 4.7 && product.reviewCount >= 20) return { label: 'Top Rated', color: '#009739' };
  // Tag-based (platform/admin can add these via the tags field)
  const tags = product.tags.map(t => t.toLowerCase());
  if (tags.includes('trending')) return { label: 'Trending', color: '#009739' };
  return null;
};

// Auto-detects if a product is "new" (created within the last 30 days)
export const isProductNew = (product: Product): boolean => {
  if (!product.createdAt) return product.isNew ?? false;
  const created = new Date(product.createdAt).getTime();
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return created >= thirtyDaysAgo;
};

export const getDeliveryEstimate = (badge: string): string => {
  if (badge === 'Same-Day Delivery') return 'Today';
  if (badge === 'Free Delivery') return 'Tomorrow';
  return '1-3 days';
};

export const FREE_DELIVERY_THRESHOLD = 50;
