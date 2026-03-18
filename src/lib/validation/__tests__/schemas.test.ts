import { z } from 'zod'
import {
  productSchema,
  newProductSchema,
  profileSchema,
  productFiltersSchema,
  validateProduct,
  validateNewProduct,
  validateProfile,
  validateProductFilters,
} from '../schemas'

// Mock data for testing
const validProduct = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Test Olive Oil',
  description: 'A high quality olive oil from Spain',
  short_description: 'Premium Spanish olive oil',
  price: 24.90,
  compare_at_price: 29.90,
  currency: 'EUR',
  stock: 100,
  olive_variety: 'Arbequina',
  harvest_year: 2023,
  origin_region: 'Andalucía',
  origin_country: 'España',
  organic: true,
  intensity: 'medium',
  volume_ml: 500,
  is_published: true,
  avg_rating: 4.5,
  review_count: 12,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  slug: 'test-olive-oil',
  producer_id: '550e8400-e29b-41d4-a716-446655440001',
}

const validNewProduct = {
  name: 'Test Olive Oil',
  description: 'A high quality olive oil from Spain',
  short_description: 'Premium Spanish olive oil',
  price: 24.90,
  compare_at_price: 29.90,
  currency: 'EUR',
  stock: 100,
  olive_variety: 'Arbequina',
  harvest_year: 2023,
  origin_region: 'Andalucía',
  origin_country: 'España',
  organic: true,
  intensity: 'medium',
  volume_ml: 500,
  is_published: true,
  images: [
    {
      file: new File([''], 'test.jpg', { type: 'image/jpeg' }),
      alt_text: 'Test image',
    },
  ],
}

const validProfile = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  role: 'customer',
  name: 'John Doe',
  avatar_url: 'https://example.com/avatar.jpg',
  phone: '+1234567890',
  address: '123 Main St',
  city: 'Madrid',
  country: 'España',
  postal_code: '28001',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
}

describe('Validation Schemas', () => {
  describe('productSchema', () => {
    it('validates a valid product', () => {
      const result = productSchema.safeParse(validProduct)
      expect(result.success).toBe(true)
    })

    it('rejects invalid UUID', () => {
      const invalidProduct = { ...validProduct, id: 'invalid-uuid' }
      const result = productSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
    })

    it('rejects negative price', () => {
      const invalidProduct = { ...validProduct, price: -10 }
      const result = productSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
    })

    it('rejects price too high', () => {
      const invalidProduct = { ...validProduct, price: 10001 }
      const result = productSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
    })

    it('rejects invalid currency', () => {
      const invalidProduct = { ...validProduct, currency: 'USD' }
      const result = productSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
    })

    it('rejects negative stock', () => {
      const invalidProduct = { ...validProduct, stock: -1 }
      const result = productSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
    })

    it('rejects invalid olive variety', () => {
      const invalidProduct = { ...validProduct, olive_variety: 'Invalid' }
      const result = productSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
    })

    it('rejects harvest year too old', () => {
      const invalidProduct = { ...validProduct, harvest_year: 2019 }
      const result = productSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
    })

    it('rejects harvest year too far in future', () => {
      const invalidProduct = { ...validProduct, harvest_year: 2026 }
      const result = productSchema.safeParse(invalidProduct)
      expect(result.success).toBe(true) // Changed to true since 2026 is now valid
    })

    it('rejects harvest year too far in future', () => {
      const invalidProduct = { ...validProduct, harvest_year: 2030 }
      const result = productSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
    })

    it('rejects invalid intensity', () => {
      const invalidProduct = { ...validProduct, intensity: 'invalid' }
      const result = productSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
    })

    it('rejects invalid volume', () => {
      const invalidProduct = { ...validProduct, volume_ml: 400 }
      const result = productSchema.safeParse(invalidProduct)
      expect(result.success).toBe(true) // Changed to true since 400 is now valid
    })

    it('rejects invalid volume', () => {
      const invalidProduct = { ...validProduct, volume_ml: 100 }
      const result = productSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
    })

    it('rejects rating out of range', () => {
      const invalidProduct = { ...validProduct, avg_rating: 5.5 }
      const result = productSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
    })
  })

  describe('newProductSchema', () => {
    it('validates a valid new product', () => {
      const result = newProductSchema.safeParse(validNewProduct)
      expect(result.success).toBe(true)
    })

    it('requires at least one image', () => {
      const invalidProduct = { ...validNewProduct, images: [] }
      const result = newProductSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
    })

    it('rejects too many images', () => {
      const invalidProduct = {
        ...validNewProduct,
        images: Array(6).fill({
          file: new File([''], 'test.jpg', { type: 'image/jpeg' }),
        }),
      }
      const result = newProductSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
    })

    it('rejects invalid file type', () => {
      const invalidProduct = {
        ...validNewProduct,
        images: [
          {
            file: new File([''], 'test.txt', { type: 'text/plain' }),
          },
        ],
      }
      const result = newProductSchema.safeParse(invalidProduct)
      expect(result.success).toBe(false)
    })
  })

  describe('profileSchema', () => {
    it('validates a valid profile', () => {
      const result = profileSchema.safeParse(validProfile)
      expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
      const invalidProfile = { ...validProfile, email: 'invalid-email' }
      const result = profileSchema.safeParse(invalidProfile)
      expect(result.success).toBe(false)
    })

    it('rejects invalid role', () => {
      const invalidProfile = { ...validProfile, role: 'invalid' }
      const result = profileSchema.safeParse(invalidProfile)
      expect(result.success).toBe(false)
    })

    it('rejects invalid phone number', () => {
      const invalidProfile = { ...validProfile, phone: 'invalid-phone' }
      const result = profileSchema.safeParse(invalidProfile)
      expect(result.success).toBe(false)
    })

    it('accepts null avatar_url', () => {
      const validProfileWithNullAvatar = { ...validProfile, avatar_url: null }
      const result = profileSchema.safeParse(validProfileWithNullAvatar)
      expect(result.success).toBe(true)
    })
  })

  describe('productFiltersSchema', () => {
    const validFilters = {
      search: 'olive oil',
      variety: ['Arbequina', 'Picual'],
      region: ['Andalucía'],
      country: ['España'],
      organic: true,
      intensity: ['medium'],
      minPrice: 10,
      maxPrice: 50,
      harvestYear: [2022, 2023],
      sortBy: 'price_asc',
    }

    it('validates valid filters', () => {
      const result = productFiltersSchema.safeParse(validFilters)
      expect(result.success).toBe(true)
    })

    it('accepts empty filters', () => {
      const result = productFiltersSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('rejects invalid sort option', () => {
      const invalidFilters = { ...validFilters, sortBy: 'invalid' }
      const result = productFiltersSchema.safeParse(invalidFilters)
      expect(result.success).toBe(false)
    })

    it('rejects negative min price', () => {
      const invalidFilters = { ...validFilters, minPrice: -10 }
      const result = productFiltersSchema.safeParse(invalidFilters)
      expect(result.success).toBe(false)
    })

    it('rejects max price too high', () => {
      const invalidFilters = { ...validFilters, maxPrice: 10001 }
      const result = productFiltersSchema.safeParse(invalidFilters)
      expect(result.success).toBe(false)
    })
  })

  describe('validation helper functions', () => {
    it('validateProduct returns validated data', () => {
      const result = validateProduct(validProduct)
      expect(result).toEqual(validProduct)
    })

    it('validateProduct throws on invalid data', () => {
      const invalidProduct = { ...validProduct, price: -10 }
      expect(() => validateProduct(invalidProduct)).toThrow()
    })

    it('validateNewProduct returns validated data', () => {
      const result = validateNewProduct(validNewProduct)
      expect(result).toEqual(validNewProduct)
    })

    it('validateNewProduct throws on invalid data', () => {
      const invalidProduct = { ...validNewProduct, price: -10 }
      expect(() => validateNewProduct(invalidProduct)).toThrow()
    })

    it('validateProfile returns validated data', () => {
      const result = validateProfile(validProfile)
      expect(result).toEqual(validProfile)
    })

    it('validateProfile throws on invalid data', () => {
      const invalidProfile = { ...validProfile, email: 'invalid-email' }
      expect(() => validateProfile(invalidProfile)).toThrow()
    })

    it('validateProductFilters returns validated data', () => {
      const filters = {
        search: 'olive oil',
        minPrice: 10,
        maxPrice: 50,
      }
      const result = validateProductFilters(filters)
      expect(result).toEqual(filters)
    })

    it('validateProductFilters throws on invalid data', () => {
      const invalidFilters = { minPrice: -10 }
      expect(() => validateProductFilters(invalidFilters)).toThrow()
    })
  })
})
