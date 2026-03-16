'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getProducts(filters?: {
  search?: string;
  variety?: string;
  country?: string;
  organic?: boolean;
  intensity?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('products')
    .select('*, producer:producers(*), images:product_images(*)')
    .eq('is_published', true);

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,olive_variety.ilike.%${filters.search}%`);
  }
  if (filters?.variety) {
    query = query.ilike('olive_variety', `%${filters.variety}%`);
  }
  if (filters?.country) {
    query = query.eq('origin_country', filters.country);
  }
  if (filters?.organic !== undefined) {
    query = query.eq('organic', filters.organic);
  }
  if (filters?.intensity) {
    query = query.eq('intensity', filters.intensity);
  }
  if (filters?.minPrice) {
    query = query.gte('price', filters.minPrice);
  }
  if (filters?.maxPrice) {
    query = query.lte('price', filters.maxPrice);
  }

  // Sorting
  switch (filters?.sortBy) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'name':
      query = query.order('name', { ascending: true });
      break;
    case 'rating':
    default:
      query = query.order('avg_rating', { ascending: false });
      break;
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, producer:producers(*), images:product_images(*), reviews:reviews(*, profile:profiles(*))')
    .eq('slug', slug)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  // Get the user's producer profile
  const { data: producer } = await supabase
    .from('producers')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!producer) return { error: 'Producer profile not found' };

  const name = formData.get('name') as string;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const { data, error } = await supabase.from('products').insert({
    producer_id: producer.id,
    name,
    slug,
    description: formData.get('description') as string,
    short_description: formData.get('short_description') as string,
    price: parseFloat(formData.get('price') as string),
    stock: parseInt(formData.get('stock') as string),
    olive_variety: formData.get('olive_variety') as string,
    harvest_year: parseInt(formData.get('harvest_year') as string),
    origin_region: formData.get('origin_region') as string,
    origin_country: formData.get('origin_country') as string,
    organic: formData.get('organic') === 'true',
    intensity: formData.get('intensity') as string,
    volume_ml: parseInt(formData.get('volume_ml') as string),
    is_published: false,
  }).select().single();

  if (error) return { data: null, error: error.message };

  revalidatePath('/dashboard/products');
  return { data, error: null };
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  const fields = ['name', 'description', 'short_description', 'olive_variety', 'origin_region', 'origin_country', 'intensity'];

  for (const field of fields) {
    const value = formData.get(field);
    if (value !== null) updates[field] = value;
  }

  const numericFields = ['price', 'stock', 'harvest_year', 'volume_ml'];
  for (const field of numericFields) {
    const value = formData.get(field);
    if (value !== null) updates[field] = parseFloat(value as string);
  }

  if (formData.has('organic')) updates.organic = formData.get('organic') === 'true';
  if (formData.has('is_published')) updates.is_published = formData.get('is_published') === 'true';

  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/products');
  revalidatePath(`/products`);
  return { error: null };
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/products');
  return { error: null };
}
