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
  { id: 'c1', name: 'Fashion & Clothing', emoji: '👗', count: 120 },
  { id: 'c2', name: 'Electronics & Gadgets', emoji: '📱', count: 95 },
  { id: 'c3', name: 'Beauty & Personal Care', emoji: '💄', count: 85 },
  { id: 'c4', name: 'Home & Furniture', emoji: '🏠', count: 60 },
  { id: 'c5', name: 'Food & Groceries', emoji: '🛒', count: 110 },
  { id: 'c6', name: 'Farming & Agriculture', emoji: '🌾', count: 45 },
  { id: 'c7', name: 'Vehicles & Auto Parts', emoji: '🚗', count: 35 },
  { id: 'c8', name: 'Phones & Computers', emoji: '💻', count: 150 },
  { id: 'c9', name: 'Services', emoji: '🛠️', count: 40 },
  { id: 'c10', name: 'Property & Rentals', emoji: '🔑', count: 25 },
  { id: 'c11', name: 'Handmade & Crafts', emoji: '🎨', count: 30 },
  { id: 'c12', name: 'Thrift / Second Hand', emoji: '👕', count: 80 },
  { id: 'c13', name: 'Baby Products', emoji: '👶', count: 50 },
  { id: 'c14', name: 'Sports & Fitness',       emoji: '⚽', count: 20  },
  { id: 'c15', name: 'Books & Education',      emoji: '📚', count: 45  },
  { id: 'c16', name: 'Construction Materials', emoji: '🧱', count: 15  },
  // ── Shein-style categories ──────────────────────────────────────────
  { id: 'c17', name: "Women's Dresses",       emoji: '👗', count: 98  },
  { id: 'c18', name: "Women's Tops",          emoji: '👚', count: 112 },
  { id: 'c19', name: "Women's Bottoms",       emoji: '👖', count: 76  },
  { id: 'c20', name: 'Outerwear & Jackets',   emoji: '🧥', count: 54  },
  { id: 'c21', name: 'Activewear',            emoji: '🏋️', count: 67  },
  { id: 'c22', name: "Men's Shirts & Tops",   emoji: '👔', count: 89  },
  { id: 'c23', name: "Men's Shorts & Pants",  emoji: '🩳', count: 61  },
  { id: 'c24', name: "Kids' Clothing",        emoji: '🧒', count: 73  },
  { id: 'c25', name: 'Swimwear',              emoji: '👙', count: 42  },
  { id: 'c26', name: 'Lingerie & Sleepwear',  emoji: '🌙', count: 38  },
  { id: 'c27', name: 'Heels & Sandals',       emoji: '👠', count: 59  },
  { id: 'c28', name: 'Backpacks & Luggage',   emoji: '🎒', count: 47  },
  { id: 'c29', name: 'Sunglasses & Eyewear',  emoji: '🕶️', count: 33  },
  { id: 'c30', name: 'Hair Care & Wigs',      emoji: '💇', count: 88  },
  { id: 'c31', name: 'Makeup & Cosmetics',    emoji: '💋', count: 104 },
  { id: 'c32', name: 'Nail Care',             emoji: '💅', count: 29  },
  { id: 'c33', name: 'Home Decor',            emoji: '🏡', count: 65  },
  { id: 'c34', name: 'Bedding & Pillows',     emoji: '🛏️', count: 41  },
  { id: 'c35', name: 'Kitchen Gadgets',       emoji: '🍳', count: 57  },
  { id: 'c36', name: 'Yoga & Pilates',        emoji: '🧘', count: 31  },
  { id: 'c37', name: 'Plus Size Fashion',     emoji: '🌟', count: 82  },
  { id: 'c38', name: 'Pet Supplies',          emoji: '🐾', count: 36  },
  // ── Supermarket ────────────────────────────────────────────────────────
  { id: 'c39', name: 'Fresh Produce',         emoji: '🥬', count: 65  },
  { id: 'c40', name: 'Dairy & Eggs',          emoji: '🥛', count: 48  },
  { id: 'c41', name: 'Meat & Poultry',        emoji: '🥩', count: 42  },
  { id: 'c42', name: 'Beverages & Drinks',    emoji: '🥤', count: 58  },
  { id: 'c43', name: 'Household Cleaning',    emoji: '🧹', count: 35  },
  { id: 'c44', name: 'Bread & Bakery',        emoji: '🍞', count: 30  },
  // ── Tech Store ─────────────────────────────────────────────────────────
  { id: 'c45', name: 'Smart TVs & Displays',  emoji: '📺', count: 45  },
  { id: 'c46', name: 'Gaming & Consoles',     emoji: '🎮', count: 38  },
  { id: 'c47', name: 'Cameras & Photography', emoji: '📷', count: 29  },
  // ── Furniture Store ────────────────────────────────────────────────────
  { id: 'c48', name: 'Living Room Furniture', emoji: '🛋️', count: 52  },
  { id: 'c49', name: 'Bedroom Furniture',     emoji: '🛏️', count: 44  },
  { id: 'c50', name: 'Office Furniture',      emoji: '🪑', count: 33  },
];

// ─── Sellers ────────────────────────────────────────────────────────

export const sellers: Seller[] = [
  {
    id: 's1',
    name: 'TechHaven ZW',
    rating: 4.9,
    reviewCount: 342,
    logo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    banner: 'https://images.unsplash.com/photo-1673718424091-5fb734062c05?w=800&h=300&fit=crop',
    verified: true,
    location: 'Harare CBD',
    category: 'Electronics',
    description: 'Your one-stop shop for phones, laptops, and accessories. All products come with a warranty. We deliver across Harare the same day.',
    whatsapp: '+263771234567',
    followers: 2400,
    joined: 'Jan 2024',
    responseTime: 'Usually replies in 5 min',
    productCount: 24,
  },
  {
    id: 's2',
    name: 'ThriftKing Harare',
    rating: 4.7,
    reviewCount: 189,
    logo: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150',
    banner: 'https://images.unsplash.com/photo-1614990354198-b06764dcb13c?w=800&h=300&fit=crop',
    verified: true,
    location: 'Avondale, Harare',
    category: 'Thrift Clothes',
    description: 'Premium grade-A thrift clothes from the UK and US. Jeans, jackets, dresses, and more. Fresh bales weekly.',
    whatsapp: '+263772345678',
    followers: 1800,
    joined: 'Mar 2024',
    responseTime: 'Usually replies in 15 min',
    productCount: 48,
  },
  {
    id: 's3',
    name: 'Naturals ZW',
    rating: 4.8,
    reviewCount: 210,
    logo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    banner: 'https://images.unsplash.com/photo-1648203276014-20f97ba1f817?w=800&h=300&fit=crop',
    verified: true,
    location: 'Borrowdale, Harare',
    category: 'Cosmetics & Beauty',
    description: 'Locally made organic skincare products using natural Zimbabwean ingredients. Shea butter, marula oil, and aloe vera based products.',
    whatsapp: '+263773456789',
    followers: 3200,
    joined: 'Nov 2023',
    responseTime: 'Usually replies in 10 min',
    productCount: 18,
  },
  {
    id: 's4',
    name: 'SneakerHeadz ZW',
    rating: 4.6,
    reviewCount: 156,
    logo: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150',
    banner: 'https://images.unsplash.com/photo-1554203713-aa56c626d2fa?w=800&h=300&fit=crop',
    verified: false,
    location: 'Eastlea, Harare',
    category: 'Sneakers & Shoes',
    description: 'Authentic sneakers and shoes. Nike, Adidas, Jordan — all verified original. Free delivery in Harare for orders over $100.',
    whatsapp: '+263774567890',
    followers: 950,
    joined: 'Jun 2024',
    responseTime: 'Usually replies in 20 min',
    productCount: 32,
  },
  {
    id: 's5',
    name: 'Mbuya\'s Kitchen',
    rating: 4.9,
    reviewCount: 278,
    logo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    banner: 'https://images.unsplash.com/photo-1552825896-8059df63a1fb?w=800&h=300&fit=crop',
    verified: true,
    location: 'Mbare, Harare',
    category: 'Food & Snacks',
    description: 'Authentic Zimbabwean snacks and groceries. Maputi, biltong, dried mopane worms, and more. Taste of home delivered to your door.',
    whatsapp: '+263775678901',
    followers: 4100,
    joined: 'Sep 2023',
    responseTime: 'Usually replies in 8 min',
    productCount: 22,
  },
  {
    id: 's6',
    name: 'ZimCrafts Studio',
    rating: 4.7,
    reviewCount: 98,
    logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    banner: 'https://images.unsplash.com/photo-1771971882340-990a6cd89760?w=800&h=300&fit=crop',
    verified: true,
    location: 'Chitungwiza',
    category: 'Art & Crafts',
    description: 'Handmade Zimbabwean crafts — stone sculptures, woven baskets, and beaded jewelry. Each piece tells a story.',
    whatsapp: '+263776789012',
    followers: 720,
    joined: 'Feb 2024',
    responseTime: 'Usually replies in 30 min',
    productCount: 15,
  },
];

// ─── Products ───────────────────────────────────────────────────────

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Wireless Earbuds Pro',
    description: 'High-quality Bluetooth 5.3 earbuds with active noise cancellation, 30-hour battery life, and IPX5 water resistance. Perfect for commuting in Harare.',
    price: 45,
    originalPrice: 65,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1655325673452-4cabf9f2a85e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGVhcmJ1ZHMlMjBvbiUyMGRlc2t8ZW58MXx8fHwxNzcyNzIzNDMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    images: ['https://images.unsplash.com/photo-1655325673452-4cabf9f2a85e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGVhcmJ1ZHMlMjBvbiUyMGRlc2t8ZW58MXx8fHwxNzcyNzIzNDMxfDA&ixlib=rb-4.1.0&q=80&w=1080'],
    rating: 4.8,
    reviewCount: 124,
    reviews: [
      { id: 'r1', user: 'Tino M.', rating: 5, comment: 'Amazing sound quality for the price. Battery lasts me the whole week!', date: '2 weeks ago' },
      { id: 'r2', user: 'Rufaro K.', rating: 4, comment: 'Good earbuds, noise cancellation works well in kombis.', date: '1 month ago' },
    ],
    sellerId: 's1',
    sellerName: 'TechHaven ZW',
    tags: ['wireless', 'bluetooth', 'earbuds', 'music'],
    isNew: false,
    isDeal: true,
    inStock: true,
    deliveryBadge: 'Same-Day Delivery',
    paymentMethods: ['EcoCash', 'OneMoney', 'Cash on Delivery'],
  },
  {
    id: 'p2',
    name: 'Vintage Denim Jacket',
    description: 'Classic 90s style grade-A thrift denim jacket in excellent condition. Imported from the UK. Available in sizes M-XL.',
    price: 25,
    originalPrice: 40,
    category: 'Thrift Clothes',
    image: 'https://images.unsplash.com/photo-1614990354198-b06764dcb13c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2xvdGhpbmclMjByYWNrfGVufDF8fHx8MTc3MjY3MjU1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    images: ['https://images.unsplash.com/photo-1614990354198-b06764dcb13c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2xvdGhpbmclMjByYWNrfGVufDF8fHx8MTc3MjY3MjU1NHww&ixlib=rb-4.1.0&q=80&w=1080'],
    rating: 4.5,
    reviewCount: 89,
    reviews: [
      { id: 'r3', user: 'Kudzi R.', rating: 5, comment: 'Perfect condition, looks brand new. Fast delivery too!', date: '3 days ago' },
    ],
    sellerId: 's2',
    sellerName: 'ThriftKing Harare',
    tags: ['thrift', 'denim', 'jacket', 'vintage'],
    isNew: false,
    isDeal: true,
    inStock: true,
    deliveryBadge: 'Free Delivery',
    paymentMethods: ['EcoCash', 'Cash on Delivery'],
  },
  {
    id: 'p3',
    name: 'Organic Shea Butter Cream',
    description: 'Locally made 100% organic face and body cream. Enriched with shea butter and marula oil. Suitable for all skin types. 250ml jar.',
    price: 12,
    category: 'Cosmetics & Beauty',
    image: 'https://images.unsplash.com/photo-1597931752949-98c74b5b159f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMGNyZWFtJTIwYm90dGxlfGVufDF8fHx8MTc3MjYxNzkzNnww&ixlib=rb-4.1.0&q=80&w=1080',
    images: ['https://images.unsplash.com/photo-1597931752949-98c74b5b159f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMGNyZWFtJTIwYm90dGxlfGVufDF8fHx8MTc3MjYxNzkzNnww&ixlib=rb-4.1.0&q=80&w=1080'],
    rating: 4.9,
    reviewCount: 210,
    reviews: [
      { id: 'r4', user: 'Chipo N.', rating: 5, comment: 'My skin has never felt this good! 100% recommend.', date: '1 week ago' },
      { id: 'r5', user: 'Nyasha T.', rating: 5, comment: 'Best local skincare product I have used. Love that it is organic.', date: '2 weeks ago' },
    ],
    sellerId: 's3',
    sellerName: 'Naturals ZW',
    tags: ['skincare', 'organic', 'shea butter', 'beauty'],
    isNew: true,
    isDeal: false,
    inStock: true,
    deliveryBadge: 'Same-Day Delivery',
    paymentMethods: ['EcoCash', 'Innbucks', 'Cash on Delivery'],
  },
  {
    id: 'p4',
    name: 'Air Force 1 Low White',
    description: 'Classic Nike Air Force 1 Low in triple white. 100% authentic, brand new in box. Sizes 7-12 available.',
    price: 95,
    originalPrice: 130,
    category: 'Sneakers & Shoes',
    image: 'https://images.unsplash.com/photo-1554203713-aa56c626d2fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbmVha2VycyUyMG5pa2UlMjBzdHJlZXR8ZW58MXx8fHwxNzcyNzIzNDMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    images: ['https://images.unsplash.com/photo-1554203713-aa56c626d2fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbmVha2VycyUyMG5pa2UlMjBzdHJlZXR8ZW58MXx8fHwxNzcyNzIzNDMxfDA&ixlib=rb-4.1.0&q=80&w=1080'],
    rating: 4.7,
    reviewCount: 342,
    reviews: [
      { id: 'r6', user: 'Tanaka Z.', rating: 5, comment: 'Legit pair! Came in original box with all tags.', date: '5 days ago' },
    ],
    sellerId: 's4',
    sellerName: 'SneakerHeadz ZW',
    tags: ['nike', 'sneakers', 'air force', 'shoes'],
    isNew: false,
    isDeal: true,
    inStock: true,
    deliveryBadge: 'Free Delivery',
    paymentMethods: ['EcoCash', 'OneMoney', 'Bank Transfer'],
  },
  {
    id: 'p5',
    name: 'Professional Laptop 15"',
    description: 'High-performance laptop with Intel i5, 8GB RAM, 256GB SSD. Perfect for students and professionals. 1 year warranty included.',
    price: 450,
    originalPrice: 520,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBvbiUyMGRlc2t8ZW58MXx8fHwxNzcyNzIzNDMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBvbiUyMGRlc2t8ZW58MXx8fHwxNzcyNzIzNDMxfDA&ixlib=rb-4.1.0&q=80&w=1080'],
    rating: 4.6,
    reviewCount: 55,
    reviews: [
      { id: 'r7', user: 'Brian M.', rating: 4, comment: 'Good laptop for the price. Runs well for office work.', date: '2 weeks ago' },
    ],
    sellerId: 's1',
    sellerName: 'TechHaven ZW',
    tags: ['laptop', 'computer', 'work', 'student'],
    isNew: false,
    isDeal: true,
    inStock: true,
    deliveryBadge: 'Same-Day Delivery',
    paymentMethods: ['EcoCash', 'Bank Transfer'],
  },
  {
    id: 'p6',
    name: 'Ankara Print Dress',
    description: 'Beautiful handmade Ankara print dress with modern cut. African wax fabric, tailored in Harare. Available in sizes S-XXL.',
    price: 35,
    category: 'Traditional Wear',
    image: 'https://images.unsplash.com/photo-1760907949889-eb62b7fd9f75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwdHJhZGl0aW9uYWwlMjBkcmVzcyUyMGZhYnJpY3xlbnwxfHx8fDE3NzI3MjQ3NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    images: ['https://images.unsplash.com/photo-1760907949889-eb62b7fd9f75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwdHJhZGl0aW9uYWwlMjBkcmVzcyUyMGZhYnJpY3xlbnwxfHx8fDE3NzI3MjQ3NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    rating: 4.8,
    reviewCount: 67,
    reviews: [
      { id: 'r8', user: 'Rumbidzai C.', rating: 5, comment: 'Stunning dress! Got so many compliments at church.', date: '1 week ago' },
    ],
    sellerId: 's6',
    sellerName: 'ZimCrafts Studio',
    tags: ['ankara', 'dress', 'african', 'traditional'],
    isNew: true,
    isDeal: false,
    inStock: true,
    deliveryBadge: 'Home Delivery',
    paymentMethods: ['EcoCash', 'Cash on Delivery'],
  },
  {
    id: 'p7',
    name: 'Maputi & Biltong Pack',
    description: 'Authentic Zimbabwean snack combo. 500g maputi (popcorn) and 250g beef biltong. Perfect for movie nights or sharing.',
    price: 8,
    category: 'Food & Snacks',
    image: 'https://images.unsplash.com/photo-1589752882051-69148918f193?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmllZCUyMHNuYWNrcyUyMG51dHMlMjBwYWNrYWdlZCUyMGZvb2R8ZW58MXx8fHwxNzcyNzI0NzUxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    images: ['https://images.unsplash.com/photo-1589752882051-69148918f193?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmllZCUyMHNuYWNrcyUyMG51dHMlMjBwYWNrYWdlZCUyMGZvb2R8ZW58MXx8fHwxNzcyNzI0NzUxfDA&ixlib=rb-4.1.0&q=80&w=1080'],
    rating: 4.9,
    reviewCount: 312,
    reviews: [
      { id: 'r9', user: 'Takudzwa S.', rating: 5, comment: 'Best biltong in Harare! Always fresh.', date: '2 days ago' },
    ],
    sellerId: 's5',
    sellerName: "Mbuya's Kitchen",
    tags: ['snacks', 'biltong', 'maputi', 'zimbabwe'],
    isNew: false,
    isDeal: false,
    inStock: true,
    deliveryBadge: 'Same-Day Delivery',
    paymentMethods: ['EcoCash', 'Cash on Delivery'],
  },
  {
    id: 'p8',
    name: 'Bluetooth Portable Speaker',
    description: 'Powerful 20W portable Bluetooth speaker with deep bass. 12-hour battery, waterproof IPX7. Great for braais and outdoor events.',
    price: 35,
    originalPrice: 50,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1598034989845-48532781987e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVldG9vdGglMjBzcGVha2VyJTIwcG9ydGFibGUlMjBtdXNpY3xlbnwxfHx8fDE3NzI3MjQ3NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    images: ['https://images.unsplash.com/photo-1598034989845-48532781987e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVldG9vdGglMjBzcGVha2VyJTIwcG9ydGFibGUlMjBtdXNpY3xlbnwxfHx8fDE3NzI3MjQ3NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    rating: 4.5,
    reviewCount: 78,
    reviews: [
      { id: 'r10', user: 'Farai P.', rating: 4, comment: 'Great sound for the price. Use it at every braai.', date: '1 week ago' },
    ],
    sellerId: 's1',
    sellerName: 'TechHaven ZW',
    tags: ['speaker', 'bluetooth', 'music', 'portable'],
    isNew: false,
    isDeal: true,
    inStock: true,
    deliveryBadge: 'Same-Day Delivery',
    paymentMethods: ['EcoCash', 'OneMoney'],
  },
  {
    id: 'p9',
    name: 'Fresh Vegetables Box',
    description: 'Weekly fresh vegetable box with seasonal produce. Includes tomatoes, onions, green peppers, carrots, and leafy greens. Sourced from local farms.',
    price: 15,
    category: 'Groceries',
    image: 'https://images.unsplash.com/photo-1552825896-8059df63a1fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHZlZ2V0YWJsZXMlMjBtYXJrZXQlMjBzdGFsbHxlbnwxfHx8fDE3NzI2MjgyMzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    images: ['https://images.unsplash.com/photo-1552825896-8059df63a1fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHZlZ2V0YWJsZXMlMjBtYXJrZXQlMjBzdGFsbHxlbnwxfHx8fDE3NzI2MjgyMzd8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    rating: 4.7,
    reviewCount: 145,
    reviews: [],
    sellerId: 's5',
    sellerName: "Mbuya's Kitchen",
    tags: ['vegetables', 'fresh', 'groceries', 'organic'],
    isNew: false,
    isDeal: false,
    inStock: true,
    deliveryBadge: 'Free Delivery',
    paymentMethods: ['EcoCash', 'Cash on Delivery'],
  },
  {
    id: 'p10',
    name: 'Woven Craft Basket',
    description: 'Handwoven traditional Zimbabwean basket. Made from natural materials by skilled artisans in Chitungwiza. Perfect for home decor.',
    price: 18,
    category: 'Art & Crafts',
    image: 'https://images.unsplash.com/photo-1771971882340-990a6cd89760?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kbWFkZSUyMHdvdmVuJTIwYmFza2V0JTIwY3JhZnR8ZW58MXx8fHwxNzcyNzI0NzQ3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    images: ['https://images.unsplash.com/photo-1771971882340-990a6cd89760?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kbWFkZSUyMHdvdmVuJTIwYmFza2V0JTIwY3JhZnR8ZW58MXx8fHwxNzcyNzI0NzQ3fDA&ixlib=rb-4.1.0&q=80&w=1080'],
    rating: 4.8,
    reviewCount: 42,
    reviews: [],
    sellerId: 's6',
    sellerName: 'ZimCrafts Studio',
    tags: ['handmade', 'basket', 'crafts', 'decor'],
    isNew: true,
    isDeal: false,
    inStock: true,
    deliveryBadge: 'Home Delivery',
    paymentMethods: ['EcoCash', 'Cash on Delivery'],
  },
  {
    id: 'p11',
    name: 'Beauty Skincare Set',
    description: 'Complete skincare routine set with cleanser, toner, moisturizer and serum. Made with African botanical extracts.',
    price: 28,
    originalPrice: 38,
    category: 'Cosmetics & Beauty',
    image: 'https://images.unsplash.com/photo-1648203276014-20f97ba1f817?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYmVhdXR5JTIwc2tpbmNhcmUlMjBwcm9kdWN0c3xlbnwxfHx8fDE3NzI3MjQ3NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    images: ['https://images.unsplash.com/photo-1648203276014-20f97ba1f817?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYmVhdXR5JTIwc2tpbmNhcmUlMjBwcm9kdWN0c3xlbnwxfHx8fDE3NzI3MjQ3NDd8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    rating: 4.6,
    reviewCount: 88,
    reviews: [],
    sellerId: 's3',
    sellerName: 'Naturals ZW',
    tags: ['skincare', 'beauty', 'set', 'organic'],
    isNew: false,
    isDeal: true,
    inStock: true,
    deliveryBadge: 'Same-Day Delivery',
    paymentMethods: ['EcoCash', 'Innbucks'],
  },
  {
    id: 'p12',
    name: 'Phone Charger & Cable Kit',
    description: 'Fast charging 20W adapter with USB-C and Lightning cables. Compatible with iPhone and Android. Includes car charger.',
    price: 15,
    category: 'Mobile Accessories',
    image: 'https://images.unsplash.com/photo-1770418000074-fa16c0a53e82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwYWNjZXNzb3JpZXMlMjBjaGFyZ2VyfGVufDF8fHx8MTc3MjcyNDc0N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    images: ['https://images.unsplash.com/photo-1770418000074-fa16c0a53e82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwYWNjZXNzb3JpZXMlMjBjaGFyZ2VyfGVufDF8fHx8MTc3MjcyNDc0N3ww&ixlib=rb-4.1.0&q=80&w=1080'],
    rating: 4.4,
    reviewCount: 201,
    reviews: [],
    sellerId: 's1',
    sellerName: 'TechHaven ZW',
    tags: ['charger', 'phone', 'cable', 'fast charging'],
    isNew: false,
    isDeal: false,
    inStock: true,
    deliveryBadge: 'Same-Day Delivery',
    paymentMethods: ['EcoCash', 'Cash on Delivery'],
  },
  {
    id: 'p13',
    name: 'Baby Clothes Bundle (0-12m)',
    description: '10-piece baby clothing set including bodysuits, rompers, bibs, and socks. Soft cotton, gender neutral colours.',
    price: 22,
    category: 'Baby & Kids',
    image: 'https://images.unsplash.com/photo-1622290291165-d341f1938b8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwY2xvdGhlcyUyMHRveXMlMjBjaGlsZHJlbnxlbnwxfHx8fDE3NzI3MjQ3NDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    images: ['https://images.unsplash.com/photo-1622290291165-d341f1938b8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwY2xvdGhlcyUyMHRveXMlMjBjaGlsZHJlbnxlbnwxfHx8fDE3NzI3MjQ3NDh8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    rating: 4.7,
    reviewCount: 56,
    reviews: [],
    sellerId: 's2',
    sellerName: 'ThriftKing Harare',
    tags: ['baby', 'clothes', 'kids', 'bundle'],
    isNew: true,
    isDeal: false,
    inStock: true,
    deliveryBadge: 'Home Delivery',
    paymentMethods: ['EcoCash', 'Cash on Delivery'],
  },
  {
    id: 'p14',
    name: 'Fitness Dumbbell Set',
    description: 'Adjustable dumbbell set with 20kg total weight. Includes foam grips and carrying case. Perfect for home workouts.',
    price: 40,
    category: 'Sports & Outdoors',
    image: 'https://images.unsplash.com/photo-1584827387150-8ae4caebe906?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjBmaXRuZXNzJTIwZXF1aXBtZW50JTIwZHVtYmJlbGxzfGVufDF8fHx8MTc3MjcyNDc0OHww&ixlib=rb-4.1.0&q=80&w=1080',
    images: ['https://images.unsplash.com/photo-1584827387150-8ae4caebe906?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjBmaXRuZXNzJTIwZXF1aXBtZW50JTIwZHVtYmJlbGxzfGVufDF8fHx8MTc3MjcyNDc0OHww&ixlib=rb-4.1.0&q=80&w=1080'],
    rating: 4.3,
    reviewCount: 34,
    reviews: [],
    sellerId: 's1',
    sellerName: 'TechHaven ZW',
    tags: ['fitness', 'gym', 'dumbbells', 'exercise'],
    isNew: false,
    isDeal: false,
    inStock: true,
    deliveryBadge: 'Home Delivery',
    paymentMethods: ['EcoCash', 'Bank Transfer'],
  },
  {
    id: 'p15',
    name: 'Kitchen Blender Set',
    description: 'Multi-function blender with 3-speed settings, 1.5L capacity. Comes with grinding attachment for peanut butter and spices.',
    price: 55,
    originalPrice: 70,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1762186540963-efa1702b3379?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwa2l0Y2hlbiUyMGFwcGxpYW5jZXMlMjBibGVuZGVyfGVufDF8fHx8MTc3MjcyNDc0OHww&ixlib=rb-4.1.0&q=80&w=1080',
    images: ['https://images.unsplash.com/photo-1762186540963-efa1702b3379?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwa2l0Y2hlbiUyMGFwcGxpYW5jZXMlMjBibGVuZGVyfGVufDF8fHx8MTc3MjcyNDc0OHww&ixlib=rb-4.1.0&q=80&w=1080'],
    rating: 4.5,
    reviewCount: 67,
    reviews: [],
    sellerId: 's1',
    sellerName: 'TechHaven ZW',
    tags: ['blender', 'kitchen', 'appliance', 'home'],
    isNew: false,
    isDeal: true,
    inStock: true,
    deliveryBadge: 'Same-Day Delivery',
    paymentMethods: ['EcoCash', 'Cash on Delivery'],
  },
  {
    id: 'p16',
    name: 'School Stationery Pack',
    description: 'Complete school stationery set with exercise books, pens, pencils, ruler, eraser, and pencil case. Great for back-to-school.',
    price: 10,
    category: 'Books & Stationery',
    image: 'https://images.unsplash.com/photo-1653491951587-282e99d6c1e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9vayUyMHBlbnxlbnwxfHx8fDE3NzI3MjQ3NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    images: ['https://images.unsplash.com/photo-1653491951587-282e99d6c1e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9vayUyMHBlbnxlbnwxfHx8fDE3NzI3MjQ3NDl8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    rating: 4.6,
    reviewCount: 89,
    reviews: [],
    sellerId: 's6',
    sellerName: 'ZimCrafts Studio',
    tags: ['stationery', 'school', 'books', 'pens'],
    isNew: false,
    isDeal: false,
    inStock: true,
    deliveryBadge: 'Home Delivery',
    paymentMethods: ['EcoCash', 'Cash on Delivery'],
  },
  {
    id: 'p17',
    name: 'Beaded Necklace Set',
    description: 'Handcrafted African beaded necklace and earring set. Unique Zimbabwean design with vibrant colours. Perfect gift.',
    price: 20,
    category: 'Jewelry & Watches',
    image: 'https://images.unsplash.com/photo-1760726743536-019e9e2b06b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwamV3ZWxyeSUyMGJlYWRzJTIwbmVja2xhY2V8ZW58MXx8fHwxNzcyNzI0NzQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    images: ['https://images.unsplash.com/photo-1760726743536-019e9e2b06b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwamV3ZWxyeSUyMGJlYWRzJTIwbmVja2xhY2V8ZW58MXx8fHwxNzcyNzI0NzQ5fDA&ixlib=rb-4.1.0&q=80&w=1080'],
    rating: 4.9,
    reviewCount: 45,
    reviews: [],
    sellerId: 's6',
    sellerName: 'ZimCrafts Studio',
    tags: ['jewelry', 'beads', 'necklace', 'handmade'],
    isNew: true,
    isDeal: false,
    inStock: true,
    deliveryBadge: 'Home Delivery',
    paymentMethods: ['EcoCash', 'Cash on Delivery'],
  },
  {
    id: 'p18',
    name: 'Leather Handbag',
    description: 'Genuine leather handbag with multiple compartments. Classic design suitable for work and going out. Brown colour.',
    price: 45,
    originalPrice: 60,
    category: 'Bags & Accessories',
    image: 'https://images.unsplash.com/photo-1760624294504-211e763ee0fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwaGFuZGJhZyUyMHdvbWVuJTIwYWNjZXNzb3JpZXN8ZW58MXx8fHwxNzcyNzI0NzUxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    images: ['https://images.unsplash.com/photo-1760624294504-211e763ee0fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwaGFuZGJhZyUyMHdvbWVuJTIwYWNjZXNzb3JpZXN8ZW58MXx8fHwxNzcyNzI0NzUxfDA&ixlib=rb-4.1.0&q=80&w=1080'],
    rating: 4.4,
    reviewCount: 33,
    reviews: [],
    sellerId: 's2',
    sellerName: 'ThriftKing Harare',
    tags: ['bag', 'leather', 'handbag', 'women'],
    isNew: false,
    isDeal: true,
    inStock: true,
    deliveryBadge: 'Free Delivery',
    paymentMethods: ['EcoCash', 'OneMoney'],
  },
  {
    id: 'p19',
    name: 'Men\'s Casual T-Shirt Pack',
    description: 'Pack of 3 premium cotton t-shirts. Round neck, comfortable fit. Available in black, white, and grey. Sizes M-XXL.',
    price: 20,
    category: "Men's Fashion",
    image: 'https://images.unsplash.com/photo-1617952125960-38d76f3659d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBjYXN1YWwlMjBzdHJlZXR3ZWFyJTIwZmFzaGlvbnxlbnwxfHx8fDE3NzI3MjQ3NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    images: ['https://images.unsplash.com/photo-1617952125960-38d76f3659d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBjYXN1YWwlMjBzdHJlZXR3ZWFyJTIwZmFzaGlvbnxlbnwxfHx8fDE3NzI3MjQ3NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    rating: 4.3,
    reviewCount: 77,
    reviews: [],
    sellerId: 's2',
    sellerName: 'ThriftKing Harare',
    tags: ['mens', 'tshirt', 'fashion', 'casual'],
    isNew: false,
    isDeal: false,
    inStock: true,
    deliveryBadge: 'Home Delivery',
    paymentMethods: ['EcoCash', 'Cash on Delivery'],
  },
  {
    id: 'p20',
    name: 'Solar Panel Kit 100W',
    description: '100W monocrystalline solar panel with charge controller and battery cables. Ideal for load shedding backup and rural areas.',
    price: 120,
    originalPrice: 150,
    category: 'Solar & Energy',
    image: 'https://images.unsplash.com/photo-1768839722298-0491a671634d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMHBhbmVsJTIwZW5lcmd5JTIwZXF1aXBtZW50fGVufDF8fHx8MTc3MjcyNDc1MHww&ixlib=rb-4.1.0&q=80&w=1080',
    images: ['https://images.unsplash.com/photo-1768839722298-0491a671634d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMHBhbmVsJTIwZW5lcmd5JTIwZXF1aXBtZW50fGVufDF8fHx8MTc3MjcyNDc1MHww&ixlib=rb-4.1.0&q=80&w=1080'],
    rating: 4.8,
    reviewCount: 28,
    reviews: [],
    sellerId: 's1',
    sellerName: 'TechHaven ZW',
    tags: ['solar', 'energy', 'panel', 'power'],
    isNew: true,
    isDeal: true,
    inStock: true,
    deliveryBadge: 'Home Delivery',
    paymentMethods: ['EcoCash', 'Bank Transfer'],
  },

  // ════════════════════════════════════════════════════════════════════
  // WOMEN'S DRESSES
  // ════════════════════════════════════════════════════════════════════
  { id:'p21', name:'Floral Wrap Midi Dress', description:'Elegant floral wrap dress with tie waist and flutter sleeves. Perfect for church, dates, and events. Sizes XS–XL.', price:28, originalPrice:42, category:"Women's Dresses", image:'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80&fit=crop'], rating:4.7, reviewCount:134, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['dress','floral','midi','women'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p22', name:'Bodycon Party Dress', description:'Sleek bodycon dress in stretch fabric. Great for nights out and celebrations. Available in black, red, and nude.', price:22, originalPrice:35, category:"Women's Dresses", image:'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80&fit=crop'], rating:4.5, reviewCount:89, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['dress','bodycon','party','evening'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','OneMoney'] },
  { id:'p23', name:'Linen Shirt Dress', description:'Relaxed linen shirt dress with button-down front and pockets. Breathable and stylish for the Zimbabwean summer.', price:32, category:"Women's Dresses", image:'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80&fit=crop'], rating:4.6, reviewCount:57, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['dress','linen','casual','summer'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p24', name:'Maxi Boho Sundress', description:'Flowing maxi sundress with boho print and adjustable straps. Light and airy for hot days. One size fits most.', price:25, category:"Women's Dresses", image:'https://images.unsplash.com/photo-1583496661160-fb5974ea5f66?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1583496661160-fb5974ea5f66?w=600&q=80&fit=crop'], rating:4.4, reviewCount:73, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['maxi','boho','sundress','beach'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p25', name:'Office Wrap Pencil Dress', description:'Sophisticated pencil dress with wrap top detail. Professional look for the workplace. Sizes S–XXL available.', price:38, originalPrice:52, category:"Women's Dresses", image:'https://images.unsplash.com/photo-1548142813-c348350df52b?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1548142813-c348350df52b?w=600&q=80&fit=crop'], rating:4.8, reviewCount:112, reviews:[{id:'rp25', user:'Ruvimbo N.', rating:5, comment:'Perfect for work! So professional and comfortable.', date:'3 days ago'}], sellerId:'s3', sellerName:'Naturals ZW', tags:['pencil','office','work','formal'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p26', name:'Satin Slip Evening Dress', description:'Elegant satin slip dress with lace trim. Perfect for weddings and formal events. Available in champagne and black.', price:45, originalPrice:65, category:"Women's Dresses", image:'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80&fit=crop'], rating:4.9, reviewCount:198, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['satin','evening','formal','wedding'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','OneMoney','Bank Transfer'] },

  // ════════════════════════════════════════════════════════════════════
  // WOMEN'S TOPS
  // ════════════════════════════════════════════════════════════════════
  { id:'p27', name:'Ribbed Crop Tank Top', description:'Stretchy ribbed crop tank in soft cotton blend. Pairs with high-waist jeans or skirts. 12 colours available.', price:9, category:"Women's Tops", image:'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80&fit=crop'], rating:4.5, reviewCount:241, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['crop','tank','ribbed','women'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p28', name:'Oversized Graphic Tee', description:'Trendy oversized graphic tee with vintage art print. Relaxed fit, 100% cotton. Sizes XS–3XL.', price:14, originalPrice:20, category:"Women's Tops", image:'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80&fit=crop'], rating:4.3, reviewCount:88, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['graphic','tee','oversized','streetwear'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p29', name:'Puff Sleeve Blouse', description:'Romantic puff sleeve blouse with tie neck. Chiffon fabric, semi-sheer. Gorgeous for office or evenings out.', price:18, category:"Women's Tops", image:'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=600&q=80&fit=crop'], rating:4.6, reviewCount:65, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['blouse','puff sleeve','chiffon','romantic'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','OneMoney'] },
  { id:'p30', name:'Lace Trim Cami Top', description:'Delicate lace trim cami with adjustable straps. Silky feel, perfect to layer or wear alone. White, black, blush.', price:12, originalPrice:18, category:"Women's Tops", image:'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80&fit=crop'], rating:4.4, reviewCount:152, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['cami','lace','top','women'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p31', name:'Off-Shoulder Ruffle Top', description:'Flirty off-shoulder top with ruffle trim. Stretchy fabric fits XS–L. Great for summer outings and braais.', price:16, category:"Women's Tops", image:'https://images.unsplash.com/photo-1543087903-1ac2364a7d78?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1543087903-1ac2364a7d78?w=600&q=80&fit=crop'], rating:4.7, reviewCount:99, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['off shoulder','ruffle','top','summer'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p32', name:'Striped Button-Down Shirt', description:'Classic striped cotton shirt with relaxed fit. Versatile piece for casual and smart-casual looks. Sizes XS–XL.', price:21, category:"Women's Tops", image:'https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=600&q=80&fit=crop'], rating:4.5, reviewCount:77, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['shirt','striped','button-down','casual'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','OneMoney'] },

  // ════════════════════════════════════════════════════════════════════
  // WOMEN'S BOTTOMS
  // ════════════════════════════════════════════════════════════════════
  { id:'p33', name:'High-Waist Skinny Jeans', description:'Classic high-waist skinny jeans in medium blue wash. Stretch denim for all-day comfort. Sizes 26–36 waist.', price:30, originalPrice:45, category:"Women's Bottoms", image:'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80&fit=crop'], rating:4.6, reviewCount:187, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['jeans','skinny','high-waist','denim'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p34', name:'Flowy Pleated Mini Skirt', description:'Chic pleated mini skirt in satin finish. Sits at waist, flares out. Available in 8 colours.', price:17, category:"Women's Bottoms", image:'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=600&q=80&fit=crop'], rating:4.5, reviewCount:63, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['skirt','mini','pleated','flowy'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p35', name:'Wide-Leg Linen Pants', description:'Relaxed wide-leg pants in breathable linen. Elastic waist, two side pockets. White, beige, and olive.', price:26, category:"Women's Bottoms", image:'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&q=80&fit=crop'], rating:4.7, reviewCount:94, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['pants','wide-leg','linen','casual'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','OneMoney'] },
  { id:'p36', name:'Ripped Boyfriend Jeans', description:'Trendy ripped boyfriend jeans with loose fit and rolled hem. Authentic worn look. Sizes 26–34 waist.', price:28, originalPrice:40, category:"Women's Bottoms", image:'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80&fit=crop'], rating:4.4, reviewCount:108, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['jeans','ripped','boyfriend','denim'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p37', name:'Satin Midi Skirt', description:'Elegant satin midi skirt with elastic waistband and side slit. Luxurious look at an affordable price.', price:22, category:"Women's Bottoms", image:'https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=600&q=80&fit=crop'], rating:4.8, reviewCount:76, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['skirt','satin','midi','elegant'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },

  // ════════════════════════════════════════════════════════════════════
  // OUTERWEAR & JACKETS
  // ════════════════════════════════════════════════════════════════════
  { id:'p38', name:'Denim Trucker Jacket', description:'Classic denim trucker jacket with brass buttons. Grade-A quality, barely worn. Sizes S–XL.', price:30, originalPrice:50, category:'Outerwear & Jackets', image:'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80&fit=crop'], rating:4.6, reviewCount:143, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['jacket','denim','trucker','outerwear'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p39', name:'Oversized Blazer', description:'Tailored oversized blazer with shoulder pads. Fashion-forward look for any occasion. Black and cream options.', price:42, category:'Outerwear & Jackets', image:'https://images.unsplash.com/photo-1594938967046-58e806a7a80a?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1594938967046-58e806a7a80a?w=600&q=80&fit=crop'], rating:4.7, reviewCount:88, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['blazer','oversized','jacket','formal'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','OneMoney'] },
  { id:'p40', name:'Windbreaker Rain Jacket', description:'Lightweight waterproof windbreaker. Perfect for rainy season. Packable into its own pocket. Unisex S–XL.', price:35, originalPrice:55, category:'Outerwear & Jackets', image:'https://images.unsplash.com/photo-1604066867965-3bcbb0ca2b94?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1604066867965-3bcbb0ca2b94?w=600&q=80&fit=crop'], rating:4.5, reviewCount:67, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['windbreaker','rain','jacket','waterproof'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p41', name:'Faux Leather Biker Jacket', description:'Edgy faux leather biker jacket with zip details. Slim fit, fully lined. Makes any outfit look fire.', price:48, originalPrice:70, category:'Outerwear & Jackets', image:'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80&fit=crop'], rating:4.8, reviewCount:211, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['leather','biker','jacket','edgy'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p42', name:'Knit Cardigan', description:'Soft knit open-front cardigan in neutral tones. Cozy and stylish for winter mornings. One size fits S–L.', price:19, category:'Outerwear & Jackets', image:'https://images.unsplash.com/photo-1611117775350-ac3950990985?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1611117775350-ac3950990985?w=600&q=80&fit=crop'], rating:4.4, reviewCount:55, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['cardigan','knit','cozy','winter'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // ACTIVEWEAR
  // ════════════════════════════════════════════════════════════════════
  { id:'p43', name:'High-Waist Gym Leggings', description:'Squat-proof high-waist leggings with side pocket. 4-way stretch fabric stays in place during workouts.', price:18, originalPrice:28, category:'Activewear', image:'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80&fit=crop'], rating:4.7, reviewCount:324, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['leggings','gym','activewear','sports'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','OneMoney'] },
  { id:'p44', name:'Sports Bra Seamless', description:'Seamless medium-support sports bra with removable pads. Moisture-wicking, perfect for yoga and gym.', price:14, category:'Activewear', image:'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80&fit=crop'], rating:4.6, reviewCount:178, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['sports bra','gym','yoga','activewear'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p45', name:'Track Suit Set', description:'Matching zip-up hoodie and jogger pants set. Soft fleece inside, great for morning runs or lounging.', price:38, originalPrice:55, category:'Activewear', image:'https://images.unsplash.com/photo-1539794830467-1f1755804d13?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1539794830467-1f1755804d13?w=600&q=80&fit=crop'], rating:4.8, reviewCount:142, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['tracksuit','hoodie','jogger','set'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p46', name:'Running Shorts 2-in-1', description:'Lightweight 2-in-1 running shorts with inner compression liner. Reflective trim for early morning runs.', price:16, category:'Activewear', image:'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80&fit=crop'], rating:4.5, reviewCount:93, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['shorts','running','gym','activewear'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p47', name:'Gym Duffle Bag', description:'Large gym duffle bag with shoe compartment and wet pocket. Water-resistant material. 40L capacity.', price:25, category:'Activewear', image:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80&fit=crop'], rating:4.4, reviewCount:61, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['bag','gym','duffle','sports'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','OneMoney'] },

  // ════════════════════════════════════════════════════════════════════
  // MEN'S SHIRTS & TOPS
  // ════════════════════════════════════════════════════════════════════
  { id:'p48', name:'Oxford Button-Down Shirt', description:'Classic Oxford cotton shirt with button-down collar. Slim fit, wrinkle-resistant. Navy, white, and light blue.', price:22, category:"Men's Shirts & Tops", image:'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80&fit=crop'], rating:4.6, reviewCount:167, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['shirt','oxford','button-down','mens'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p49', name:'Men\'s Polo Shirt', description:'Premium cotton polo shirt with ribbed collar and 3-button placket. Available in 10 colours. Sizes S–3XL.', price:18, originalPrice:28, category:"Men's Shirts & Tops", image:'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80&fit=crop'], rating:4.5, reviewCount:213, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['polo','shirt','mens','classic'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p50', name:'Graphic Hoodie', description:'Bold graphic print hoodie in heavy cotton. Kangaroo pocket, adjustable drawstring. XS–3XL.', price:28, category:"Men's Shirts & Tops", image:'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80&fit=crop'], rating:4.7, reviewCount:98, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['hoodie','graphic','streetwear','mens'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','OneMoney'] },
  { id:'p51', name:'Linen Short-Sleeve Shirt', description:'Breathable linen short-sleeve shirt. Relaxed fit, perfect for Zimbabwean heat. White, khaki, and terracotta.', price:20, category:"Men's Shirts & Tops", image:'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80&fit=crop'], rating:4.5, reviewCount:77, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['linen','shirt','short-sleeve','summer'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p52', name:'Muscle Fit Vest', description:'Fitted muscle vest in stretchy ribbed cotton. Shows off your physique. Pack of 2. Black and white.', price:12, originalPrice:18, category:"Men's Shirts & Tops", image:'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&q=80&fit=crop'], rating:4.3, reviewCount:54, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['vest','muscle','men','ribbed'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // MEN'S SHORTS & PANTS
  // ════════════════════════════════════════════════════════════════════
  { id:'p53', name:'Slim Chino Trousers', description:'Smart slim-fit chino pants in stretch cotton. No-iron finish. Perfect for work and smart-casual looks.', price:32, originalPrice:48, category:"Men's Shorts & Pants", image:'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80&fit=crop'], rating:4.6, reviewCount:132, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['chino','pants','slim','work'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p54', name:'Cargo Shorts', description:'Multi-pocket cargo shorts with elastic waistband. Durable cotton canvas. Great for outdoor activities.', price:20, category:"Men's Shorts & Pants", image:'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&q=80&fit=crop'], rating:4.4, reviewCount:86, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['cargo','shorts','outdoor','men'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p55', name:'Denim Straight Jeans', description:'Classic straight-leg jeans in mid-blue wash. Comfortable waist, regular rise. Sizes 30–40 waist.', price:35, originalPrice:50, category:"Men's Shorts & Pants", image:'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80&fit=crop'], rating:4.7, reviewCount:194, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['jeans','straight','denim','men'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','OneMoney'] },
  { id:'p56', name:'Jogger Sweatpants', description:'Comfortable slim-fit joggers with tapered leg and elastic cuffs. Soft fleece lining inside. Grey and black.', price:22, category:"Men's Shorts & Pants", image:'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80&fit=crop'], rating:4.5, reviewCount:107, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['jogger','sweatpants','casual','men'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p57', name:'Swim Trunks Board Shorts', description:'Quick-dry swim trunks with mesh liner and drawstring. Tropical print. Sizes S–3XL.', price:15, originalPrice:22, category:"Men's Shorts & Pants", image:'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=600&q=80&fit=crop'], rating:4.3, reviewCount:48, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['swim','shorts','beach','summer'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // KIDS' CLOTHING
  // ════════════════════════════════════════════════════════════════════
  { id:'p58', name:'Kids School Uniform Set', description:'Crisp white shirt and grey shorts/skirt set. Machine washable, easy-iron. Fits ages 3–12. Buy two get one free.', price:15, originalPrice:22, category:"Kids' Clothing", image:'https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=600&q=80&fit=crop'], rating:4.8, reviewCount:231, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['school','uniform','kids','children'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p59', name:'Kids Cartoon Pyjama Set', description:'Soft cotton pyjama set with popular cartoon prints. Long sleeve top and pants. Sizes 2–10 years.', price:12, category:"Kids' Clothing", image:'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80&fit=crop'], rating:4.6, reviewCount:88, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['pyjama','kids','cartoon','sleep'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p60', name:'Baby Girl Tutu Dress', description:'Adorable layered tutu dress for girls 6m–4 years. Perfect for birthdays and photoshoots. Pink, lilac, white.', price:14, category:"Kids' Clothing", image:'https://images.unsplash.com/photo-1522290291165-d341f1938b8a?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1522290291165-d341f1938b8a?w=600&q=80&fit=crop'], rating:4.9, reviewCount:142, reviews:[{id:'rp60', user:'Tatenda C.', rating:5, comment:'Bought for my daughter\'s birthday. She looked adorable!', date:'1 week ago'}], sellerId:'s3', sellerName:'Naturals ZW', tags:['baby','dress','tutu','girl'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','OneMoney'] },
  { id:'p61', name:'Boys Denim Shorts Pack', description:'Pack of 2 boys denim shorts with elastic waist. Durable and comfortable for active kids. Ages 4–14.', price:18, category:"Kids' Clothing", image:'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80&fit=crop'], rating:4.4, reviewCount:56, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['kids','boys','shorts','denim'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p62', name:'Kids Winter Fleece Jacket', description:'Warm fleece jacket with full zip and hood. Soft inside fleece keeps kids cozy in winter. Ages 2–12.', price:20, originalPrice:32, category:"Kids' Clothing", image:'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600&q=80&fit=crop'], rating:4.7, reviewCount:79, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['jacket','fleece','kids','winter'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // SWIMWEAR
  // ════════════════════════════════════════════════════════════════════
  { id:'p63', name:'Triangle Bikini Set', description:'Adjustable triangle bikini top and high-cut bottoms. UV-protective fabric, quick-dry. XS–XL.', price:20, originalPrice:32, category:'Swimwear', image:'https://images.unsplash.com/photo-1537223420-61c88cfa3e2e?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1537223420-61c88cfa3e2e?w=600&q=80&fit=crop'], rating:4.6, reviewCount:147, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['bikini','swimwear','beach','summer'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p64', name:'One-Piece Swimsuit', description:'Elegant one-piece swimsuit with tummy control panel. Ruched details and adjustable straps. Sizes XS–2XL.', price:28, category:'Swimwear', image:'https://images.unsplash.com/photo-1564415302960-4e4be1c00bfe?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1564415302960-4e4be1c00bfe?w=600&q=80&fit=crop'], rating:4.7, reviewCount:93, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['swimsuit','one-piece','tummy control','beach'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','OneMoney'] },
  { id:'p65', name:'Swim Cover-Up Kaftan', description:'Sheer printed kaftan cover-up for the beach or pool. Flows beautifully, one size fits all.', price:15, category:'Swimwear', image:'https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?w=600&q=80&fit=crop'], rating:4.4, reviewCount:52, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['cover-up','kaftan','beach','pool'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p66', name:'Rash Guard UV Shirt', description:'Long-sleeve rash guard with 50+ UPF sun protection. Perfect for swimming and outdoor sports. Unisex.', price:22, category:'Swimwear', image:'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80&fit=crop'], rating:4.5, reviewCount:38, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['rash guard','sun protection','swimming','UV'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // LINGERIE & SLEEPWEAR
  // ════════════════════════════════════════════════════════════════════
  { id:'p67', name:'Satin Pyjama Set', description:'Luxury satin pyjama set with lace trim. Cami top and wide-leg pants. Silky smooth for a great night\'s sleep.', price:24, originalPrice:38, category:'Lingerie & Sleepwear', image:'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=600&q=80&fit=crop'], rating:4.8, reviewCount:166, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['pyjama','satin','sleepwear','lingerie'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p68', name:'Cotton Bra & Panty Set', description:'Comfortable everyday cotton bra and matching panty set. Wireless, no-show, full coverage. Sizes 32A–42DD.', price:14, category:'Lingerie & Sleepwear', image:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80&fit=crop'], rating:4.5, reviewCount:88, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['bra','panty','cotton','everyday'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p69', name:'Fleece Nightgown', description:'Warm fleece nightgown with button front. Knee-length, loose fit. Perfect for cold Zimbabwean winter nights.', price:18, category:'Lingerie & Sleepwear', image:'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=600&q=80&fit=crop'], rating:4.6, reviewCount:44, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['nightgown','fleece','winter','sleep'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p70', name:'Seamless Shapewear Bodysuit', description:'Slimming seamless bodysuit with tummy control and butt lift effect. Invisible under clothes. S–3XL.', price:22, originalPrice:35, category:'Lingerie & Sleepwear', image:'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80&fit=crop'], rating:4.7, reviewCount:203, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['shapewear','bodysuit','slimming','control'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','OneMoney'] },

  // ════════════════════════════════════════════════════════════════════
  // HEELS & SANDALS
  // ════════════════════════════════════════════════════════════════════
  { id:'p71', name:'Strappy Block Heel Sandals', description:'Elegant strappy sandals with stable 7cm block heel. Padded footbed for comfort. Nude, black, and gold.', price:32, originalPrice:50, category:'Heels & Sandals', image:'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80&fit=crop'], rating:4.6, reviewCount:118, reviews:[], sellerId:'s4', sellerName:'SneakerHeadz ZW', tags:['heels','sandals','block heel','women'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p72', name:'Flat Leather Sandals', description:'Classic flat sandals in genuine leather with double buckle strap. Comfortable for all-day wear.', price:25, category:'Heels & Sandals', image:'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&q=80&fit=crop'], rating:4.5, reviewCount:74, reviews:[], sellerId:'s4', sellerName:'SneakerHeadz ZW', tags:['sandals','flat','leather','women'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p73', name:'Stiletto Pointed Heels', description:'Chic pointed-toe stilettos with 10cm heel. Faux suede, non-slip sole. Black, red, and nude. Sizes 36–42.', price:38, originalPrice:58, category:'Heels & Sandals', image:'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&q=80&fit=crop'], rating:4.7, reviewCount:86, reviews:[], sellerId:'s4', sellerName:'SneakerHeadz ZW', tags:['stiletto','heels','pointed','formal'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p74', name:'Slider Flip Flop Sandals', description:'Cushioned slider sandals with thick foam sole. Casual and comfy for everyday wear. Unisex sizing.', price:10, category:'Heels & Sandals', image:'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80&fit=crop'], rating:4.3, reviewCount:221, reviews:[], sellerId:'s4', sellerName:'SneakerHeadz ZW', tags:['slides','flip flops','casual','summer'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p75', name:'Ankle Boots Low Heel', description:'Stylish ankle boots with 5cm stacked heel and side zip. Faux leather, cushioned insole. Sizes 36–41.', price:45, originalPrice:65, category:'Heels & Sandals', image:'https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=600&q=80&fit=crop'], rating:4.8, reviewCount:95, reviews:[], sellerId:'s4', sellerName:'SneakerHeadz ZW', tags:['boots','ankle','low heel','women'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','OneMoney'] },

  // ════════════════════════════════════════════════════════════════════
  // BACKPACKS & LUGGAGE
  // ════════════════════════════════════════════════════════════════════
  { id:'p76', name:'Anti-Theft Laptop Backpack', description:'30L anti-theft backpack with USB charging port, hidden pockets, and padded laptop sleeve (fits 15.6"). Water-resistant.', price:35, originalPrice:55, category:'Backpacks & Luggage', image:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80&fit=crop'], rating:4.8, reviewCount:287, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['backpack','laptop','anti-theft','travel'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p77', name:'Canvas Tote Bag', description:'Large canvas tote bag with zip top closure and inner pockets. Eco-friendly, durable. Great for shopping and university.', price:12, category:'Backpacks & Luggage', image:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop'], rating:4.5, reviewCount:144, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['tote','canvas','bag','shopping'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p78', name:'Hard Shell Suitcase 20"', description:'Lightweight hard-shell carry-on with 360° spinner wheels and TSA lock. 20" cabin approved. 4 vibrant colours.', price:65, originalPrice:95, category:'Backpacks & Luggage', image:'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=600&q=80&fit=crop'], rating:4.7, reviewCount:61, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['suitcase','luggage','travel','carry-on'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p79', name:'Crossbody Mini Bag', description:'Compact crossbody bag with adjustable strap. Fits phone, cards, and keys. Vegan leather in 6 colours.', price:18, originalPrice:28, category:'Backpacks & Luggage', image:'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80&fit=crop'], rating:4.6, reviewCount:198, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['crossbody','mini bag','women','vegan leather'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p80', name:'School Backpack Kids', description:'Colourful school backpack for kids with ergonomic padded straps. Water-resistant, pencil case included. Ages 4–12.', price:16, category:'Backpacks & Luggage', image:'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=600&q=80&fit=crop'], rating:4.5, reviewCount:112, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['backpack','school','kids','children'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // SUNGLASSES & EYEWEAR
  // ════════════════════════════════════════════════════════════════════
  { id:'p81', name:'Polarised Aviator Sunglasses', description:'Classic aviator sunglasses with UV400 polarised lenses. Gold metal frame, anti-glare coating. Unisex.', price:22, originalPrice:35, category:'Sunglasses & Eyewear', image:'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80&fit=crop'], rating:4.6, reviewCount:177, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['sunglasses','aviator','polarised','UV protection'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p82', name:'Oversized Square Sunglasses', description:'Trendy oversized square frames in acetate. 100% UV protection. Black, tortoise, and clear options.', price:18, category:'Sunglasses & Eyewear', image:'https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=600&q=80&fit=crop'], rating:4.5, reviewCount:93, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['sunglasses','oversized','square','fashion'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p83', name:'Cat Eye Fashion Sunglasses', description:'Retro cat-eye sunglasses with coloured lenses. Lightweight plastic frame. Fun and fashionable.', price:12, originalPrice:18, category:'Sunglasses & Eyewear', image:'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&q=80&fit=crop'], rating:4.3, reviewCount:64, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['cat eye','sunglasses','retro','fashion'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p84', name:'Blue Light Glasses', description:'Stylish blue light blocking glasses for screen use. Non-prescription clear lens. Reduces eye strain for long screen sessions.', price:15, category:'Sunglasses & Eyewear', image:'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&q=80&fit=crop'], rating:4.7, reviewCount:128, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['blue light','glasses','screen','eye protection'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','OneMoney'] },

  // ════════════════════════════════════════════════════════════════════
  // HAIR CARE & WIGS
  // ════════════════════════════════════════════════════════════════════
  { id:'p85', name:'Straight Full Lace Wig 18"', description:'Premium human hair straight wig, 18 inches. Pre-plucked hairline with baby hair. Natural look and feel.', price:85, originalPrice:120, category:'Hair Care & Wigs', image:'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80&fit=crop'], rating:4.8, reviewCount:312, reviews:[{id:'rp85', user:'Chido M.', rating:5, comment:'Best wig I have bought! Looks so natural.', date:'2 days ago'}], sellerId:'s3', sellerName:'Naturals ZW', tags:['wig','hair','lace front','human hair'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p86', name:'Curly Bob Wig Synthetic', description:'Bouncy curly bob wig in synthetic fibre. Heat resistant, can be styled. Available in black, brown, and burgundy.', price:28, originalPrice:42, category:'Hair Care & Wigs', image:'https://images.unsplash.com/photo-1582095133179-bfd08e2fb6b8?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1582095133179-bfd08e2fb6b8?w=600&q=80&fit=crop'], rating:4.5, reviewCount:189, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['wig','curly','bob','synthetic'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p87', name:'Argan Oil Hair Treatment', description:'Deep conditioning argan oil hair mask. Repairs damaged hair, adds shine. 500ml jar. Suitable for all hair types.', price:16, category:'Hair Care & Wigs', image:'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&q=80&fit=crop'], rating:4.7, reviewCount:144, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['argan oil','hair','treatment','conditioning'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','OneMoney'] },
  { id:'p88', name:'Braiding Hair Extensions Pack', description:'Premium kanekalon braiding hair for box braids and Ghana braids. Silky, tangle-free. 3 packs per order.', price:12, originalPrice:18, category:'Hair Care & Wigs', image:'https://images.unsplash.com/photo-1605980413988-9ff24c537935?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1605980413988-9ff24c537935?w=600&q=80&fit=crop'], rating:4.6, reviewCount:267, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['braiding hair','extensions','kanekalon','braids'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p89', name:'Edge Control Gel Strong Hold', description:'Maximum hold edge gel for sleek edges and baby hairs. Non-flaking, water-activated. 250g jar.', price:7, category:'Hair Care & Wigs', image:'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=600&q=80&fit=crop'], rating:4.8, reviewCount:388, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['edge control','hair gel','edges','styling'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // MAKEUP & COSMETICS
  // ════════════════════════════════════════════════════════════════════
  { id:'p90', name:'Full Coverage Foundation', description:'Long-wear matte foundation with SPF 15. 24-hour coverage, sweat-resistant. 30 shades for all skin tones.', price:18, originalPrice:28, category:'Makeup & Cosmetics', image:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80&fit=crop'], rating:4.7, reviewCount:342, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['foundation','makeup','coverage','SPF'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p91', name:'Matte Lipstick Collection Set', description:'Set of 6 matte liquid lipsticks in rich, vibrant shades. Long-lasting, non-drying formula. Includes nudes and bolds.', price:22, originalPrice:35, category:'Makeup & Cosmetics', image:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80&fit=crop'], rating:4.8, reviewCount:198, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['lipstick','matte','set','makeup'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','OneMoney'] },
  { id:'p92', name:'Eyeshadow Palette 18 Colours', description:'Pigmented 18-colour eyeshadow palette with matte and shimmer shades. Blendable, long-lasting.', price:20, category:'Makeup & Cosmetics', image:'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=600&q=80&fit=crop'], rating:4.6, reviewCount:155, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['eyeshadow','palette','makeup','eyes'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p93', name:'Setting Spray Makeup Fix', description:'Waterproof setting spray that locks in makeup for 16 hours. Dewy or matte finish options. 100ml bottle.', price:10, category:'Makeup & Cosmetics', image:'https://images.unsplash.com/photo-1631214524020-3c69f56c187e?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1631214524020-3c69f56c187e?w=600&q=80&fit=crop'], rating:4.5, reviewCount:211, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['setting spray','makeup','waterproof','fix'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p94', name:'Contour & Highlight Kit', description:'4-in-1 contour and highlight kit with bronzer, blush, and two highlighters. Compact with mirror.', price:16, originalPrice:24, category:'Makeup & Cosmetics', image:'https://images.unsplash.com/photo-1583241475880-083f84372725?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1583241475880-083f84372725?w=600&q=80&fit=crop'], rating:4.7, reviewCount:134, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['contour','highlight','bronzer','blush'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','OneMoney'] },

  // ════════════════════════════════════════════════════════════════════
  // NAIL CARE
  // ════════════════════════════════════════════════════════════════════
  { id:'p95', name:'Gel Nail Polish Set 12 Colours', description:'UV gel nail polish set in 12 vibrant shades. Chip-resistant, lasts 3 weeks. Includes top and base coat.', price:18, originalPrice:28, category:'Nail Care', image:'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80&fit=crop'], rating:4.7, reviewCount:187, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['nail polish','gel','set','manicure'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p96', name:'Press-On Nails Coffin Shape', description:'Ready-to-wear coffin press-on nails with glue included. 24 pieces, reusable. Last up to 2 weeks.', price:8, category:'Nail Care', image:'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80&fit=crop'], rating:4.5, reviewCount:244, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['press-on','nails','coffin','gel'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p97', name:'Nail Art Stickers Pack', description:'300 pcs nail art sticker pack with flowers, gems, and abstract designs. Self-adhesive, easy to apply.', price:5, category:'Nail Care', image:'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80&fit=crop'], rating:4.3, reviewCount:156, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['nail art','stickers','decoration','DIY'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p98', name:'UV Nail Lamp 48W', description:'Professional 48W UV/LED nail lamp for curing gel polish in 30 seconds. Timer settings, auto sensor.', price:25, originalPrice:40, category:'Nail Care', image:'https://images.unsplash.com/photo-1604655982751-d3e01a285773?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1604655982751-d3e01a285773?w=600&q=80&fit=crop'], rating:4.8, reviewCount:98, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['nail lamp','UV','LED','gel cure'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },

  // ════════════════════════════════════════════════════════════════════
  // HOME DECOR
  // ════════════════════════════════════════════════════════════════════
  { id:'p99', name:'Scented Candle Set', description:'Set of 3 hand-poured soy wax candles in relaxing scents: lavender, vanilla, and sandalwood. 40hr burn time each.', price:22, category:'Home Decor', image:'https://images.unsplash.com/photo-1602607158003-dce1a1cf03aa?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1602607158003-dce1a1cf03aa?w=600&q=80&fit=crop'], rating:4.8, reviewCount:176, reviews:[], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['candles','scented','decor','home'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p100', name:'Macrame Wall Hanging', description:'Handmade boho macrame wall hanging in natural cotton cord. Adds warmth and texture to any room. 60cm wide.', price:18, category:'Home Decor', image:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop'], rating:4.7, reviewCount:63, reviews:[], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['macrame','wall art','boho','handmade'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p101', name:'Decorative Throw Pillow Set', description:'Set of 4 decorative cushion covers in coordinating patterns. Zip closure, 45x45cm. Washable.', price:20, originalPrice:32, category:'Home Decor', image:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&fit=crop'], rating:4.5, reviewCount:88, reviews:[], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['pillows','cushions','decor','home'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','OneMoney'] },
  { id:'p102', name:'Indoor Plant Pot Set', description:'Set of 3 ceramic plant pots in different sizes. Drainage hole and matching saucers included. Matte white finish.', price:24, category:'Home Decor', image:'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80&fit=crop'], rating:4.6, reviewCount:72, reviews:[], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['plant pot','ceramic','indoor','decor'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p103', name:'Photo Frame Collage Set', description:'Set of 6 photo frames (4x6") in matching wood finish. Wall-mount or standing display. Perfect gift.', price:16, originalPrice:25, category:'Home Decor', image:'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80&fit=crop'], rating:4.4, reviewCount:53, reviews:[], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['photo frame','collage','wall decor','gift'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // BEDDING & PILLOWS
  // ════════════════════════════════════════════════════════════════════
  { id:'p104', name:'Microfibre Duvet Comforter', description:'All-season microfibre duvet with anti-allergen filling. Machine washable, 220x240cm for queen/king bed.', price:45, originalPrice:65, category:'Bedding & Pillows', image:'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80&fit=crop'], rating:4.8, reviewCount:143, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['duvet','comforter','bedding','sleep'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p105', name:'Cotton Percale Bed Sheet Set', description:'400 thread count cotton bed sheet set. Includes flat, fitted, and 2 pillowcases. Crisp and cooling.', price:35, category:'Bedding & Pillows', image:'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80&fit=crop'], rating:4.7, reviewCount:98, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['bedsheet','cotton','set','bedding'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p106', name:'Memory Foam Pillow', description:'Ergonomic memory foam pillow with cooling gel layer. Hypoallergenic cover, adjustable height. Best sleep of your life.', price:28, originalPrice:42, category:'Bedding & Pillows', image:'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1568454537842-d933259bb258?w=600&q=80&fit=crop'], rating:4.9, reviewCount:211, reviews:[{id:'rp106', user:'Bernard C.', rating:5, comment:'No more neck pain! This pillow changed my life.', date:'1 week ago'}], sellerId:'s1', sellerName:'TechHaven ZW', tags:['pillow','memory foam','sleep','ergonomic'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','OneMoney'] },
  { id:'p107', name:'Throw Blanket Fleece', description:'Super soft fleece throw blanket. 150x200cm, perfect for the couch or bed. Sherpa backing option available.', price:20, category:'Bedding & Pillows', image:'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&q=80&fit=crop'], rating:4.6, reviewCount:134, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['blanket','fleece','throw','cozy'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // KITCHEN GADGETS
  // ════════════════════════════════════════════════════════════════════
  { id:'p108', name:'Air Fryer 5L Digital', description:'Large 5L digital air fryer with 8 preset cooking modes. Fry, bake, grill, and roast with 80% less oil.', price:75, originalPrice:110, category:'Kitchen Gadgets', image:'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80&fit=crop'], rating:4.8, reviewCount:267, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['air fryer','kitchen','appliance','cooking'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p109', name:'Electric Kettle 1.8L', description:'Fast-boil 1.8L electric kettle with temperature control. Stainless steel, auto shut-off, 360° base.', price:28, originalPrice:42, category:'Kitchen Gadgets', image:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&fit=crop'], rating:4.6, reviewCount:143, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['kettle','electric','kitchen','tea'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p110', name:'Non-Stick Cookware Set 6pc', description:'6-piece non-stick cookware set with ceramic coating. Fry pan, sauce pan, stock pot with matching lids.', price:55, originalPrice:80, category:'Kitchen Gadgets', image:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&fit=crop'], rating:4.7, reviewCount:89, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['cookware','non-stick','pots','kitchen'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p111', name:'Sandwich Maker & Toaster', description:'2-in-1 sandwich maker and toaster with non-stick plates. Makes 2 sandwiches at once. Indicator light.', price:18, originalPrice:28, category:'Kitchen Gadgets', image:'https://images.unsplash.com/photo-1641496291082-28c2f2bb22c1?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1641496291082-28c2f2bb22c1?w=600&q=80&fit=crop'], rating:4.4, reviewCount:112, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['sandwich maker','toaster','breakfast','kitchen'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p112', name:'Knife Set 7-Piece', description:'Professional 7-piece stainless steel knife set with wooden block. Chef, bread, utility, paring, and scissors included.', price:32, category:'Kitchen Gadgets', image:'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80&fit=crop'], rating:4.6, reviewCount:76, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['knives','knife set','kitchen','chef'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','OneMoney'] },

  // ════════════════════════════════════════════════════════════════════
  // YOGA & PILATES
  // ════════════════════════════════════════════════════════════════════
  { id:'p113', name:'Yoga Mat Non-Slip 6mm', description:'Premium 6mm thick non-slip yoga mat with alignment lines. Eco-friendly TPE material, includes carry strap.', price:22, originalPrice:35, category:'Yoga & Pilates', image:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80&fit=crop'], rating:4.8, reviewCount:198, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['yoga mat','non-slip','fitness','exercise'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p114', name:'Resistance Bands Set 5pc', description:'Set of 5 fabric resistance bands in different resistance levels. Great for home workouts, glute training, and rehab.', price:14, category:'Yoga & Pilates', image:'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80&fit=crop'], rating:4.7, reviewCount:156, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['resistance bands','yoga','pilates','workout'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p115', name:'Foam Roller Massage', description:'Deep tissue foam roller for muscle recovery. 33cm medium density. Reduces soreness after workouts.', price:16, originalPrice:24, category:'Yoga & Pilates', image:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80&fit=crop'], rating:4.5, reviewCount:87, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['foam roller','massage','recovery','fitness'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','OneMoney'] },
  { id:'p116', name:'Yoga Block & Strap Set', description:'Cork yoga block with matching cotton stretch strap. Improves flexibility and alignment in poses. Beginner-friendly.', price:12, category:'Yoga & Pilates', image:'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80&fit=crop'], rating:4.6, reviewCount:63, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['yoga block','strap','flexibility','beginner'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // PLUS SIZE FASHION
  // ════════════════════════════════════════════════════════════════════
  { id:'p117', name:'Plus Size Wrap Dress', description:'Flattering wrap dress for curves. Adjustable tie waist, flutter sleeves. Available in sizes 1X–5X. 12 prints.', price:30, originalPrice:45, category:'Plus Size Fashion', image:'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80&fit=crop'], rating:4.8, reviewCount:243, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['plus size','dress','wrap','curves'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p118', name:'Plus Size Bodycon Set', description:'Coordinated two-piece set — crop top and bodycon skirt. Stretchy material that hugs your curves. 1X–4X.', price:28, category:'Plus Size Fashion', image:'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80&fit=crop'], rating:4.7, reviewCount:178, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['plus size','two piece','set','bodycon'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','OneMoney'] },
  { id:'p119', name:'Plus Size Jeans High Rise', description:'Comfortable high-rise jeans with stretch denim. Real pockets, smooth waistband. Sizes 16–28.', price:35, originalPrice:52, category:'Plus Size Fashion', image:'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80&fit=crop'], rating:4.6, reviewCount:134, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['plus size','jeans','high rise','denim'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p120', name:'Plus Size Blazer Suit', description:'Structured double-breasted blazer in sizes 16–28. Padded shoulders, lined interior. Power dressing for all bodies.', price:48, category:'Plus Size Fashion', image:'https://images.unsplash.com/photo-1594938967046-58e806a7a80a?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1594938967046-58e806a7a80a?w=600&q=80&fit=crop'], rating:4.8, reviewCount:92, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['plus size','blazer','suit','formal'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p121', name:'Plus Size Loungewear Set', description:'Cozy wide-leg pants and matching hoodie set. Soft French terry fabric. Ideal for home and errands.', price:32, originalPrice:48, category:'Plus Size Fashion', image:'https://images.unsplash.com/photo-1539794830467-1f1755804d13?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1539794830467-1f1755804d13?w=600&q=80&fit=crop'], rating:4.7, reviewCount:167, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['plus size','loungewear','set','cozy'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // PET SUPPLIES
  // ════════════════════════════════════════════════════════════════════
  { id:'p122', name:'Dog Food Premium 5kg', description:'Premium dry dog food with real chicken and vegetables. No artificial preservatives. All breeds, all ages.', price:18, originalPrice:26, category:'Pet Supplies', image:'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&q=80&fit=crop'], rating:4.7, reviewCount:133, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['dog food','pet','premium','chicken'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p123', name:'Cat Litter Odour Control 5L', description:'Super-clumping cat litter with activated carbon for odour control. Dust-free, easy to scoop. 5L bag.', price:12, category:'Pet Supplies', image:'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=600&q=80&fit=crop'], rating:4.5, reviewCount:87, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['cat litter','pet','odour control','cat'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p124', name:'Pet Collar & Leash Set', description:'Adjustable nylon collar with matching 1.5m leash. Reflective stitching for night walks. Sizes XS–XL.', price:10, originalPrice:16, category:'Pet Supplies', image:'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&q=80&fit=crop'], rating:4.6, reviewCount:98, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['collar','leash','dog','pet'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p125', name:'Pet Grooming Brush', description:'Dual-sided grooming brush with stainless steel pins and soft bristles. Removes loose fur, reduces shedding.', price:8, category:'Pet Supplies', image:'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80&fit=crop'], rating:4.5, reviewCount:64, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['grooming','brush','pet','dog'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p126', name:'Dog Snack Treats Variety Pack', description:'12-pack assortment of dog training treats. Low calorie, grain-free, made with real meat. Ideal for training.', price:14, originalPrice:20, category:'Pet Supplies', image:'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=600&q=80&fit=crop'], rating:4.8, reviewCount:121, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['dog treats','snacks','training','pet'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // FASHION & CLOTHING (c1)
  // ════════════════════════════════════════════════════════════════════
  { id:'p127', name:'Dashiki African Print Shirt', description:'Vibrant Ankara dashiki shirt tailored in Harare. Available in 12 bold prints. Perfect for festivals and family events. Sizes XS–3XL.', price:24, originalPrice:35, category:'Fashion & Clothing', image:'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=600&q=80&fit=crop'], rating:4.7, reviewCount:112, reviews:[], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['dashiki','african','shirt','fashion'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p128', name:"Women's Flared Palazzo Pants", description:'Flowy wide-leg palazzo pants in lightweight fabric. Elastic waist, available in 8 solid colours. Sizes XS–3XL.', price:19, category:'Fashion & Clothing', image:'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&q=80&fit=crop'], rating:4.5, reviewCount:87, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['palazzo','pants','fashion','women'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p129', name:'Shona Traditional Wrap Dress', description:'Authentic Shona-inspired print wrap dress handcrafted in Chitungwiza. One-of-a-kind print, limited stock.', price:38, category:'Fashion & Clothing', image:'https://images.unsplash.com/photo-1760907949889-eb62b7fd9f75?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1760907949889-eb62b7fd9f75?w=600&q=80&fit=crop'], rating:4.9, reviewCount:64, reviews:[{id:'rp129',user:'Chipo M.',rating:5,comment:'Absolutely stunning! Got so many compliments.',date:'4 days ago'}], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['shona','traditional','dress','fashion'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p130', name:"Men's 3-Piece Formal Suit", description:'Tailored 3-piece formal suit (jacket, trousers, waistcoat). Available in charcoal, navy, and black. Sizes 36–52.', price:95, originalPrice:140, category:'Fashion & Clothing', image:'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80&fit=crop'], rating:4.8, reviewCount:143, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['suit','formal','men','fashion'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },

  // ════════════════════════════════════════════════════════════════════
  // ELECTRONICS & GADGETS (c2)
  // ════════════════════════════════════════════════════════════════════
  { id:'p131', name:'Smart Fitness Watch', description:'Multi-function fitness tracker with heart rate, sleep monitoring, and 14 sports modes. 7-day battery life. iOS & Android.', price:35, originalPrice:55, category:'Electronics & Gadgets', image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80&fit=crop'], rating:4.6, reviewCount:198, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['smartwatch','fitness','tracker','wearable'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p132', name:'LED Ring Light 12" Kit', description:'Professional 12" LED ring light with tripod stand and phone holder. 3 colour temperatures, 10 brightness levels. Great for content creators.', price:28, originalPrice:42, category:'Electronics & Gadgets', image:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80&fit=crop'], rating:4.7, reviewCount:134, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['ring light','photography','content','creator'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','OneMoney'] },
  { id:'p133', name:'Power Bank 20000mAh Fast Charge', description:'Ultra-slim 20000mAh power bank with 22.5W fast charging. Two USB-A ports + USB-C. LED battery indicator.', price:22, originalPrice:34, category:'Electronics & Gadgets', image:'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&q=80&fit=crop'], rating:4.8, reviewCount:267, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['power bank','charger','portable','gadget'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p134', name:'Wi-Fi Security Camera 1080p', description:'Outdoor/indoor IP camera with motion detection, night vision, and two-way audio. App-controlled via smartphone.', price:30, originalPrice:48, category:'Electronics & Gadgets', image:'https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?w=600&q=80&fit=crop'], rating:4.5, reviewCount:89, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['security camera','wifi','cctv','smart home'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },

  // ════════════════════════════════════════════════════════════════════
  // BEAUTY & PERSONAL CARE (c3)
  // ════════════════════════════════════════════════════════════════════
  { id:'p135', name:'Organic Aloe Vera Gel 300ml', description:'Pure organic aloe vera gel for face and body. Soothing, cooling, and moisturising. Ideal for sunburn and skin irritation.', price:8, category:'Beauty & Personal Care', image:'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80&fit=crop'], rating:4.8, reviewCount:178, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['aloe vera','organic','gel','skincare'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p136', name:"Men's Beard Grooming Kit", description:'Complete beard kit with trimmer oil, balm, wooden comb, and beard wash. Keep your beard sharp and conditioned.', price:18, originalPrice:28, category:'Beauty & Personal Care', image:'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&q=80&fit=crop'], rating:4.6, reviewCount:112, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['beard','grooming','men','kit'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','OneMoney'] },
  { id:'p137', name:'Electric Facial Cleansing Brush', description:'Waterproof 3-speed facial cleansing brush with silicone head. Removes 99% more dirt than manual washing. USB rechargeable.', price:22, originalPrice:38, category:'Beauty & Personal Care', image:'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80&fit=crop'], rating:4.5, reviewCount:93, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['cleansing brush','facial','skincare','electric'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p138', name:'Luxury Bath & Body Gift Set', description:'7-piece pamper set with body lotion, scrub, bath salts, shower gel, lip balm, face mask, and loofa. Perfect gift.', price:25, category:'Beauty & Personal Care', image:'https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=600&q=80&fit=crop'], rating:4.7, reviewCount:201, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['gift set','bath','beauty','luxury'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // HOME & FURNITURE (c4)
  // ════════════════════════════════════════════════════════════════════
  { id:'p139', name:'3-Seater Fabric Sofa', description:'Comfortable 3-seater sofa in premium fabric. Solid wood frame, removable cushion covers. Grey, beige, and navy options.', price:280, originalPrice:380, category:'Home & Furniture', image:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop'], rating:4.7, reviewCount:88, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['sofa','furniture','living room','couch'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p140', name:'Solid Wood Coffee Table', description:'Handcrafted solid wood coffee table with lower shelf storage. Natural teak finish. 120×60×45cm.', price:95, originalPrice:140, category:'Home & Furniture', image:'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80&fit=crop'], rating:4.6, reviewCount:54, reviews:[], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['coffee table','wood','furniture','living room'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p141', name:'5-Tier Bookshelf White', description:'Modern 5-tier open bookshelf in white. Sturdy MDF construction. 80×30×175cm. Easy assembly, instructions included.', price:65, originalPrice:90, category:'Home & Furniture', image:'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600&q=80&fit=crop'], rating:4.5, reviewCount:43, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['bookshelf','shelving','furniture','storage'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p142', name:'Round Decorative Wall Mirror', description:'Large 80cm round frameless wall mirror with gold metal trim. Adds light and space to any room. Mounting kit included.', price:45, originalPrice:65, category:'Home & Furniture', image:'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80&fit=crop'], rating:4.8, reviewCount:97, reviews:[], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['mirror','wall','decor','furniture'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // FOOD & GROCERIES (c5)
  // ════════════════════════════════════════════════════════════════════
  { id:'p143', name:'Roller Meal Mealie Meal 10kg', description:"Zimbabwe's favourite mealie meal for sadza. Super white, fine grind. 10kg sack from local millers.", price:12, category:'Food & Groceries', image:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80&fit=crop'], rating:4.9, reviewCount:312, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['sadza','mealie meal','groceries','staple'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p144', name:'Olivine Cooking Oil 5L', description:'Premium sunflower cooking oil, cholesterol-free. Ideal for frying, baking, and dressing. 5L container.', price:10, originalPrice:14, category:'Food & Groceries', image:'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80&fit=crop'], rating:4.8, reviewCount:267, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['cooking oil','groceries','sunflower','kitchen'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p145', name:'Natural Peanut Butter 1kg', description:'100% natural peanut butter made from Zimbabwean groundnuts. No added sugar or preservatives. Smooth or crunchy.', price:7, category:'Food & Groceries', image:'https://images.unsplash.com/photo-1614385977655-9cca1fa100f8?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1614385977655-9cca1fa100f8?w=600&q=80&fit=crop'], rating:4.9, reviewCount:189, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['peanut butter','natural','spread','groceries'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p146', name:'ZimSpice Seasoning Variety Pack', description:'6-pack spice set: Zim braai rub, paprika, curry powder, cayenne, cumin, and mixed herbs. Local sourced blends.', price:9, originalPrice:14, category:'Food & Groceries', image:'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=600&q=80&fit=crop'], rating:4.7, reviewCount:143, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['spices','seasoning','herbs','cooking'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // FARMING & AGRICULTURE (c6)
  // ════════════════════════════════════════════════════════════════════
  { id:'p147', name:'Vegetable Seed Variety Pack', description:'20 varieties of vegetable seeds — tomato, spinach, carrot, cucumber, pepper and more. Non-GMO, high germination rate.', price:6, category:'Farming & Agriculture', image:'https://images.unsplash.com/photo-1416879595882-3175b3f4f4ea?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1416879595882-3175b3f4f4ea?w=600&q=80&fit=crop'], rating:4.8, reviewCount:134, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['seeds','vegetable','farming','garden'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p148', name:'NPK Fertilizer 25kg Bag', description:'Balanced NPK 10-10-10 fertilizer for all crops. Promotes healthy growth, flowering, and root development.', price:18, originalPrice:25, category:'Farming & Agriculture', image:'https://images.unsplash.com/photo-1625246333195-25db2e9cd4d9?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1625246333195-25db2e9cd4d9?w=600&q=80&fit=crop'], rating:4.7, reviewCount:88, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['fertilizer','npk','farming','crops'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p149', name:'Drip Irrigation Kit 50m', description:'Complete drip irrigation system for home gardens and small farms. 50m pipe, drippers, connectors, and filter included.', price:32, originalPrice:48, category:'Farming & Agriculture', image:'https://images.unsplash.com/photo-1416464430624-2d8e9ea9a06b?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1416464430624-2d8e9ea9a06b?w=600&q=80&fit=crop'], rating:4.6, reviewCount:67, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['irrigation','drip','farming','water'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p150', name:'Knapsack Sprayer 15L', description:'Heavy-duty 15L manual knapsack sprayer for pesticides and herbicides. Ergonomic straps, adjustable nozzle.', price:22, originalPrice:32, category:'Farming & Agriculture', image:'https://images.unsplash.com/photo-1416879595882-3175b3f4f4ea?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1416879595882-3175b3f4f4ea?w=600&q=80&fit=crop'], rating:4.5, reviewCount:53, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['sprayer','pesticide','farming','garden'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // VEHICLES & AUTO PARTS (c7)
  // ════════════════════════════════════════════════════════════════════
  { id:'p151', name:'Universal Car Floor Mats Set', description:'4-piece premium rubber floor mats with anti-slip backing. Fits most cars and SUVs. Easy to clean. Black.', price:18, originalPrice:28, category:'Vehicles & Auto Parts', image:'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=600&q=80&fit=crop'], rating:4.6, reviewCount:143, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['car mats','floor mats','auto','vehicle'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p152', name:'Jump Starter Power Pack 1000A', description:'Portable 1000A peak jump starter for 12V cars, trucks, and motorcycles. Also charges phones via USB. LED torch included.', price:48, originalPrice:70, category:'Vehicles & Auto Parts', image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&fit=crop'], rating:4.8, reviewCount:98, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['jump starter','car battery','power','vehicle'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p153', name:'Dash Camera Full HD 1080p', description:'Dual dash cam (front and rear) with 170° wide angle, night vision, G-sensor, and loop recording. 64GB card included.', price:35, originalPrice:55, category:'Vehicles & Auto Parts', image:'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&q=80&fit=crop'], rating:4.7, reviewCount:76, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['dashcam','camera','car','safety'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p154', name:'Tyre Inflator Portable 12V', description:'Compact 12V electric tyre inflator. Plugs into car cigarette lighter. Auto shut-off at preset pressure. Digital display.', price:20, originalPrice:32, category:'Vehicles & Auto Parts', image:'https://images.unsplash.com/photo-1609592806596-b10b2c733c0b?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1609592806596-b10b2c733c0b?w=600&q=80&fit=crop'], rating:4.5, reviewCount:112, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['tyre inflator','pump','car','vehicle'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // PHONES & COMPUTERS (c8)
  // ════════════════════════════════════════════════════════════════════
  { id:'p155', name:'Samsung Galaxy A15 5G', description:'Brand new Samsung Galaxy A15 5G. 6.5" display, 50MP camera, 5000mAh battery. 128GB storage. Dual SIM.', price:180, originalPrice:220, category:'Phones & Computers', image:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80&fit=crop'], rating:4.7, reviewCount:198, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['samsung','phone','android','5g'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p156', name:'Wireless Keyboard & Mouse Combo', description:'2.4GHz wireless keyboard and mouse combo. Quiet keys, ergonomic design. 12-month battery life. Compatible with Windows/Mac.', price:25, originalPrice:38, category:'Phones & Computers', image:'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80&fit=crop'], rating:4.5, reviewCount:167, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['keyboard','mouse','wireless','computer'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p157', name:'7-Port USB Hub 3.0', description:'Slim 7-port USB 3.0 hub with individual power switches. Adds ports to your laptop or PC. Data transfer up to 5Gbps.', price:12, category:'Phones & Computers', image:'https://images.unsplash.com/photo-1625803987083-f4de2af86b00?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1625803987083-f4de2af86b00?w=600&q=80&fit=crop'], rating:4.4, reviewCount:89, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['usb hub','computer','accessories','ports'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p158', name:'RGB Gaming Headset 7.1', description:'Surround sound gaming headset with RGB lighting, noise-cancelling mic, and memory foam ear cups. Compatible with PC/PS/Xbox.', price:28, originalPrice:45, category:'Phones & Computers', image:'https://images.unsplash.com/photo-1612444530582-fc66183b16f7?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1612444530582-fc66183b16f7?w=600&q=80&fit=crop'], rating:4.6, reviewCount:134, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['gaming headset','rgb','gaming','headphones'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // SERVICES (c9)
  // ════════════════════════════════════════════════════════════════════
  { id:'p159', name:'Professional Website Design Package', description:'Custom 5-page responsive website. Includes domain, hosting setup, SEO basics. Delivered in 7 days. WhatsApp support.', price:120, category:'Services', image:'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80&fit=crop'], rating:4.9, reviewCount:56, reviews:[{id:'rp159',user:'Tanaka M.',rating:5,comment:'Built my business website in 5 days. Looks amazing!',date:'2 weeks ago'}], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['website','design','service','digital'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Digital Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p160', name:'Professional Photography Session', description:'2-hour studio or outdoor photo session. 50+ edited photos in high resolution. Events, portraits, products.', price:45, originalPrice:65, category:'Services', image:'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80&fit=crop'], rating:4.8, reviewCount:88, reviews:[], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['photography','service','portrait','event'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Book Appointment', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p161', name:'Deep Home Cleaning Service', description:'Full-day professional home clean. Includes kitchen, bathrooms, living areas, and windows. Harare only.', price:35, category:'Services', image:'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80&fit=crop'], rating:4.7, reviewCount:112, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['cleaning','service','home','domestic'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Book Appointment', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p162', name:'Laptop & Phone Repair Service', description:'Screen replacement, software fixes, motherboard repairs. 24-hour turnaround. Pick-up and drop-off in Harare CBD.', price:15, category:'Services', image:'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80&fit=crop'], rating:4.6, reviewCount:143, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['repair','laptop','phone','service'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Same-Day Service', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // PROPERTY & RENTALS (c10)
  // ════════════════════════════════════════════════════════════════════
  { id:'p163', name:'Furnished Studio – Avondale Harare', description:'Self-contained furnished studio flat. En-suite, WiFi, DSTV, security. $250/month. Available now.', price:250, category:'Property & Rentals', image:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80&fit=crop'], rating:4.6, reviewCount:34, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['studio','rental','furnished','harare'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Viewing Available', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p164', name:'3-Bed House – Borrowdale Harare', description:'Spacious 3-bedroom house with garden, pool, and double garage. Quiet suburb, borehole water. $850/month.', price:850, category:'Property & Rentals', image:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80&fit=crop'], rating:4.9, reviewCount:18, reviews:[{id:'rp164',user:'Simba K.',rating:5,comment:'Excellent value in a safe suburb. Highly recommend.',date:'3 weeks ago'}], sellerId:'s1', sellerName:'TechHaven ZW', tags:['house','rental','borrowdale','3 bedroom'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Viewing Available', paymentMethods:['Bank Transfer'] },
  { id:'p165', name:'Office Space – Harare CBD Monthly', description:'Ready-to-use office space in Harare CBD. 40m², air-conditioned, ADSL internet, shared boardroom. $350/month.', price:350, originalPrice:450, category:'Property & Rentals', image:'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=80&fit=crop'], rating:4.5, reviewCount:22, reviews:[], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['office','commercial','cbd','monthly'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Viewing Available', paymentMethods:['Bank Transfer','EcoCash'] },
  { id:'p166', name:'Holiday Cottage – Nyanga Weekend', description:'2-bed self-catering cottage in beautiful Nyanga. Mountain views, fireplace, braai area. $120/weekend.', price:120, category:'Property & Rentals', image:'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80&fit=crop'], rating:4.8, reviewCount:47, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['cottage','holiday','nyanga','weekend'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Book Ahead', paymentMethods:['EcoCash','Bank Transfer'] },

  // ════════════════════════════════════════════════════════════════════
  // HANDMADE & CRAFTS (c11)
  // ════════════════════════════════════════════════════════════════════
  { id:'p167', name:'Shona Stone Sculpture', description:'Hand-carved Shona stone sculpture by certified Zimbabwean artist. Certificate of authenticity included. H30cm.', price:65, category:'Handmade & Crafts', image:'https://images.unsplash.com/photo-1566233397879-6f8613d0a7d4?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1566233397879-6f8613d0a7d4?w=600&q=80&fit=crop'], rating:4.9, reviewCount:28, reviews:[{id:'rp167',user:'Sarah L.',rating:5,comment:"The artist's skill is incredible.",date:'1 month ago'}], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['sculpture','shona','stone','art'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p168', name:'Beaded Wall Art Panel', description:'Intricate beaded wall art in vibrant African patterns. 60×40cm, ready to hang. Each piece is unique.', price:42, category:'Handmade & Crafts', image:'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80&fit=crop'], rating:4.8, reviewCount:36, reviews:[], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['beaded','wall art','handmade','african'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p169', name:'Handwoven Raffia Table Runner', description:'Traditional handwoven raffia table runner. Earthy tones and geometric patterns. 180×35cm. Adds warmth to any table.', price:18, originalPrice:26, category:'Handmade & Crafts', image:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80&fit=crop'], rating:4.7, reviewCount:54, reviews:[], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['table runner','raffia','handwoven','decor'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p170', name:'Ceramic Pottery Set 3-Piece', description:'Handmade set of 3 ceramic bowls in earthy glazed finish. Each bowl slightly different — artisan made. Oven safe.', price:30, category:'Handmade & Crafts', image:'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80&fit=crop'], rating:4.6, reviewCount:41, reviews:[], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['pottery','ceramic','bowls','handmade'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // THRIFT / SECOND HAND (c12)
  // ════════════════════════════════════════════════════════════════════
  { id:'p171', name:'Grade-A Mixed Clothing Bale 10kg', description:'Assorted Grade-A thrift clothing mix. Fresh UK/US bale, 10kg. Lots of gems inside — jeans, tops, jackets and more.', price:35, originalPrice:55, category:'Thrift / Second Hand', image:'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&q=80&fit=crop'], rating:4.7, reviewCount:234, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['thrift','bale','second hand','clothing'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p172', name:"Vintage Levi's 501 Jeans", description:"Authentic vintage Levi's 501 straight jeans. Light blue wash, size 32×32. Grade-A condition, barely worn.", price:28, originalPrice:45, category:'Thrift / Second Hand', image:'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80&fit=crop'], rating:4.9, reviewCount:87, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['levis','vintage','jeans','second hand'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p173', name:'Thrift Designer Handbag', description:'Pre-loved designer-style handbag in excellent condition. Authentic look with quality stitching. Grade-A thrift find.', price:22, category:'Thrift / Second Hand', image:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop'], rating:4.6, reviewCount:65, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['handbag','thrift','second hand','fashion'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p174', name:'Thrift Shoe Bundle (Size 38–42)', description:'Mixed thrift shoe bundle — trainers, heels, and flats in sizes 38–42. All Grade-A condition, 5 pairs per bundle.', price:30, originalPrice:50, category:'Thrift / Second Hand', image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&fit=crop'], rating:4.5, reviewCount:78, reviews:[], sellerId:'s2', sellerName:'ThriftKing Harare', tags:['shoes','thrift','second hand','bundle'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // BABY PRODUCTS (c13)
  // ════════════════════════════════════════════════════════════════════
  { id:'p175', name:'Foldable Baby Stroller Pram', description:'Lightweight foldable baby stroller for 0–3 years. One-hand fold, adjustable canopy, shopping basket underneath. Safety harness.', price:85, originalPrice:120, category:'Baby Products', image:'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80&fit=crop'], rating:4.8, reviewCount:98, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['stroller','pram','baby','pushchair'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p176', name:'Baby Video Monitor with Night Vision', description:'5" LCD screen baby monitor with 2-way audio, lullabies, temperature sensor, and night vision camera. Range: 300m.', price:55, originalPrice:80, category:'Baby Products', image:'https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=600&q=80&fit=crop'], rating:4.7, reviewCount:67, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['baby monitor','video','night vision','safety'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p177', name:'Baby Nursing Pillow & Cover', description:'C-shaped nursing pillow with removable, washable cover. Supports mum during breastfeeding. Also great for tummy time.', price:20, originalPrice:30, category:'Baby Products', image:'https://images.unsplash.com/photo-1622290291165-d341f1938b8a?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1622290291165-d341f1938b8a?w=600&q=80&fit=crop'], rating:4.9, reviewCount:143, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['nursing pillow','breastfeeding','baby','support'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p178', name:'Baby Bath Tub & Accessories Set', description:'Ergonomic baby bath tub for 0–24 months. Includes bath sponge, non-slip mat, thermometer, and hooded towel.', price:18, category:'Baby Products', image:'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80&fit=crop'], rating:4.6, reviewCount:88, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['baby bath','tub','accessories','newborn'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // SPORTS & FITNESS (c14)
  // ════════════════════════════════════════════════════════════════════
  { id:'p179', name:'FIFA Football & Pump Set', description:'Size 5 FIFA-approved football with manual pump and needle. Durable TPU material, all-weather play.', price:22, originalPrice:32, category:'Sports & Fitness', image:'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=600&q=80&fit=crop'], rating:4.7, reviewCount:178, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['football','soccer','ball','sports'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p180', name:'Speed Jump Rope Adjustable', description:'Premium speed jump rope with ball-bearing handles. Adjustable length, tangle-free. Great for HIIT and boxing training.', price:8, category:'Sports & Fitness', image:'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80&fit=crop'], rating:4.5, reviewCount:134, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['jump rope','skipping','fitness','cardio'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p181', name:'Doorframe Pull-Up Bar', description:'No-drill doorframe pull-up bar. Supports up to 120kg. Multiple grip positions for pull-ups, chin-ups, and hanging exercises.', price:18, originalPrice:28, category:'Sports & Fitness', image:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80&fit=crop'], rating:4.6, reviewCount:89, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['pull up bar','gym','home workout','fitness'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p182', name:'Sports Water Bottle 1L BPA-Free', description:'1L BPA-free sports water bottle with leak-proof flip lid. Insulated for 12 hours. Wide mouth for easy filling.', price:9, category:'Sports & Fitness', image:'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80&fit=crop'], rating:4.4, reviewCount:112, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['water bottle','sports','fitness','bpa free'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Free Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // BOOKS & EDUCATION (c15)
  // ════════════════════════════════════════════════════════════════════
  { id:'p183', name:'Cambridge O-Level Science Set', description:'Complete Cambridge O-Level Science textbook set (Biology, Chemistry, Physics). Latest syllabus edition. Perfect for Form 3&4.', price:35, originalPrice:50, category:'Books & Education', image:'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80&fit=crop'], rating:4.8, reviewCount:134, reviews:[], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['textbooks','cambridge','science','olevel'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p184', name:'Online Coding Course Voucher', description:'12-month access to premium online coding course platform. HTML, CSS, JavaScript, Python and more. Certificate on completion.', price:25, originalPrice:60, category:'Books & Education', image:'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80&fit=crop'], rating:4.9, reviewCount:78, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['coding','course','online','education'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Digital Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p185', name:'Zim Business & Entrepreneurship Guide', description:'Practical guide to starting and growing a business in Zimbabwe. Covers registration, funding, mobile money, and digital marketing.', price:12, category:'Books & Education', image:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&fit=crop'], rating:4.7, reviewCount:56, reviews:[], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['business','book','entrepreneurship','guide'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p186', name:'ZIMSEC Past Papers Bundle 2020–2024', description:'Complete ZIMSEC O-Level and A-Level past papers (2020–2024) for all subjects. PDF format delivered via WhatsApp/email.', price:8, category:'Books & Education', image:'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80&fit=crop'], rating:4.8, reviewCount:198, reviews:[], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['zimsec','past papers','exam','education'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Digital Delivery', paymentMethods:['EcoCash','OneMoney','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // CONSTRUCTION MATERIALS (c16)
  // ════════════════════════════════════════════════════════════════════
  { id:'p187', name:'Portland Cement 50kg Bag', description:'Standard Portland cement for all construction and plastering work. Consistent quality, fast-setting formula. Per bag.', price:14, category:'Construction Materials', image:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80&fit=crop'], rating:4.7, reviewCount:112, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['cement','portland','construction','building'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p188', name:'Steel Rebar Bundle 10mm (20pc)', description:'High tensile 10mm steel reinforcing bars, 6m length. Bundle of 20 rods. Grade 460 for reinforced concrete work.', price:55, originalPrice:75, category:'Construction Materials', image:'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&q=80&fit=crop'], rating:4.8, reviewCount:67, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['rebar','steel','construction','concrete'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p189', name:'Exterior Wall Paint 20L', description:'Premium weather-resistant exterior paint. Covers 200m² per 20L. Water-based, quick-dry. 12 colour options.', price:38, originalPrice:55, category:'Construction Materials', image:'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80&fit=crop'], rating:4.6, reviewCount:88, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['paint','exterior','wall','construction'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p190', name:'Roofing Iron Sheets 6m', description:'Coloured IBR profile roofing sheets. 6m×0.47mm gauge, zincalume coated. Red, green, and grey. Priced per sheet.', price:28, category:'Construction Materials', image:'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=600&q=80&fit=crop'], rating:4.7, reviewCount:54, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['roofing','iron sheets','construction','building'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },

  // ════════════════════════════════════════════════════════════════════
  // FRESH PRODUCE (c39) — Supermarket
  // ════════════════════════════════════════════════════════════════════
  { id:'p191', name:'Fresh Tomatoes 2kg Box', description:'Vine-ripened fresh tomatoes from local Zim farms. Bright red, firm and flavourful. Perfect for cooking and salads.', price:3, category:'Fresh Produce', image:'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&q=80&fit=crop'], rating:4.8, reviewCount:267, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['tomatoes','fresh','vegetables','produce'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p192', name:'Baby Spinach & Salad Leaves 500g', description:'Mixed fresh salad leaves — baby spinach, rocket, and lettuce. Farm-fresh, washed and ready to eat. 500g bag.', price:4, category:'Fresh Produce', image:'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80&fit=crop'], rating:4.7, reviewCount:134, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['salad','spinach','leaves','fresh'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p193', name:'Hass Avocados 6-Pack', description:'Ripe and ready Hass avocados from Chipinge. Creamy and buttery. Perfect for guacamole, toast, and salads.', price:5, category:'Fresh Produce', image:'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=80&fit=crop'], rating:4.9, reviewCount:198, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['avocado','fresh','produce','fruit'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p194', name:'Sweet Corn 6-Pack', description:'Fresh sweet corn cobs from Mazowe. Juicy and sweet, great for braais and boiling. Pack of 6 cobs.', price:3, category:'Fresh Produce', image:'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&q=80&fit=crop'], rating:4.7, reviewCount:156, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['corn','maize','fresh','braai'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // DAIRY & EGGS (c40) — Supermarket
  // ════════════════════════════════════════════════════════════════════
  { id:'p195', name:'Full Cream Milk 2L Fresh', description:'Farm-fresh full cream milk pasteurised and chilled. Sourced from local Zim dairy farms. 2L carton.', price:3, category:'Dairy & Eggs', image:'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80&fit=crop'], rating:4.8, reviewCount:312, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['milk','dairy','fresh','full cream'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p196', name:'Free-Range Eggs 30-Pack', description:'Large free-range eggs from local Zim farms. No antibiotics or hormones. Rich orange yolks. Pack of 30.', price:7, originalPrice:10, category:'Dairy & Eggs', image:'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&q=80&fit=crop'], rating:4.9, reviewCount:278, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['eggs','free range','dairy','farm'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p197', name:'Natural Low-Fat Yoghurt 1kg', description:'Creamy natural low-fat yoghurt with live cultures. No artificial flavours. Great with fruit or granola.', price:4, category:'Dairy & Eggs', image:'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80&fit=crop'], rating:4.7, reviewCount:143, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['yoghurt','dairy','natural','healthy'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p198', name:'Cheddar Cheese Block 500g', description:'Mature cheddar cheese block, locally produced. Sharp and nutty flavour. Perfect for cooking, toasting, or snacking.', price:6, category:'Dairy & Eggs', image:'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&q=80&fit=crop'], rating:4.8, reviewCount:112, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['cheese','cheddar','dairy','cooking'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // MEAT & POULTRY (c41) — Supermarket
  // ════════════════════════════════════════════════════════════════════
  { id:'p199', name:'Fresh Chicken Thighs 2kg', description:'Fresh bone-in chicken thighs from local Zim farms. Antibiotic-free. Perfect for grilling, braai, or pot cooking.', price:8, category:'Meat & Poultry', image:'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&q=80&fit=crop'], rating:4.8, reviewCount:234, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['chicken','meat','fresh','poultry'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p200', name:'Premium Beef Mince 1kg', description:'Lean premium beef mince, freshly ground daily. 85% lean. Great for bolognese, burgers, and meatballs.', price:10, originalPrice:14, category:'Meat & Poultry', image:'https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80&fit=crop'], rating:4.7, reviewCount:167, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['beef','mince','meat','fresh'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p201', name:'Braai Boerewors Sausage 500g', description:'Traditional Zimbabwean-style braai boerewors. Coarse pork and beef blend with spices. 500g coil. Perfect for the braai.', price:7, category:'Meat & Poultry', image:'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1561651823-34feb02250e4?w=600&q=80&fit=crop'], rating:4.9, reviewCount:298, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['sausage','braai','pork','meat'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p202', name:'Whole Fresh Chicken ~1.5kg', description:'Whole fresh Zimbabwean chicken, ready to roast or braai. No added water or preservatives. ~1.5kg each.', price:9, category:'Meat & Poultry', image:'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&q=80&fit=crop'], rating:4.7, reviewCount:189, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['whole chicken','meat','fresh','roast'], isNew:true, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // BEVERAGES & DRINKS (c42) — Supermarket
  // ════════════════════════════════════════════════════════════════════
  { id:'p203', name:'Mazoe Orange Crush 2L', description:"Zimbabwe's iconic Mazoe Orange Crush cordial. 2L bottle, makes 10L of drink. The taste of home.", price:4, category:'Beverages & Drinks', image:'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80&fit=crop'], rating:4.9, reviewCount:412, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['mazoe','cordial','orange','drinks'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p204', name:'Ceres Fruit Juice 6-Pack 1L', description:'Ceres 100% fruit juice variety 6-pack — orange, apple, mango, guava, grape, and cranberry. 1L each, no added sugar.', price:12, originalPrice:18, category:'Beverages & Drinks', image:'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80&fit=crop'], rating:4.8, reviewCount:234, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['juice','ceres','drinks','fruit'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p205', name:'Mineral Water 12 × 500ml', description:'Pure still mineral water from Zimbabwean springs. 12-pack of 500ml bottles. No sugar, no calories. Stay hydrated.', price:6, category:'Beverages & Drinks', image:'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80&fit=crop'], rating:4.7, reviewCount:178, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['water','mineral','hydration','drinks'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p206', name:'Rooibos & Zim Herbal Tea Box', description:'Gift box of 5 herbal teas — Zim rooibos, hibiscus, lemon & ginger, bush tea, and green tea. 60 bags total.', price:8, originalPrice:12, category:'Beverages & Drinks', image:'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80&fit=crop'], rating:4.8, reviewCount:98, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['tea','rooibos','herbal','drinks'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // HOUSEHOLD CLEANING (c43) — Supermarket
  // ════════════════════════════════════════════════════════════════════
  { id:'p207', name:'All-Purpose Cleaner 5L Refill', description:'Concentrated all-purpose surface cleaner. Kills 99.9% of bacteria. Safe for kitchen, bathroom, and floors. 5L refill.', price:6, originalPrice:9, category:'Household Cleaning', image:'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&q=80&fit=crop'], rating:4.7, reviewCount:198, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['cleaner','surface','household','cleaning'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p208', name:'Washing Powder Bio 3kg', description:'Biological washing powder with built-in fabric softener. Removes tough stains in cold or hot water. 3kg box.', price:5, category:'Household Cleaning', image:'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80&fit=crop'], rating:4.8, reviewCount:267, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['washing powder','laundry','cleaning','household'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p209', name:'Dishwashing Liquid 1L × 3-Pack', description:'3-pack value deal on original dishwashing liquid. Cuts through grease effortlessly. Gentle on hands.', price:5, originalPrice:8, category:'Household Cleaning', image:'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80&fit=crop'], rating:4.6, reviewCount:134, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['dishwashing','liquid','cleaning','kitchen'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p210', name:'Bleach & Disinfectant 2L', description:'Powerful bleach and disinfectant formula. Kills germs and bacteria, whitens and brightens. 2L bottle. Multi-use.', price:3, category:'Household Cleaning', image:'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80&fit=crop'], rating:4.7, reviewCount:156, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['bleach','disinfectant','cleaning','household'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // BREAD & BAKERY (c44) — Supermarket
  // ════════════════════════════════════════════════════════════════════
  { id:'p211', name:'White Sliced Bread 700g', description:'Soft, fresh sliced white bread. Baked daily by local Harare bakery. Perfect for sandwiches and toast.', price:2, category:'Bread & Bakery', image:'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&fit=crop'], rating:4.8, reviewCount:342, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['bread','white','sliced','bakery'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p212', name:'Whole-Wheat Brown Bread 600g', description:'Nutritious whole-wheat brown bread with seeds. High fibre, lower GI. Baked fresh daily. 600g loaf.', price:2, category:'Bread & Bakery', image:'https://images.unsplash.com/photo-1586444248879-bc604a0ac29a?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1586444248879-bc604a0ac29a?w=600&q=80&fit=crop'], rating:4.7, reviewCount:198, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['bread','brown','wholewheat','healthy'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p213', name:'Sweet Buns 12-Pack', description:'Soft and fluffy sweet buns with sugar glaze. Freshly baked, popular Zim street snack. 12-pack.', price:3, category:'Bread & Bakery', image:'https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=600&q=80&fit=crop'], rating:4.9, reviewCount:267, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['buns','sweet','bakery','snack'], isNew:false, isDeal:false, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p214', name:'Crackers & Cheese Biscuit Box', description:'Mixed box of cream crackers and cheese biscuits. Great with cheese, butter, or as a snack. 400g assortment.', price:3, originalPrice:5, category:'Bread & Bakery', image:'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80&fit=crop'], rating:4.6, reviewCount:134, reviews:[], sellerId:'s5', sellerName:"Mbuya's Kitchen", tags:['crackers','biscuits','snack','bakery'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // SMART TVs & DISPLAYS (c45) — Tech Store
  // ════════════════════════════════════════════════════════════════════
  { id:'p215', name:'43" 4K UHD Smart Android TV', description:'43-inch 4K UHD Smart TV with built-in Android TV, Google Assistant, Netflix, and YouTube. 3 HDMI ports. Wall mount included.', price:320, originalPrice:420, category:'Smart TVs & Displays', image:'https://images.unsplash.com/photo-1593359677879-a4bb92f4834d?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1593359677879-a4bb92f4834d?w=600&q=80&fit=crop'], rating:4.7, reviewCount:143, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['tv','smart tv','4k','android'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p216', name:'55" QLED Smart TV 4K', description:'55-inch QLED smart TV with quantum dot technology. Stunning colour and contrast. HDR10+, Dolby Atmos, 120Hz refresh.', price:580, originalPrice:750, category:'Smart TVs & Displays', image:'https://images.unsplash.com/photo-1547606373-7097fb4b75d6?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1547606373-7097fb4b75d6?w=600&q=80&fit=crop'], rating:4.9, reviewCount:98, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['tv','qled','55 inch','smart tv'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p217', name:'Mini Portable WiFi Projector', description:'Compact WiFi projector. 200" max screen size, 4K support input, built-in speaker. Great for movie nights and presentations.', price:75, originalPrice:110, category:'Smart TVs & Displays', image:'https://images.unsplash.com/photo-1574169208507-84376144848b?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1574169208507-84376144848b?w=600&q=80&fit=crop'], rating:4.6, reviewCount:87, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['projector','portable','wifi','home cinema'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p218', name:'24" IPS Computer Monitor', description:'24" Full HD IPS monitor with slim bezels. 75Hz refresh rate, AMD FreeSync, HDMI & VGA. Pivot and tilt stand.', price:120, originalPrice:160, category:'Smart TVs & Displays', image:'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80&fit=crop'], rating:4.7, reviewCount:134, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['monitor','ips','computer','display'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Bank Transfer'] },

  // ════════════════════════════════════════════════════════════════════
  // GAMING & CONSOLES (c46) — Tech Store
  // ════════════════════════════════════════════════════════════════════
  { id:'p219', name:'Xbox Wireless Controller Carbon Black', description:'Genuine Xbox Wireless Controller in Carbon Black. Textured grip, Bluetooth, mappable buttons. Works with Xbox Series and PC.', price:65, originalPrice:90, category:'Gaming & Consoles', image:'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600&q=80&fit=crop'], rating:4.8, reviewCount:167, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['xbox','controller','gaming','wireless'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p220', name:'Gaming Chair RGB LED Lumbar', description:'Ergonomic gaming chair with RGB LED, lumbar pillow, headrest cushion, and reclining backrest. Supports up to 120kg.', price:95, originalPrice:140, category:'Gaming & Consoles', image:'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&q=80&fit=crop'], rating:4.7, reviewCount:112, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['gaming chair','rgb','ergonomic','comfortable'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p221', name:'Nintendo Switch OLED Console', description:'Nintendo Switch OLED model with 7" OLED screen, enhanced audio, and 64GB storage. Includes dock and Joy-Con controllers.', price:350, originalPrice:420, category:'Gaming & Consoles', image:'https://images.unsplash.com/photo-1617096200347-cb04ae810b1d?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1617096200347-cb04ae810b1d?w=600&q=80&fit=crop'], rating:4.9, reviewCount:198, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['nintendo','switch','console','gaming'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p222', name:'Wi-Fi 6 Gaming Router', description:'Dual-band Wi-Fi 6 router with gaming QoS. Speeds up to 3Gbps, OFDMA, and MU-MIMO. Perfect for online gaming.', price:75, originalPrice:110, category:'Gaming & Consoles', image:'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80&fit=crop'], rating:4.6, reviewCount:78, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['router','wifi 6','gaming','network'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Bank Transfer'] },

  // ════════════════════════════════════════════════════════════════════
  // CAMERAS & PHOTOGRAPHY (c47) — Tech Store
  // ════════════════════════════════════════════════════════════════════
  { id:'p223', name:'DSLR Camera Beginner Kit 24MP', description:'24MP DSLR camera with 18-55mm kit lens. Full HD video, Wi-Fi, NFC. Includes bag, memory card, and extra battery.', price:280, originalPrice:380, category:'Cameras & Photography', image:'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80&fit=crop'], rating:4.8, reviewCount:134, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['camera','dslr','photography','beginner'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p224', name:'Action Camera 4K Waterproof', description:'4K action camera with 170° wide angle, EIS stabilisation, waterproof to 30m. Includes 2 batteries, mounts, and case.', price:65, originalPrice:95, category:'Cameras & Photography', image:'https://images.unsplash.com/photo-1551154838-1b9afba9fe93?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1551154838-1b9afba9fe93?w=600&q=80&fit=crop'], rating:4.7, reviewCount:98, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['action camera','4k','waterproof','sports'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p225', name:'18" Ring Light with Tripod Stand', description:'Professional 18" ring light with adjustable 2m tripod. 3 colour modes, 10 brightness levels. Remote and phone holder included.', price:35, originalPrice:55, category:'Cameras & Photography', image:'https://images.unsplash.com/photo-1616763355603-9755a912a89f?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1616763355603-9755a912a89f?w=600&q=80&fit=crop'], rating:4.8, reviewCount:178, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['ring light','tripod','photography','content creator'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p226', name:'Padded Camera Shoulder Bag', description:'Padded camera bag with adjustable dividers. Fits DSLR + 3 lenses. Rain cover, tripod side pocket. Black or brown.', price:22, originalPrice:35, category:'Cameras & Photography', image:'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&q=80&fit=crop'], rating:4.6, reviewCount:89, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['camera bag','shoulder bag','photography','accessories'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Same-Day Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // LIVING ROOM FURNITURE (c48) — Furniture Store
  // ════════════════════════════════════════════════════════════════════
  { id:'p227', name:'L-Shaped Sectional Sofa 5-Seater', description:'Large L-shaped sectional sofa in soft grey fabric. 5-seater, removable chaise. Solid hardwood legs. Assembled delivery in Harare.', price:450, originalPrice:620, category:'Living Room Furniture', image:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop'], rating:4.8, reviewCount:76, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['sofa','sectional','l-shaped','living room'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p228', name:'Entertainment TV Stand 180cm', description:'Sleek 180cm TV stand with 4 shelves and cable management. Glass door compartments. Holds TVs up to 80".', price:85, originalPrice:120, category:'Living Room Furniture', image:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop'], rating:4.6, reviewCount:54, reviews:[], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['tv stand','entertainment unit','furniture','storage'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },
  { id:'p229', name:'Faux Leather Recliner Armchair', description:'Premium faux leather recliner with push-back mechanism and padded armrests. Footrest extends. Black or brown.', price:175, originalPrice:240, category:'Living Room Furniture', image:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&fit=crop'], rating:4.7, reviewCount:88, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['recliner','armchair','leather','furniture'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p230', name:'Nest of Coffee Tables Set of 3', description:'Set of 3 nesting coffee tables in Scandinavian oak finish. Interlock for space-saving storage. W55/45/35cm.', price:65, originalPrice:95, category:'Living Room Furniture', image:'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80&fit=crop'], rating:4.5, reviewCount:43, reviews:[], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['coffee table','nest','set','living room'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // BEDROOM FURNITURE (c49) — Furniture Store
  // ════════════════════════════════════════════════════════════════════
  { id:'p231', name:'Queen Bed Frame with Storage Drawers', description:'Queen-size upholstered bed frame with 4 under-bed storage drawers. Grey or cream fabric. Slatted base. 153×203cm.', price:220, originalPrice:300, category:'Bedroom Furniture', image:'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80&fit=crop'], rating:4.8, reviewCount:112, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['bed frame','queen','storage','bedroom'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p232', name:'3-Door Mirrored Sliding Wardrobe', description:'3-door sliding wardrobe with full-length mirrors. 180×52×200cm. Hanging rail, 4 shelves, shoe rack inside. White finish.', price:280, originalPrice:380, category:'Bedroom Furniture', image:'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80&fit=crop'], rating:4.7, reviewCount:89, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['wardrobe','mirror','sliding','bedroom'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p233', name:'Dressing Table with Hollywood Mirror', description:'Hollywood-style dressing table with lighted mirror (12 bulbs). Stool included, 6 drawers, velvet interior. White or gold frame.', price:145, originalPrice:200, category:'Bedroom Furniture', image:'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=600&q=80&fit=crop'], rating:4.9, reviewCount:134, reviews:[], sellerId:'s3', sellerName:'Naturals ZW', tags:['dressing table','mirror','vanity','bedroom'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p234', name:'Bedside Table & Lamp Set of 2', description:'Set of 2 matching bedside tables with drawer and open shelf + 2 touch-dimmer bedside lamps. White or oak finish.', price:75, originalPrice:110, category:'Bedroom Furniture', image:'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&q=80&fit=crop'], rating:4.6, reviewCount:67, reviews:[], sellerId:'s6', sellerName:'ZimCrafts Studio', tags:['bedside table','lamp','set','bedroom'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Cash on Delivery'] },

  // ════════════════════════════════════════════════════════════════════
  // OFFICE FURNITURE (c50) — Furniture Store
  // ════════════════════════════════════════════════════════════════════
  { id:'p235', name:'Ergonomic Mesh Office Chair', description:'High-back ergonomic mesh office chair with lumbar support, adjustable armrests, and breathable mesh back. 360° swivel. Max 120kg.', price:85, originalPrice:130, category:'Office Furniture', image:'https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=600&q=80&fit=crop'], rating:4.8, reviewCount:198, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['office chair','ergonomic','mesh','work from home'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p236', name:'L-Shaped Computer Desk', description:'L-shaped corner desk with monitor shelf, cup holder, and headphone hook. 140×120cm. Easy assembly. Black wood-effect.', price:95, originalPrice:140, category:'Office Furniture', image:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80&fit=crop'], rating:4.7, reviewCount:134, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['computer desk','l-shape','office','gaming desk'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p237', name:'Filing Cabinet 3-Drawer Lockable', description:'Sturdy metal 3-drawer filing cabinet with lock and key. A4 hanging files. Anti-tilt mechanism. Grey.', price:55, originalPrice:80, category:'Office Furniture', image:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80&fit=crop'], rating:4.6, reviewCount:67, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['filing cabinet','office','storage','lockable'], isNew:false, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
  { id:'p238', name:'Standing Desk Converter', description:'Sit-stand desk converter. Raises in 3 seconds. 80×40cm surface fits dual monitors. Keyboard tray included. Supports 20kg.', price:75, originalPrice:110, category:'Office Furniture', image:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80&fit=crop', images:['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80&fit=crop'], rating:4.8, reviewCount:89, reviews:[], sellerId:'s1', sellerName:'TechHaven ZW', tags:['standing desk','converter','ergonomic','office'], isNew:true, isDeal:true, inStock:true, deliveryBadge:'Home Delivery', paymentMethods:['EcoCash','Bank Transfer'] },
];

// Backwards compat
export const mockProducts = products;

// ─── Orders ─────────────────────────────────────────────────────────

export const mockOrders: Order[] = [
  {
    id: 'ORD-1234',
    status: 'delivered',
    escrowStatus: 'released',
    trackingNumber: 'DHL123456789',
    deliveryPartner: 'DHL',
    productImage: products[1].image,
    productName: 'Vintage Denim Jacket',
    sellerName: 'ThriftKing Harare',
    quantity: 1,
    date: '10 Feb 2026',
    deliveryMethod: 'Same-Day Delivery',
    price: 25,
  },
  {
    id: 'ORD-1235',
    status: 'pending',
    escrowStatus: 'awaiting_payment',
    productImage: products[0].image,
    productName: 'Wireless Earbuds Pro',
    sellerName: 'TechHaven ZW',
    quantity: 2,
    date: '4 Mar 2026',
    deliveryMethod: 'Standard Delivery',
    price: 45,
  },
  {
    id: 'ORD-1236',
    status: 'confirmed',
    escrowStatus: 'payment_confirmed',
    productImage: products[6].image,
    productName: 'Maputi & Biltong Pack',
    sellerName: "Mbuya's Kitchen",
    quantity: 3,
    date: '5 Mar 2026',
    deliveryMethod: 'Same-Day Delivery',
    price: 8,
  },
];

// ─── Helper functions ───────────────────────────────────────────────

export const getProductById = (id: string) => products.find(p => p.id === id);
export const getSellerById = (id: string) => sellers.find(s => s.id === id);
export const getProductsBySeller = (sellerId: string) => products.filter(p => p.sellerId === sellerId);
export const getProductsByCategory = (cat: string) => products.filter(p => p.category === cat);
export const getFeaturedSellers = () => sellers.filter(s => s.verified).slice(0, 3);
export const getTrendingProducts = () => products.slice(0, 8);
export const getDealProducts = () => products.filter(p => p.isDeal).slice(0, 4);

// ─── Conversion & Cross-sell helpers ────────────────────────────────

/** Deterministic "stock left" based on product id hash */
export const getStockLeft = (id: string): number => {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return (hash % 12) + 2; // 2-13 items
};

/** Deterministic "people viewing" based on product id */
export const getViewingCount = (id: string): number => {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return (hash % 18) + 3; // 3-20 people
};

/** Deterministic "bought recently" count */
export const getRecentPurchaseCount = (id: string): number => {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return (hash % 30) + 5; // 5-34 purchases
};

/** Similar products by category (excluding self) */
export const getSimilarProducts = (productId: string, limit = 4): Product[] => {
  const product = getProductById(productId);
  if (!product) return [];
  return products
    .filter(p => p.id !== productId && p.category === product.category)
    .slice(0, limit);
};

/** Customers also bought — different category, same price bracket */
export const getCustomersAlsoBought = (productId: string, limit = 4): Product[] => {
  const product = getProductById(productId);
  if (!product) return [];
  const priceMin = product.price * 0.5;
  const priceMax = product.price * 2;
  return products
    .filter(p => p.id !== productId && p.category !== product.category && p.price >= priceMin && p.price <= priceMax)
    .slice(0, limit);
};

/** Frequently bought together — same seller, different products */
export const getFrequentlyBoughtTogether = (productId: string, limit = 3): Product[] => {
  const product = getProductById(productId);
  if (!product) return [];
  const sellerProducts = products.filter(p => p.id !== productId && p.sellerId === product.sellerId);
  const otherProducts = products.filter(p => p.id !== productId && p.sellerId !== product.sellerId && p.category !== product.category);
  return [...sellerProducts.slice(0, 2), ...otherProducts.slice(0, 1)].slice(0, limit);
};

/** Determine smart badge based on product data */
export const getSmartBadge = (product: Product): { label: string; color: string } | null => {
  if (product.reviewCount > 200) return { label: 'Best Seller', color: '#CE1126' };
  if (product.isDeal && product.originalPrice) return { label: 'Hot Deal', color: '#CE1126' };
  const stock = getStockLeft(product.id);
  if (stock <= 5) return { label: `Only ${stock} left`, color: '#CE1126' };
  if (product.rating >= 4.8 && product.reviewCount > 40) return { label: 'Top Rated', color: '#009739' };
  return null;
};

/** Get delivery estimate text */
export const getDeliveryEstimate = (badge: string): string => {
  if (badge === 'Same-Day Delivery') return 'Today';
  if (badge === 'Free Delivery') return 'Tomorrow';
  return '1-3 days';
};

// ─── Seed Seller Applications (Admin) ───────────────────────────────
export const seedSellerApplications: SellerApplicationData[] = [
  {
    id: 'sa1', sellerName: 'Tatenda Moyo', businessName: 'Tatenda Fashion', email: 'tatenda@email.com',
    phone: '+263 77 111 2222', whatsapp: '+263 77 111 2222', city: 'Bulawayo', address: '14 Main St, CBD',
    category: 'Fashion & Clothing', description: 'Trendy affordable fashion for young Zimbabweans.',
    status: 'pending', submittedAt: '8 Apr 2026', documents: ['national-id.jpg', 'selfie.jpg'],
  },
  {
    id: 'sa2', sellerName: 'Rumbidzai Ncube', businessName: 'Rumbi Organics', email: 'rumbi@email.com',
    phone: '+263 77 333 4444', whatsapp: '+263 77 333 4444', city: 'Harare', address: '22 Borrowdale Rd',
    category: 'Beauty & Personal Care', description: 'Organic beauty products made with local ingredients.',
    status: 'pending', submittedAt: '7 Apr 2026', documents: ['national-id.jpg', 'selfie.jpg'],
  },
  {
    id: 'sa3', sellerName: 'Kudakwashe Dube', businessName: 'KD Electronics', email: 'kd@email.com',
    phone: '+263 78 555 6666', whatsapp: '+263 78 555 6666', city: 'Gweru', address: '5 Robert Mugabe Way',
    category: 'Electronics & Gadgets', description: 'Quality refurbished electronics and accessories.',
    status: 'approved', submittedAt: '1 Apr 2026', documents: ['national-id.jpg', 'selfie.jpg'],
  },
  {
    id: 'sa4', sellerName: 'Farai Chirwa', businessName: 'Farai Thrift', email: 'farai@email.com',
    phone: '+263 71 777 8888', whatsapp: '+263 71 777 8888', city: 'Mutare', address: '8 Herbert Chitepo St',
    category: 'Thrift / Second Hand', description: 'Grade-A thrift clothing from the UK.',
    status: 'rejected', submittedAt: '28 Mar 2026', documents: ['national-id.jpg'], reviewNotes: 'Missing selfie with ID. Please resubmit.',
  },
  {
    id: 'sa5', sellerName: 'Nyasha Moyo', businessName: 'Nyasha Snacks', email: 'nyasha@email.com',
    phone: '+263 77 999 0000', whatsapp: '+263 77 999 0000', city: 'Bulawayo', address: '30 Fort St, Suburbs',
    category: 'Food & Groceries', description: 'Homemade Zimbabwean snacks and treats delivered fresh.',
    status: 'pending', submittedAt: '9 Apr 2026', documents: ['national-id.jpg', 'selfie.jpg'],
  },
];

// ─── Testimonials ───────────────────────────────────────────────────
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

// ─── Deal countdown helper ──────────────────────────────────────────
/** Returns a deterministic deal end time (hours + minutes remaining) for a product */
export const getDealEndTime = (productId: string): { hours: number; minutes: number; seconds: number } => {
  const hash = productId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    hours: (hash % 23) + 1,
    minutes: (hash % 59) + 1,
    seconds: (hash % 59) + 1,
  };
};

/** Deterministic "bought today" count */
export const getBoughtTodayCount = (id: string): number => {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return (hash % 20) + 3; // 3-22 purchases today
};

// ─── Free delivery threshold ────────────────────────────────────────
export const FREE_DELIVERY_THRESHOLD = 50;