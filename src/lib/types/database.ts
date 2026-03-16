// ============================================================
// Database Types - Olive Oil Marketplace
// ============================================================

export type UserRole = 'customer' | 'producer' | 'admin';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
export type SubscriptionPlan = 'monthly' | 'premium';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ProducerStatus = 'pending' | 'approved' | 'rejected';

// --- Profiles ---
export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  postal_code: string | null;
  created_at: string;
  updated_at: string;
}

// --- Producers ---
export interface Producer {
  id: string;
  user_id: string;
  company_name: string;
  description: string;
  country: string;
  region: string;
  address: string;
  phone: string;
  logo_url: string | null;
  banner_url: string | null;
  website: string | null;
  status: ProducerStatus;
  stripe_account_id: string | null;
  commission_rate: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  profile?: Profile;
  products?: Product[];
}

// --- Products ---
export interface Product {
  id: string;
  producer_id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price: number | null;
  currency: string;
  stock: number;
  olive_variety: string;
  harvest_year: number;
  origin_region: string;
  origin_country: string;
  organic: boolean;
  intensity: 'mild' | 'medium' | 'intense';
  volume_ml: number;
  is_published: boolean;
  avg_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  producer?: Producer;
  images?: ProductImage[];
  reviews?: Review[];
}

// --- Product Images ---
export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  position: number;
  created_at: string;
}

// --- Orders ---
export interface Order {
  id: string;
  user_id: string;
  total_price: number;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  currency: string;
  status: OrderStatus;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  shipping_postal_code: string;
  stripe_session_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  items?: OrderItem[];
  profile?: Profile;
}

// --- Order Items ---
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  producer_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  // Joined fields
  product?: Product;
}

// --- Reviews ---
export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  profile?: Profile;
}

// --- Subscriptions ---
export interface Subscription {
  id: string;
  user_id: string;
  plan_type: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_subscription_id: string | null;
  current_period_start: string;
  current_period_end: string;
  renewal_date: string;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

// --- Payouts ---
export interface Payout {
  id: string;
  producer_id: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  stripe_payout_id: string | null;
  period_start: string;
  period_end: string;
  created_at: string;
  // Joined fields
  producer?: Producer;
}

// ============================================================
// Cart Types (Client-side only, Zustand)
// ============================================================

export interface CartItem {
  product_id: string;
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

// ============================================================
// Filter / Search Types
// ============================================================

export interface ProductFilters {
  search?: string;
  variety?: string[];
  region?: string[];
  country?: string[];
  organic?: boolean;
  intensity?: string[];
  minPrice?: number;
  maxPrice?: number;
  harvestYear?: number[];
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'name';
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
