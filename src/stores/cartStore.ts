'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from '@/lib/types/database';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getItemCount: () => number;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: Product, quantity: number = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product_id === product.id
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product_id === product.id
                  ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
                  : item
              ),
              isOpen: true,
            };
          }

          return {
            items: [
              ...state.items,
              { product_id: product.id, product, quantity: Math.min(quantity, product.stock) },
            ],
            isOpen: true,
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product_id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.product_id !== productId),
            };
          }
          return {
            items: state.items.map((item) =>
              item.product_id === productId
                ? { ...item, quantity: Math.min(quantity, item.product.stock) }
                : item
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const state = get();
        const subtotal = state.getSubtotal();
        const shipping = subtotal > 0 ? 8.50 : 0;
        return subtotal + shipping;
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'olive-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
