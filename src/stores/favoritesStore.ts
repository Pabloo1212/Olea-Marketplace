'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, validateProduct } from '@/lib/validation/schemas';

interface FavoritesState {
  items: Product[];
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
  getFavoriteCount: () => number;
  // Server sync methods
  syncWithServer: () => Promise<void>;
  addToServerFavorites: (productId: string) => Promise<void>;
  removeFromServerFavorites: (productId: string) => Promise<void>;
}

// Validation schema for persisted data
const persistedFavoritesSchema = {
  items: [],
};

// Storage with validation
const validatedStorage = createJSONStorage(() => localStorage, {
  serialize: (state) => {
    try {
      // Validate items before persisting
      const validItems = (state as FavoritesState).items.filter(item => {
        try {
          validateProduct(item);
          return true;
        } catch {
          console.warn('Invalid product in favorites, skipping:', item);
          return false;
        }
      });
      
      return JSON.stringify({ ...state, items: validItems });
    } catch (error) {
      console.error('Error serializing favorites:', error);
      return JSON.stringify(persistedFavoritesSchema);
    }
  },
  deserialize: (str) => {
    try {
      const parsed = JSON.parse(str);
      
      // Validate structure
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.items)) {
        console.warn('Invalid favorites structure, using defaults');
        return persistedFavoritesSchema;
      }
      
      // Validate each item
      const validItems = parsed.items.filter((item: any) => {
        try {
          validateProduct(item);
          return true;
        } catch {
          console.warn('Invalid product in persisted favorites:', item);
          return false;
        }
      });
      
      return { ...parsed, items: validItems };
    } catch (error) {
      console.error('Error deserializing favorites:', error);
      return persistedFavoritesSchema;
    }
  },
});

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],

      addFavorite: (product: Product) => {
        // Validate product before adding
        try {
          validateProduct(product);
        } catch (error) {
          console.error('Invalid product added to favorites:', error);
          return;
        }

        set((state) => {
          // Check if already exists
          if (state.items.find((item) => item.id === product.id)) {
            return state;
          }
          
          const newItems = [...state.items, product];
          
          // Sync with server (async, don't block)
          get().addToServerFavorites(product.id).catch(console.error);
          
          return { items: newItems };
        });
      },

      removeFavorite: (productId: string) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== productId);
          
          // Sync with server (async, don't block)
          get().removeFromServerFavorites(productId).catch(console.error);
          
          return { items: newItems };
        });
      },

      toggleFavorite: (product: Product) => {
        const state = get();
        
        // Validate product
        try {
          validateProduct(product);
        } catch (error) {
          console.error('Invalid product in toggleFavorite:', error);
          return;
        }
        
        if (state.items.find((item) => item.id === product.id)) {
          state.removeFavorite(product.id);
        } else {
          state.addFavorite(product);
        }
      },

      isFavorite: (productId: string) => {
        return get().items.some((item) => item.id === productId);
      },

      clearFavorites: () => {
        set({ items: [] });
        // TODO: Clear from server when implemented
      },

      getFavoriteCount: () => {
        return get().items.length;
      },

      // Server sync methods (placeholder implementations)
      syncWithServer: async () => {
        try {
          // TODO: Implement server sync when backend is ready
          // const { data } = await supabase
          //   .from('user_favorites')
          //   .select('product_id, products(*)')
          //   .eq('user_id', userId);
          
          console.log('Server sync not implemented yet');
        } catch (error) {
          console.error('Error syncing favorites with server:', error);
        }
      },

      addToServerFavorites: async (productId: string) => {
        try {
          // TODO: Implement when backend is ready
          // await supabase
          //   .from('user_favorites')
          //   .insert({ user_id: userId, product_id: productId });
          
          console.log('Server favorite add not implemented yet:', productId);
        } catch (error) {
          console.error('Error adding favorite to server:', error);
        }
      },

      removeFromServerFavorites: async (productId: string) => {
        try {
          // TODO: Implement when backend is ready
          // await supabase
          //   .from('user_favorites')
          //   .delete()
          //   .eq('user_id', userId)
          //   .eq('product_id', productId);
          
          console.log('Server favorite remove not implemented yet:', productId);
        } catch (error) {
          console.error('Error removing favorite from server:', error);
        }
      },
    }),
    {
      name: 'olive-favorites',
      storage: validatedStorage,
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('Favorites hydrated from storage:', state.items.length, 'items');
          // Optionally sync with server on hydration
          // state.syncWithServer().catch(console.error);
        }
      },
    }
  )
);

// Selectors for optimized re-renders
export const useFavoriteItems = () => useFavoritesStore((state) => state.items);
export const useFavoriteCount = () => useFavoritesStore((state) => state.items.length);
export const useIsFavorite = (productId: string) => 
  useFavoritesStore((state) => state.items.some(item => item.id === productId));
