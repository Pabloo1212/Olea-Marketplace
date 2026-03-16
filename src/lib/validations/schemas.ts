import { z } from 'zod';

// ─── Auth Schemas ──────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['customer', 'producer']),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// ─── Product Schemas ──────────────────────────────
export const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters').max(200),
  description: z.string().max(5000).optional(),
  short_description: z.string().min(10, 'Short description must be at least 10 characters').max(150),
  price: z.number().positive('Price must be greater than 0').max(999.99),
  compare_at_price: z.number().positive().max(999.99).optional().nullable(),
  stock: z.number().int().min(0, 'Stock cannot be negative').max(99999),
  olive_variety: z.string().min(1, 'Please select an olive variety'),
  harvest_year: z.number().int().min(2020).max(new Date().getFullYear() + 1),
  origin_region: z.string().max(100).optional(),
  origin_country: z.string().min(1, 'Please select a country of origin'),
  organic: z.boolean().default(false),
  intensity: z.enum(['mild', 'medium', 'intense']),
  volume_ml: z.number().int().min(100).max(10000),
  tasting_notes: z.string().max(500).optional(),
  best_before: z.string().optional(),
  awards: z.string().max(500).optional(),
});

export const productUpdateSchema = productSchema.partial();

// ─── Review Schemas ──────────────────────────────
export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating is required').max(5),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(2000),
  product_id: z.string().uuid(),
});

// ─── Order / Checkout Schemas ──────────────────────────────
export const shippingAddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Please enter a valid email'),
  address: z.string().min(5, 'Please enter your full address').max(200),
  city: z.string().min(1, 'City is required').max(100),
  postalCode: z.string().min(3, 'Please enter a valid postal code').max(20),
  country: z.string().min(2, 'Please select a country'),
});

export const paymentSchema = z.object({
  cardName: z.string().min(2, 'Name on card is required'),
  cardNumber: z.string().regex(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/, 'Please enter a valid card number'),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Please enter MM/YY format'),
  cvc: z.string().regex(/^\d{3,4}$/, 'Please enter a valid CVC'),
});

// ─── Producer Schemas ──────────────────────────────
export const producerApplicationSchema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters').max(200),
  description: z.string().min(50, 'Please provide at least 50 characters describing your company').max(2000),
  region: z.string().min(2, 'Region is required').max(100),
  country: z.string().min(2, 'Country is required'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  phone: z.string().min(6, 'Please enter a valid phone number').max(20).optional(),
});

// ─── Contact Form ──────────────────────────────
export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(5).max(150),
  message: z.string().min(20, 'Message must be at least 20 characters').max(5000),
});

// ─── Type exports ──────────────────────────────
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type ProducerApplicationInput = z.infer<typeof producerApplicationSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
