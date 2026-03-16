import { Product, Producer, Review, Order, Profile } from '@/lib/types/database';

// ============================================================
// Mock Producers
// ============================================================

export const mockProducers: Producer[] = [
  {
    id: 'prod-001',
    user_id: 'user-001',
    company_name: 'Finca El Olivar',
    description: 'Familia dedicada al cultivo del olivo desde 1892 en las sierras de Jaén. Nuestros aceites son prensados en frío a menos de 24 horas tras la cosecha, preservando todas sus propiedades y aromas naturales.',
    country: 'España',
    region: 'Jaén, Andalucía',
    address: 'Camino del Olivar, s/n',
    phone: '+34 953 00 00 00',
    logo_url: '/images/producers/finca-olivar-logo.jpg',
    banner_url: '/images/producers/finca-olivar-banner.jpg',
    website: 'https://fincaelolivar.es',
    status: 'approved',
    stripe_account_id: null,
    commission_rate: 10,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'prod-002',
    user_id: 'user-002',
    company_name: 'Oliveto di Toscana',
    description: 'Produttori di olio extra vergine di oliva dal cuore della Toscana. Le nostre olive Frantoio e Leccino vengono raccolte a mano e frante entro poche ore per ottenere un olio di qualità superiore.',
    country: 'Italia',
    region: 'Toscana',
    address: 'Via degli Olivi, 42',
    phone: '+39 055 00 00 00',
    logo_url: '/images/producers/oliveto-toscana-logo.jpg',
    banner_url: '/images/producers/oliveto-toscana-banner.jpg',
    website: 'https://olivetotoscana.it',
    status: 'approved',
    stripe_account_id: null,
    commission_rate: 10,
    created_at: '2024-02-10T10:00:00Z',
    updated_at: '2024-02-10T10:00:00Z',
  },
  {
    id: 'prod-003',
    user_id: 'user-003',
    company_name: 'Kalamata Gold',
    description: 'Premium Koroneiki olive oil from the sun-drenched groves of Kalamata, Greece. Our single-estate oils have won international awards for their exceptional fruity character and peppery finish.',
    country: 'Greece',
    region: 'Kalamata, Peloponnese',
    address: 'Odos Olivion 15',
    phone: '+30 272 00 00 000',
    logo_url: '/images/producers/kalamata-gold-logo.jpg',
    banner_url: '/images/producers/kalamata-gold-banner.jpg',
    website: 'https://kalamata-gold.gr',
    status: 'approved',
    stripe_account_id: null,
    commission_rate: 10,
    created_at: '2024-03-05T10:00:00Z',
    updated_at: '2024-03-05T10:00:00Z',
  },
  {
    id: 'prod-004',
    user_id: 'user-004',
    company_name: 'Alentejo Harvest',
    description: 'From the rolling hills of Alentejo, Portugal, we produce award-winning organic olive oil using traditional stone mills and modern sustainability practices.',
    country: 'Portugal',
    region: 'Alentejo',
    address: 'Herdade das Oliveiras',
    phone: '+351 266 00 00 00',
    logo_url: '/images/producers/alentejo-logo.jpg',
    banner_url: '/images/producers/alentejo-banner.jpg',
    website: 'https://alentejoharvest.pt',
    status: 'approved',
    stripe_account_id: null,
    commission_rate: 10,
    created_at: '2024-04-20T10:00:00Z',
    updated_at: '2024-04-20T10:00:00Z',
  },
];

// ============================================================
// Mock Products
// ============================================================

export const mockProducts: Product[] = [
  {
    id: 'p-001',
    producer_id: 'prod-001',
    name: 'Aceite de Oliva Virgen Extra – Picual',
    slug: 'aceite-virgen-extra-picual',
    description: 'Aceite de oliva virgen extra de variedad Picual, prensado en frío de las sierras de Jaén. Notas herbáceas intensas con toques de tomate y almendra verde. Ideal para ensaladas, tostadas y platos de pasta. Rico en polifenoles y antioxidantes naturales.',
    short_description: 'Aceite AOVE Picual prensado en frío. Intenso, herbáceo y saludable.',
    price: 24.90,
    compare_at_price: 29.90,
    currency: 'EUR',
    stock: 150,
    olive_variety: 'Picual',
    harvest_year: 2025,
    origin_region: 'Sierra de Cazorla, Jaén',
    origin_country: 'España',
    organic: true,
    intensity: 'intense',
    volume_ml: 500,
    is_published: true,
    avg_rating: 4.8,
    review_count: 124,
    created_at: '2024-11-01T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z',
    producer: mockProducers[0],
    images: [
      { id: 'img-001', product_id: 'p-001', image_url: '/images/products/picual-1.jpg', alt_text: 'Botella de AOVE Picual', position: 0, created_at: '2024-11-01T10:00:00Z' },
      { id: 'img-002', product_id: 'p-001', image_url: '/images/products/picual-2.jpg', alt_text: 'Detalle de etiqueta', position: 1, created_at: '2024-11-01T10:00:00Z' },
    ],
  },
  {
    id: 'p-002',
    producer_id: 'prod-001',
    name: 'Aceite Hojiblanca – Reserva Familiar',
    slug: 'aceite-hojiblanca-reserva-familiar',
    description: 'Aceite de oliva virgen extra de variedad Hojiblanca, producido en edición limitada para nuestra reserva familiar. Sabor suave y afrutado con notas de manzana verde y un ligero picor final.',
    short_description: 'Hojiblanca edición limitada. Suave, afrutado y elegante.',
    price: 32.50,
    compare_at_price: null,
    currency: 'EUR',
    stock: 45,
    olive_variety: 'Hojiblanca',
    harvest_year: 2025,
    origin_region: 'Sierra de Cazorla, Jaén',
    origin_country: 'España',
    organic: true,
    intensity: 'mild',
    volume_ml: 500,
    is_published: true,
    avg_rating: 4.9,
    review_count: 67,
    created_at: '2024-11-15T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z',
    producer: mockProducers[0],
    images: [
      { id: 'img-003', product_id: 'p-002', image_url: '/images/products/hojiblanca-1.jpg', alt_text: 'Botella de Hojiblanca Reserva', position: 0, created_at: '2024-11-15T10:00:00Z' },
    ],
  },
  {
    id: 'p-003',
    producer_id: 'prod-002',
    name: 'Olio Extra Vergine – Frantoio Toscano',
    slug: 'olio-extra-vergine-frantoio-toscano',
    description: 'Olio extra vergine di oliva from Frantoio olives grown on the hillsides of Tuscany. A bold, peppery oil with distinct notes of artichoke and fresh-cut grass. Perfect for bruschetta and finishing dishes.',
    short_description: 'Tuscan Frantoio extra virgin. Bold, peppery, and artisanal.',
    price: 28.00,
    compare_at_price: null,
    currency: 'EUR',
    stock: 200,
    olive_variety: 'Frantoio',
    harvest_year: 2025,
    origin_region: 'Chianti, Toscana',
    origin_country: 'Italia',
    organic: false,
    intensity: 'intense',
    volume_ml: 500,
    is_published: true,
    avg_rating: 4.7,
    review_count: 89,
    created_at: '2024-12-01T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z',
    producer: mockProducers[1],
    images: [
      { id: 'img-004', product_id: 'p-003', image_url: '/images/products/frantoio-1.jpg', alt_text: 'Tuscan olive oil bottle', position: 0, created_at: '2024-12-01T10:00:00Z' },
    ],
  },
  {
    id: 'p-004',
    producer_id: 'prod-002',
    name: 'Leccino Delicato – Bio',
    slug: 'leccino-delicato-bio',
    description: 'A delicate, organic extra virgin olive oil from the Leccino variety. Mild and buttery with notes of almond and ripe fruit. Ideal for fish, salads, and delicate sauces.',
    short_description: 'Organic Leccino, mild and buttery with almond notes.',
    price: 35.00,
    compare_at_price: 40.00,
    currency: 'EUR',
    stock: 80,
    olive_variety: 'Leccino',
    harvest_year: 2024,
    origin_region: 'Chianti, Toscana',
    origin_country: 'Italia',
    organic: true,
    intensity: 'mild',
    volume_ml: 750,
    is_published: true,
    avg_rating: 4.6,
    review_count: 54,
    created_at: '2024-12-10T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z',
    producer: mockProducers[1],
    images: [
      { id: 'img-005', product_id: 'p-004', image_url: '/images/products/leccino-1.jpg', alt_text: 'Leccino olive oil', position: 0, created_at: '2024-12-10T10:00:00Z' },
    ],
  },
  {
    id: 'p-005',
    producer_id: 'prod-003',
    name: 'Koroneiki Premium – Single Estate',
    slug: 'koroneiki-premium-single-estate',
    description: 'Award-winning single-estate Koroneiki olive oil from Kalamata. Intensely fruity with a pleasant bitterness and robust peppery finish. The gold standard of Greek olive oils.',
    short_description: 'Award-winning Greek Koroneiki. Fruity, bitter, peppery perfection.',
    price: 38.50,
    compare_at_price: 45.00,
    currency: 'EUR',
    stock: 60,
    olive_variety: 'Koroneiki',
    harvest_year: 2025,
    origin_region: 'Kalamata, Peloponnese',
    origin_country: 'Greece',
    organic: true,
    intensity: 'intense',
    volume_ml: 500,
    is_published: true,
    avg_rating: 4.9,
    review_count: 156,
    created_at: '2024-12-20T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    producer: mockProducers[2],
    images: [
      { id: 'img-006', product_id: 'p-005', image_url: '/images/products/koroneiki-1.jpg', alt_text: 'Koroneiki Premium bottle', position: 0, created_at: '2024-12-20T10:00:00Z' },
    ],
  },
  {
    id: 'p-006',
    producer_id: 'prod-003',
    name: 'Kalamata Reserve Blend',
    slug: 'kalamata-reserve-blend',
    description: 'A masterful blend of Koroneiki and Athinolia varieties, creating a balanced and complex olive oil. Medium intensity with harmonious fruity and herbal notes.',
    short_description: 'Greek blend of Koroneiki & Athinolia. Balanced and complex.',
    price: 29.90,
    compare_at_price: null,
    currency: 'EUR',
    stock: 120,
    olive_variety: 'Koroneiki & Athinolia Blend',
    harvest_year: 2025,
    origin_region: 'Kalamata, Peloponnese',
    origin_country: 'Greece',
    organic: false,
    intensity: 'medium',
    volume_ml: 500,
    is_published: true,
    avg_rating: 4.5,
    review_count: 78,
    created_at: '2025-01-05T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z',
    producer: mockProducers[2],
    images: [
      { id: 'img-007', product_id: 'p-006', image_url: '/images/products/kalamata-blend-1.jpg', alt_text: 'Kalamata Reserve Blend', position: 0, created_at: '2025-01-05T10:00:00Z' },
    ],
  },
  {
    id: 'p-007',
    producer_id: 'prod-004',
    name: 'Galega Orgânico – Alentejo',
    slug: 'galega-organico-alentejo',
    description: 'Organic Galega olive oil from traditional stone mills in Alentejo. A smooth, golden oil with notes of ripe olives, dried herbs, and warm spices. Perfect for Portuguese cuisine.',
    short_description: 'Portuguese Galega organic. Smooth, golden, and traditional.',
    price: 26.00,
    compare_at_price: null,
    currency: 'EUR',
    stock: 90,
    olive_variety: 'Galega',
    harvest_year: 2025,
    origin_region: 'Alentejo',
    origin_country: 'Portugal',
    organic: true,
    intensity: 'medium',
    volume_ml: 500,
    is_published: true,
    avg_rating: 4.4,
    review_count: 42,
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    producer: mockProducers[3],
    images: [
      { id: 'img-008', product_id: 'p-007', image_url: '/images/products/galega-1.jpg', alt_text: 'Galega Portuguese olive oil', position: 0, created_at: '2025-01-10T10:00:00Z' },
    ],
  },
  {
    id: 'p-008',
    producer_id: 'prod-004',
    name: 'Cobrançosa Premium – Limited Edition',
    slug: 'cobrancosa-premium-limited-edition',
    description: 'Limited edition Cobrançosa monovarietal from century-old trees. Rich, full-bodied with intense green fruit aromas, a touch of banana, and a long peppery aftertaste.',
    short_description: 'Limited edition Portuguese Cobrançosa. Rich, full-bodied, rare.',
    price: 42.00,
    compare_at_price: 50.00,
    currency: 'EUR',
    stock: 30,
    olive_variety: 'Cobrançosa',
    harvest_year: 2024,
    origin_region: 'Alentejo',
    origin_country: 'Portugal',
    organic: true,
    intensity: 'intense',
    volume_ml: 500,
    is_published: true,
    avg_rating: 4.8,
    review_count: 31,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-20T10:00:00Z',
    producer: mockProducers[3],
    images: [
      { id: 'img-009', product_id: 'p-008', image_url: '/images/products/cobrancosa-1.jpg', alt_text: 'Cobrançosa Limited Edition', position: 0, created_at: '2025-01-15T10:00:00Z' },
    ],
  },
];

// ============================================================
// Mock Reviews
// ============================================================

export const mockReviews: Review[] = [
  {
    id: 'rev-001', product_id: 'p-001', user_id: 'user-100', rating: 5,
    title: 'Best olive oil I have ever tasted',
    comment: 'Incredible Picual with perfect balance of bitterness and fruitiness. The aroma of fresh-cut grass hits you immediately. Will definitely buy again!',
    is_verified_purchase: true, created_at: '2025-01-20T14:00:00Z', updated_at: '2025-01-20T14:00:00Z',
    profile: { id: 'user-100', email: 'maria@example.com', role: 'customer', name: 'María García', avatar_url: null, phone: null, address: null, city: null, country: 'España', postal_code: null, created_at: '2024-06-01T10:00:00Z', updated_at: '2024-06-01T10:00:00Z' },
  },
  {
    id: 'rev-002', product_id: 'p-001', user_id: 'user-101', rating: 5,
    title: 'Restaurant quality at home',
    comment: 'We serve this in our restaurant and guests always ask which oil we use. Outstanding quality and consistent flavor profile year after year.',
    is_verified_purchase: true, created_at: '2025-01-18T10:00:00Z', updated_at: '2025-01-18T10:00:00Z',
    profile: { id: 'user-101', email: 'chef.marco@example.com', role: 'customer', name: 'Marco Bianchi', avatar_url: null, phone: null, address: null, city: null, country: 'Italia', postal_code: null, created_at: '2024-07-15T10:00:00Z', updated_at: '2024-07-15T10:00:00Z' },
  },
  {
    id: 'rev-003', product_id: 'p-005', user_id: 'user-102', rating: 5,
    title: 'Liquid gold from Kalamata',
    comment: 'This Koroneiki is absolute perfection. The peppery kick with that beautiful green color... I use it on everything. Worth every cent.',
    is_verified_purchase: true, created_at: '2025-02-01T09:00:00Z', updated_at: '2025-02-01T09:00:00Z',
    profile: { id: 'user-102', email: 'sophie@example.com', role: 'customer', name: 'Sophie Müller', avatar_url: null, phone: null, address: null, city: null, country: 'Germany', postal_code: null, created_at: '2024-09-20T10:00:00Z', updated_at: '2024-09-20T10:00:00Z' },
  },
  {
    id: 'rev-004', product_id: 'p-003', user_id: 'user-103', rating: 4,
    title: 'Authentic Tuscan flavor',
    comment: 'Beautiful peppery oil, perfect on bruschetta. The artichoke notes come through wonderfully. Minus one star only because shipping took a while.',
    is_verified_purchase: true, created_at: '2025-01-25T16:00:00Z', updated_at: '2025-01-25T16:00:00Z',
    profile: { id: 'user-103', email: 'james@example.com', role: 'customer', name: 'James Wilson', avatar_url: null, phone: null, address: null, city: null, country: 'United Kingdom', postal_code: null, created_at: '2024-08-10T10:00:00Z', updated_at: '2024-08-10T10:00:00Z' },
  },
  {
    id: 'rev-005', product_id: 'p-002', user_id: 'user-104', rating: 5,
    title: 'The smoothest oil I\'ve tried',
    comment: 'This Hojiblanca is incredibly smooth. No harshness at all, just pure buttery goodness with a hint of apple. My kids love it on toast!',
    is_verified_purchase: true, created_at: '2025-02-05T11:00:00Z', updated_at: '2025-02-05T11:00:00Z',
    profile: { id: 'user-104', email: 'anna@example.com', role: 'customer', name: 'Anna Kowalski', avatar_url: null, phone: null, address: null, city: null, country: 'Poland', postal_code: null, created_at: '2024-10-05T10:00:00Z', updated_at: '2024-10-05T10:00:00Z' },
  },
];

// ============================================================
// Mock Orders (for dashboard)
// ============================================================

export const mockOrders: Order[] = [
  {
    id: 'ord-001', user_id: 'user-100', total_price: 74.70, subtotal: 66.40, shipping_cost: 8.30, tax: 0,
    currency: 'EUR', status: 'delivered',
    shipping_name: 'María García', shipping_address: 'Calle Mayor 12', shipping_city: 'Madrid', shipping_country: 'España', shipping_postal_code: '28001',
    stripe_session_id: null, notes: null,
    created_at: '2025-02-10T14:00:00Z', updated_at: '2025-02-15T10:00:00Z',
    items: [
      { id: 'oi-001', order_id: 'ord-001', product_id: 'p-001', producer_id: 'prod-001', quantity: 2, unit_price: 24.90, total_price: 49.80, created_at: '2025-02-10T14:00:00Z' },
      { id: 'oi-002', order_id: 'ord-001', product_id: 'p-006', producer_id: 'prod-003', quantity: 1, unit_price: 29.90, total_price: 29.90, created_at: '2025-02-10T14:00:00Z' },
    ],
  },
  {
    id: 'ord-002', user_id: 'user-101', total_price: 73.50, subtotal: 63.00, shipping_cost: 10.50, tax: 0,
    currency: 'EUR', status: 'shipped',
    shipping_name: 'Marco Bianchi', shipping_address: 'Via Roma 8', shipping_city: 'Milano', shipping_country: 'Italia', shipping_postal_code: '20121',
    stripe_session_id: null, notes: 'Please handle with care',
    created_at: '2025-02-20T09:00:00Z', updated_at: '2025-02-22T10:00:00Z',
    items: [
      { id: 'oi-003', order_id: 'ord-002', product_id: 'p-004', producer_id: 'prod-002', quantity: 1, unit_price: 35.00, total_price: 35.00, created_at: '2025-02-20T09:00:00Z' },
      { id: 'oi-004', order_id: 'ord-002', product_id: 'p-003', producer_id: 'prod-002', quantity: 1, unit_price: 28.00, total_price: 28.00, created_at: '2025-02-20T09:00:00Z' },
    ],
  },
  {
    id: 'ord-003', user_id: 'user-102', total_price: 118.50, subtotal: 106.50, shipping_cost: 12.00, tax: 0,
    currency: 'EUR', status: 'paid',
    shipping_name: 'Sophie Müller', shipping_address: 'Berliner Str. 24', shipping_city: 'Berlin', shipping_country: 'Germany', shipping_postal_code: '10115',
    stripe_session_id: null, notes: null,
    created_at: '2025-03-01T11:00:00Z', updated_at: '2025-03-01T11:00:00Z',
    items: [
      { id: 'oi-005', order_id: 'ord-003', product_id: 'p-005', producer_id: 'prod-003', quantity: 2, unit_price: 38.50, total_price: 77.00, created_at: '2025-03-01T11:00:00Z' },
      { id: 'oi-006', order_id: 'ord-003', product_id: 'p-006', producer_id: 'prod-003', quantity: 1, unit_price: 29.90, total_price: 29.90, created_at: '2025-03-01T11:00:00Z' },
    ],
  },
  {
    id: 'ord-004', user_id: 'user-103', total_price: 50.30, subtotal: 42.00, shipping_cost: 8.30, tax: 0,
    currency: 'EUR', status: 'pending',
    shipping_name: 'James Wilson', shipping_address: '15 Baker Street', shipping_city: 'London', shipping_country: 'United Kingdom', shipping_postal_code: 'W1U 3BW',
    stripe_session_id: null, notes: null,
    created_at: '2025-03-10T16:00:00Z', updated_at: '2025-03-10T16:00:00Z',
    items: [
      { id: 'oi-007', order_id: 'ord-004', product_id: 'p-008', producer_id: 'prod-004', quantity: 1, unit_price: 42.00, total_price: 42.00, created_at: '2025-03-10T16:00:00Z' },
    ],
  },
];

// ============================================================
// Dashboard Stats
// ============================================================

export const mockDashboardStats = {
  producer: {
    totalSales: 12480.50,
    pendingOrders: 3,
    totalOrders: 47,
    activeProducts: 8,
    totalRevenue: 11232.45,
    avgOrderValue: 65.40,
    lowStockProducts: 2,
    monthlyGrowth: 12.5,
  },
  admin: {
    totalRevenue: 87650.00,
    totalOrders: 342,
    totalUsers: 1256,
    totalProducers: 18,
    pendingProducers: 3,
    activeProducts: 94,
    monthlyGrowth: 18.3,
    commissionEarned: 8765.00,
  },
};

// ============================================================
// Helper: get products by filter
// ============================================================

export function getFilteredProducts(filters: {
  search?: string;
  variety?: string;
  country?: string;
  organic?: boolean;
  intensity?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}): Product[] {
  let products = [...mockProducts];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.olive_variety.toLowerCase().includes(q)
    );
  }
  if (filters.variety) {
    products = products.filter(p => p.olive_variety.toLowerCase().includes(filters.variety!.toLowerCase()));
  }
  if (filters.country) {
    products = products.filter(p => p.origin_country.toLowerCase() === filters.country!.toLowerCase());
  }
  if (filters.organic !== undefined) {
    products = products.filter(p => p.organic === filters.organic);
  }
  if (filters.intensity) {
    products = products.filter(p => p.intensity === filters.intensity);
  }
  if (filters.minPrice) {
    products = products.filter(p => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice) {
    products = products.filter(p => p.price <= filters.maxPrice!);
  }

  switch (filters.sortBy) {
    case 'price_asc': products.sort((a, b) => a.price - b.price); break;
    case 'price_desc': products.sort((a, b) => b.price - a.price); break;
    case 'rating': products.sort((a, b) => b.avg_rating - a.avg_rating); break;
    case 'newest': products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
    case 'name': products.sort((a, b) => a.name.localeCompare(b.name)); break;
    default: products.sort((a, b) => b.avg_rating - a.avg_rating);
  }

  return products;
}
