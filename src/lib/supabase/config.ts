/**
 * Supabase Configuration and Validation
 * Provides secure, validated access to Supabase client
 */

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

interface SupabaseValidationError {
  field: string;
  message: string;
}

class SupabaseConfigManager {
  private static instance: SupabaseConfigManager;
  private config: SupabaseConfig | null = null;
  private validationErrors: SupabaseValidationError[] = [];

  private constructor() {
    this.validateAndSetConfig();
  }

  static getInstance(): SupabaseConfigManager {
    if (!SupabaseConfigManager.instance) {
      SupabaseConfigManager.instance = new SupabaseConfigManager();
    }
    return SupabaseConfigManager.instance;
  }

  private validateAndSetConfig(): void {
    this.validationErrors = [];
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Validate URL
    if (!url) {
      this.validationErrors.push({
        field: 'NEXT_PUBLIC_SUPABASE_URL',
        message: 'Supabase URL is required'
      });
    } else {
      if (!url.startsWith('https://')) {
        this.validationErrors.push({
          field: 'NEXT_PUBLIC_SUPABASE_URL',
          message: 'Supabase URL must start with https://'
        });
      }
      
      if (!url.includes('.supabase.co')) {
        this.validationErrors.push({
          field: 'NEXT_PUBLIC_SUPABASE_URL',
          message: 'Invalid Supabase URL format'
        });
      }
    }

    // Validate Anon Key
    if (!anonKey) {
      this.validationErrors.push({
        field: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        message: 'Supabase anon key is required'
      });
    } else {
      if (anonKey.length < 100) {
        this.validationErrors.push({
          field: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
          message: 'Invalid Supabase anon key format'
        });
      }

      // Basic pattern check for JWT
      if (!anonKey.startsWith('eyJ')) {
        this.validationErrors.push({
          field: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
          message: 'Supabase anon key should be a valid JWT token'
        });
      }
    }

    // Set config if valid
    if (this.validationErrors.length === 0 && url && anonKey) {
      this.config = { url, anonKey };
    }
  }

  getConfig(): SupabaseConfig {
    if (!this.config) {
      // During build (SSG/SSR), env vars may not be available yet.
      // Return empty strings to avoid crashing the build — errors will
      // surface at runtime when actual DB calls are made.
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      if (!url || !anonKey) {
        console.warn(
          '[Supabase] Missing environment variables. ' +
          'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
        );
      }
      return { url, anonKey };
    }
    return this.config;
  }

  isValid(): boolean {
    return this.config !== null;
  }

  getValidationErrors(): SupabaseValidationError[] {
    return [...this.validationErrors];
  }

  // For development - show config status
  getStatus(): {
    isValid: boolean;
    url: string | null;
    hasAnonKey: boolean;
    errors: SupabaseValidationError[];
  } {
    return {
      isValid: this.isValid(),
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      errors: this.getValidationErrors(),
    };
  }
}

// Export singleton instance
export const supabaseConfig = SupabaseConfigManager.getInstance();

// Export convenience function
export function getSupabaseConfig(): SupabaseConfig {
  return supabaseConfig.getConfig();
}

// Export validation helper
export function validateSupabaseConfig(): boolean {
  return supabaseConfig.isValid();
}

// For debugging in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Supabase Config Status:', supabaseConfig.getStatus());
}
