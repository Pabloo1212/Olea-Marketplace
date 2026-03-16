'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/types/database';

interface FavoritesState {
  items: Product[];
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],

      addFavorite: (product: Product) => {
        set((state) => {
          if (state.items.find((item) => item.id === product.id)) {
            return state;
          }
          return { items: [...state.items, product] };
        });
      },

      removeFavorite: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      toggleFavorite: (product: Product) => {
        const state = get();
        if (state.items.find((item) => item.id === product.id)) {
          state.removeFavorite(product.id);
        } else {
          state.addFavorite(product);
        }
      },

      isFavorite: (productId: string) => {
        return get().items.some((item) => item.id === productId);
      },

      clearFavorites: () => set({ items: [] }),
    }),
    {
      name: 'olive-favorites',
    }
  )
);
