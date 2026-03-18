import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from './config';

/**
 * Creates a validated Supabase client instance
 * Throws error if configuration is invalid
 */
export function createClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createBrowserClient(url, anonKey);
}

/**
 * Creates a Supabase client with error handling
 * Returns null if configuration is invalid
 */
export function createClientSafe() {
  try {
    return createClient();
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return null;
  }
}
