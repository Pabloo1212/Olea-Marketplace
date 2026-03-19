import { z } from 'zod';

// Base schemas for common fields
const uuidSchema = z.string().uuid('Invalid ID format');
const emailSchema = z.string().email('Invalid email address');
const urlSchema = z.string().url('Invalid URL format').optional().nullable();
const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format').optional().nullable();
const priceSchema = z.number().min(0, 'Price must be positive').max(10000, 'Price cannot exceed €10,000');
const ratingSchema = z.number().min(0, 'Rating cannot be negative').max(5, 'Rating cannot exceed 5');
const yearSchema = z.number().int().min(2020, 'Harvest year must be 2020 or later').max(new Date().getFullYear() + 1, 'Harvest year cannot be more than 1 year in the future');

// Enum schemas
const currencySchema = z.enum(['EUR'], { required_error: 'Currency is required' });
const roleSchema = z.enum(['customer', 'producer', 'admin'], { required_error: 'Role is required' });
const organicSchema = z.boolean();
const intensitySchema = z.enum(['mild', 'medium', 'intense'], { required_error: 'Intensity is required' });
const statusSchema = z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], { required_error: 'Status is required' });
const volumeSchema = z.enum(['250', '500', '750', '1000', '5000'], { required_error: 'Volume is required' });
const oliveVarietySchema = z.enum([
  'Picual', 'Arbequina', 'Hojiblanca', 'Frantoio', 'Koroneiki', 
  'Leccino', 'Cobrançosa', 'Galega', 'Blend'
], { required_error: 'Olive variety is required' });
const countrySchema = z.enum([
  'España', 'Italia', 'Greece', 'Portugal', 'Tunisia', 'Morocco'
], { required_error: 'Country is required' });

// Image schemas
const productImageSchema = z.object({
  id: uuidSchema,
  product_id: uuidSchema,
  image_url: z.string().url('Invalid image URL'),
  alt_text: z.string().optional(),
});

const newProductImageSchema = z.object({
  file: z.instanceof(File, { message: 'Invalid file' })
    .refine(file => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type), 
      { message: 'File must be JPEG, PNG, or WebP' })
    .refine(file => file.size <= 5 * 1024 * 1024, 
      { message: 'File size must be less than 5MB' }),
  alt_text: z.string().optional(),
});

// Core entity schemas
export const productSchema = z.object({
  id: z.string(),
  producer_id: z.string(),
  name: z.string().min(1, 'Product name is required').max(200, 'Product name cannot exceed 200 characters'),
  description: z.string().max(5000).optional().nullable().default(''),
  short_description: z.string().max(300).optional().nullable().default(''),
  price: z.number().min(0, 'Price must be positive').max(100000),
  compare_at_price: z.number().optional().nullable(),
  currency: z.string().default('EUR'),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  // Accept any string for these — producers can enter freely
  olive_variety: z.string().default(''),
  harvest_year: z.number().int().optional().nullable(),
  origin_region: z.string().optional().nullable().default(''),
  origin_country: z.string().default(''),
  organic: z.boolean().default(false),
  intensity: z.string().optional().nullable().default('medium'),
  volume_ml: z.number().int().min(1).optional().nullable().default(500),
  is_published: z.boolean().default(false),
  avg_rating: z.number().min(0).max(5).optional().nullable().default(0),
  review_count: z.number().int().min(0).optional().nullable().default(0),
  slug: z.string().optional().nullable().default(''),
  created_at: z.string().optional().nullable().default(new Date().toISOString()),
  updated_at: z.string().optional().nullable().default(new Date().toISOString()),
  images: z.array(z.object({
    id: z.string().optional(),
    product_id: z.string().optional(),
    image_url: z.string(),
    alt_text: z.string().optional().nullable(),
    position: z.number().optional().nullable(),
  })).optional().nullable().default([]),
  // Optional extended fields
  region: z.string().optional(),
  tasting_notes: z.string().optional(),
  storage_instructions: z.string().optional(),
  // Allow extra fields from joins (producer, reviews)
  producer: z.any().optional(),
  reviews: z.any().optional(),
}).passthrough(); // allow extra fields without error

export const productArraySchema = z.array(productSchema);


export const newProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name cannot exceed 200 characters'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
  short_description: z.string().min(1, 'Short description is required').max(150, 'Short description cannot exceed 150 characters'),
  price: priceSchema,
  compare_at_price: priceSchema.optional().nullable(),
  currency: currencySchema,
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  olive_variety: oliveVarietySchema,
  harvest_year: yearSchema,
  origin_region: z.string().max(100, 'Region name cannot exceed 100 characters').optional(),
  origin_country: countrySchema,
  organic: organicSchema,
  intensity: intensitySchema,
  volume_ml: z.number().int().min(250, 'Volume must be at least 250ml').max(5000, 'Volume cannot exceed 5000ml'),
  is_published: z.boolean(),
  images: z.array(newProductImageSchema)
    .min(1, 'At least one image is required')
    .max(5, 'Cannot upload more than 5 images'),
});

export const profileSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  role: roleSchema,
  name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters').optional(),
  avatar_url: urlSchema,
  phone: phoneSchema,
  address: z.string().max(200, 'Address cannot exceed 200 characters').optional(),
  city: z.string().max(100, 'City cannot exceed 100 characters').optional(),
  country: z.string().max(100, 'Country cannot exceed 100 characters').optional(),
  postal_code: z.string().max(20, 'Postal code cannot exceed 20 characters').optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const producerSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  business_name: z.string().min(1, 'Business name is required').max(200, 'Business name cannot exceed 200 characters'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
  logo_url: urlSchema,
  website: urlSchema,
  certification: z.array(z.string()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const cartItemSchema = z.object({
  id: uuidSchema,
  product_id: uuidSchema,
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Quantity cannot exceed 99'),
  added_at: z.string().datetime(),
  product: productSchema,
});

export const cartStateSchema = z.object({
  items: z.array(cartItemSchema),
  isOpen: z.boolean().default(false),
});

export const orderSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  status: statusSchema,
  total_amount: priceSchema,
  currency: currencySchema,
  shipping_address: z.string().min(1, 'Shipping address is required'),
  tracking_number: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const reviewSchema = z.object({
  id: uuidSchema,
  product_id: uuidSchema,
  user_id: uuidSchema,
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(1, 'Review comment is required').max(1000, 'Review comment cannot exceed 1000 characters'),
  verified_purchase: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Filter and query schemas
export const productFiltersSchema = z.object({
  search: z.string().max(200, 'Search query cannot exceed 200 characters').optional(),
  variety: z.array(oliveVarietySchema).optional(),
  region: z.array(z.string()).optional(),
  country: z.array(countrySchema).optional(),
  organic: z.boolean().optional(),
  intensity: z.array(intensitySchema).optional(),
  minPrice: z.number().min(0, 'Minimum price cannot be negative').optional(),
  maxPrice: z.number().max(10000, 'Maximum price cannot exceed €10,000').optional(),
  harvestYear: z.array(z.number().int()).optional(),
  sortBy: z.enum([
    'price_asc', 'price_desc',
    'rating', 'newest', 'name',
    'created_at_desc', 'created_at_asc',
    'rating_desc', 'rating_asc',
    'name_asc', 'name_desc',
  ]).optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
});

// API response schemas
export const apiResponseSchema = <T>(dataSchema: z.ZodType<T>) => z.object({
  data: dataSchema,
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
});

export const paginatedResponseSchema = <T>(dataSchema: z.ZodType<T>) => z.object({
  data: z.array(dataSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
  success: z.boolean(),
  message: z.string().optional(),
});

// Type exports
export type Product = z.infer<typeof productSchema>;
export type NewProduct = z.infer<typeof newProductSchema>;
export type NewProductData = NewProduct; // Alias for backwards compatibility
export type Profile = z.infer<typeof profileSchema>;
export type Producer = z.infer<typeof producerSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type CartState = z.infer<typeof cartStateSchema>;
export type Order = z.infer<typeof orderSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type ProductFilters = z.infer<typeof productFiltersSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type ApiResponse<T> = z.infer<ReturnType<typeof apiResponseSchema<T>>>;
export type PaginatedResponse<T> = z.infer<ReturnType<typeof paginatedResponseSchema<T>>>;

// Validation helper functions
export const validateProduct = (data: unknown): Product => {
  return productSchema.parse(data);
};

export const validateNewProduct = (data: unknown): NewProduct => {
  return newProductSchema.parse(data);
};

export const validateProfile = (data: unknown): Profile => {
  return profileSchema.parse(data);
};

export const validateProducer = (data: unknown): Producer => {
  return producerSchema.parse(data);
};

export const validateCartItem = (data: unknown): CartItem => {
  return cartItemSchema.parse(data);
};

export const validateCartState = (data: unknown): CartState => {
  return cartStateSchema.parse(data);
};

export const validateOrder = (data: unknown): Order => {
  return orderSchema.parse(data);
};

export const validateReview = (data: unknown): Review => {
  return reviewSchema.parse(data);
};

export const validateProductFilters = (data: unknown): ProductFilters => {
  return productFiltersSchema.parse(data);
};

export const validatePagination = (data: unknown): Pagination => {
  return paginationSchema.parse(data);
};

// Safe validation functions (return null instead of throwing)
export const safeValidateProduct = (data: unknown): Product | null => {
  try {
    return productSchema.parse(data);
  } catch {
    return null;
  }
};

export const safeValidateProfile = (data: unknown): Profile | null => {
  try {
    return profileSchema.parse(data);
  } catch {
    return null;
  }
};

export const safeValidateProductFilters = (data: unknown): ProductFilters | null => {
  try {
    return productFiltersSchema.parse(data);
  } catch {
    return null;
  }
};
export {
  uuidSchema,
  emailSchema,
  urlSchema,
  phoneSchema,
  priceSchema,
  ratingSchema,
  currencySchema,
  roleSchema,
  organicSchema,
  intensitySchema,
  statusSchema,
  volumeSchema,
  oliveVarietySchema,
  countrySchema,
  productImageSchema,
  newProductImageSchema,
};
