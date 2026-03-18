/**
 * Data Manager - Centralized data access layer
 * Handles caching, validation, and error handling for all data operations
 */

import { createClient } from '@/lib/supabase/client';
import { 
  Product, 
  NewProductData, 
  Profile, 
  Producer, 
  Review,
  ProductFilters,
  validateProduct,
  validateNewProduct,
  validateProfile,
  validateProductFilters,
  productSchema,
  productArraySchema
} from '@/lib/validation/schemas';
import { mockProducts, mockProducers, mockReviews } from '@/lib/data/mock-data';

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

class DataManager {
  private static instance: DataManager;
  private supabase = createClient();
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  // Cache management
  private setCache<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Error handling wrapper
  private async handleRequest<T>(
    operation: () => Promise<T>,
    fallbackData?: T,
    context: string = 'Unknown operation'
  ): Promise<T> {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      console.error(`Data Manager Error in ${context}:`, error);
      
      // In development, throw to surface issues
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
      
      // In production, use fallback if available
      if (fallbackData !== undefined) {
        console.warn(`Using fallback data for ${context}`);
        return fallbackData;
      }
      
      throw error;
    }
  }

  // ============================================================
  // PRODUCTS
  // ============================================================

  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    const cacheKey = `products:${JSON.stringify(filters || {})}`;
    
    // Check cache first
    const cached = this.getCache<Product[]>(cacheKey);
    if (cached) return cached;

    return this.handleRequest(
      async () => {
        let query = this.supabase
          .from('products')
          .select(`
            *,
            producer:producers(*),
            images:product_images(*),
            reviews:reviews(*)
          `)
          .eq('is_published', true);

        // Apply filters
        if (filters) {
          const validatedFilters = validateProductFilters(filters);
          
          if (validatedFilters.search) {
            query = query.ilike('name', `%${validatedFilters.search}%`);
          }
          
          if (validatedFilters.variety?.length) {
            query = query.in('olive_variety', validatedFilters.variety);
          }
          
          if (validatedFilters.country?.length) {
            query = query.in('origin_country', validatedFilters.country);
          }
          
          if (validatedFilters.organic !== undefined) {
            query = query.eq('organic', validatedFilters.organic);
          }
          
          if (validatedFilters.intensity?.length) {
            query = query.in('intensity', validatedFilters.intensity);
          }
          
          if (validatedFilters.minPrice !== undefined) {
            query = query.gte('price', validatedFilters.minPrice);
          }
          
          if (validatedFilters.maxPrice !== undefined) {
            query = query.lte('price', validatedFilters.maxPrice);
          }
        }

        const { data, error } = await query;

        if (error) throw error;
        
        // Validate and transform data
        const validatedData = productArraySchema.parse(data || []);
        
        // Apply sorting
        if (filters?.sortBy) {
          switch (filters.sortBy) {
            case 'price_asc':
              validatedData.sort((a, b) => a.price - b.price);
              break;
            case 'price_desc':
              validatedData.sort((a, b) => b.price - a.price);
              break;
            case 'rating':
              validatedData.sort((a, b) => b.avg_rating - a.avg_rating);
              break;
            case 'newest':
              validatedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              break;
            case 'name':
              validatedData.sort((a, b) => a.name.localeCompare(b.name));
              break;
          }
        } else {
          // Default sort by rating
          validatedData.sort((a, b) => b.avg_rating - a.avg_rating);
        }

        this.setCache(cacheKey, validatedData);
        return validatedData;
      },
      mockProducts, // Fallback to mock data
      'getProducts'
    );
  }

  async getProductById(id: string): Promise<Product | null> {
    const cacheKey = `product:${id}`;
    
    const cached = this.getCache<Product>(cacheKey);
    if (cached) return cached;

    return this.handleRequest(
      async () => {
        const { data, error } = await this.supabase
          .from('products')
          .select(`
            *,
            producer:producers(*),
            images:product_images(*),
            reviews:reviews(*)
          `)
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return null; // Not found
          throw error;
        }

        const validatedData = validateProduct(data);
        this.setCache(cacheKey, validatedData);
        return validatedData;
      },
      mockProducts.find(p => p.id === id) || null,
      'getProductById'
    );
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const cacheKey = `product:slug:${slug}`;
    
    const cached = this.getCache<Product>(cacheKey);
    if (cached) return cached;

    return this.handleRequest(
      async () => {
        const { data, error } = await this.supabase
          .from('products')
          .select(`
            *,
            producer:producers(*),
            images:product_images(*),
            reviews:reviews(*)
          `)
          .eq('slug', slug)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
        }

        const validatedData = validateProduct(data);
        this.setCache(cacheKey, validatedData);
        return validatedData;
      },
      mockProducts.find(p => p.slug === slug) || null,
      'getProductBySlug'
    );
  }

  async createProduct(productData: NewProductData, producerId: string): Promise<Product> {
    return this.handleRequest(
      async () => {
        const validatedData = validateNewProduct(productData);
        
        // Create slug from name
        const slug = validatedData.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        // Insert product without images first
        const { data: product, error: productError } = await this.supabase
          .from('products')
          .insert({
            name: validatedData.name,
            slug,
            description: validatedData.description,
            short_description: validatedData.short_description,
            price: validatedData.price,
            compare_at_price: validatedData.compare_at_price,
            currency: validatedData.currency,
            stock: validatedData.stock,
            olive_variety: validatedData.olive_variety,
            harvest_year: validatedData.harvest_year,
            origin_region: validatedData.origin_region,
            origin_country: validatedData.origin_country,
            organic: validatedData.organic,
            intensity: validatedData.intensity,
            volume_ml: validatedData.volume_ml,
            is_published: validatedData.is_published,
            producer_id: producerId,
          })
          .select()
          .single();

        if (productError) throw productError;

        // TODO: Handle image uploads here
        // For now, we'll create a placeholder image
        const { data: image, error: imageError } = await this.supabase
          .from('product_images')
          .insert({
            product_id: product.id,
            image_url: '/images/placeholder-bottle.png',
            alt_text: validatedData.name,
            position: 0,
          })
          .select()
          .single();

        if (imageError) throw imageError;

        // Clear relevant caches
        this.clearCache('products');
        
        // Return complete product
        const completeProduct = await this.getProductById(product.id);
        if (!completeProduct) throw new Error('Failed to retrieve created product');
        
        return completeProduct;
      },
      Promise.reject(new Error('Product creation requires backend')),
      'createProduct'
    );
  }

  async updateProduct(id: string, updates: Partial<NewProductData>): Promise<Product> {
    return this.handleRequest(
      async () => {
        // Remove images from updates (handle separately)
        const { images, ...productUpdates } = updates as any;
        
        const { data, error } = await this.supabase
          .from('products')
          .update(productUpdates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        
        const validatedData = validateProduct(data);
        
        // Clear caches
        this.clearCache('products');
        this.cache.delete(`product:${id}`);
        
        return validatedData;
      },
      Promise.reject(new Error('Product update requires backend')),
      'updateProduct'
    );
  }

  async deleteProduct(id: string): Promise<void> {
    return this.handleRequest(
      async () => {
        const { error } = await this.supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        // Clear caches
        this.clearCache('products');
        this.cache.delete(`product:${id}`);
      },
      Promise.reject(new Error('Product deletion requires backend')),
      'deleteProduct'
    );
  }

  // ============================================================
  // USER PROFILES
  // ============================================================

  async getCurrentProfile(): Promise<Profile | null> {
    return this.handleRequest(
      async () => {
        const { data: { user }, error: authError } = await this.supabase.auth.getUser();
        
        if (authError || !user) return null;
        
        const { data, error } = await this.supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
        }

        return validateProfile(data);
      },
      null,
      'getCurrentProfile'
    );
  }

  async updateProfile(updates: Partial<Profile>): Promise<Profile> {
    return this.handleRequest(
      async () => {
        const { data: { user }, error: authError } = await this.supabase.auth.getUser();
        
        if (authError || !user) throw new Error('Not authenticated');
        
        const { data, error } = await this.supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (error) throw error;
        
        return validateProfile(data);
      },
      Promise.reject(new Error('Profile update requires backend')),
      'updateProfile'
    );
  }

  // ============================================================
  // PRODUCER OPERATIONS
  // ============================================================

  async getProducerByUserId(userId: string): Promise<Producer | null> {
    const cacheKey = `producer:user:${userId}`;
    
    const cached = this.getCache<Producer>(cacheKey);
    if (cached) return cached;

    return this.handleRequest(
      async () => {
        const { data, error } = await this.supabase
          .from('producers')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
        }

        // Validate with producer schema (would need to import it)
        const validatedData = data as Producer;
        this.setCache(cacheKey, validatedData);
        return validatedData;
      },
      mockProducers.find(p => p.user_id === userId) || null,
      'getProducerByUserId'
    );
  }

  async getProducerProducts(producerId: string): Promise<Product[]> {
    const cacheKey = `products:producer:${producerId}`;
    
    const cached = this.getCache<Product[]>(cacheKey);
    if (cached) return cached;

    return this.handleRequest(
      async () => {
        const { data, error } = await this.supabase
          .from('products')
          .select(`
            *,
            images:product_images(*),
            reviews:reviews(*)
          `)
          .eq('producer_id', producerId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const validatedData = productArraySchema.parse(data || []);
        this.setCache(cacheKey, validatedData);
        return validatedData;
      },
      mockProducts.filter(p => p.producer_id === producerId),
      'getProducerProducts'
    );
  }

  // ============================================================
  // SEARCH
  // ============================================================

  async searchProducts(query: string): Promise<Product[]> {
    return this.getProducts({ search: query });
  }

  // ============================================================
  // HEALTH CHECK
  // ============================================================

  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('count')
        .limit(1)
        .single();

      if (error) throw error;

      return {
        status: 'healthy',
        details: {
          database: 'connected',
          cache_size: this.cache.size,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          database: 'disconnected',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}

// Export singleton instance
export const dataManager = DataManager.getInstance();

// Export convenience functions
export const {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getCurrentProfile,
  updateProfile,
  getProducerByUserId,
  getProducerProducts,
  searchProducts,
  healthCheck,
} = dataManager;
