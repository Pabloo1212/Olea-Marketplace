'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, CartItem, CartState, validateProduct, cartItemSchema, cartStateSchema } from '@/lib/validation/schemas';

interface CartStore extends CartState {
  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Getters
  getItemQuantity: (productId: string) => number;
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
  isInCart: (productId: string) => boolean;
  
  // Internal actions
  loadCart: () => void;
}

// Constants for business logic
const MAX_QUANTITY_PER_ITEM = 100;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isOpen: false,

      // Actions
      addItem: (product: Product, quantity = 1) => {
        const validatedProduct = validateProduct(product);
        const existingItem = get().items.find(item => item.product_id === validatedProduct.id);

        // Don't add item if out of stock
        if (validatedProduct.stock <= 0) {
          return;
        }

        if (existingItem) {
          // Update quantity of existing item
          const newQuantity = Math.min(
            existingItem.quantity + quantity, 
            validatedProduct.stock, 
            MAX_QUANTITY_PER_ITEM
          );
          
          // Don't update if quantity would be 0
          if (newQuantity <= 0) {
            return;
          }
          
          set((state) => ({
            items: state.items.map(item =>
              item.product_id === validatedProduct.id
                ? { ...item, quantity: newQuantity }
                : item
            ),
            isOpen: true,
          }));
        } else {
          // Add new item
          const finalQuantity = Math.min(quantity, validatedProduct.stock, MAX_QUANTITY_PER_ITEM);
          
          // Don't add if quantity would be 0
          if (finalQuantity <= 0) {
            return;
          }
          
          const newItem: CartItem = {
            id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            product_id: validatedProduct.id,
            quantity: finalQuantity,
            added_at: new Date().toISOString(),
            product: validatedProduct,
          };

          set((state) => ({
            items: [...state.items, newItem],
            isOpen: true,
          }));
        }
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter(item => item.product_id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map(item => {
            if (item.product_id === productId) {
              const maxQuantity = Math.min(item.product.stock, MAX_QUANTITY_PER_ITEM);
              return {
                ...item,
                quantity: Math.min(quantity, maxQuantity),
              };
            }
            return item;
          }),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      // Getters
      getItemQuantity: (productId: string) => {
        const item = get().items.find(item => item.product_id === productId);
        return item ? item.quantity : 0;
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = subtotal > 0 ? (subtotal >= 75 ? 0 : 8.50) : 0;
        return subtotal + shipping;
      },

      isInCart: (productId: string) => {
        return get().items.some(item => item.product_id === productId);
      },

      // Internal actions
      loadCart: () => {
        // This is handled by the persist middleware
      },
    }),
    {
      name: 'olive-marketplace-cart',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

// Computed values (getters)
export const useCartTotals = () => {
  const items = useCartStore((state) => state.items);
  
  return {
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: items.reduce((total, item) => total + item.product.price * item.quantity, 0),
  };
};

export const useCartItemCount = () => {
  return useCartStore((state) => 
    state.items.reduce((total, item) => total + item.quantity, 0)
  );
};

// Selectors for optimized re-renders
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartIsOpen = () => useCartStore((state) => state.isOpen);
export const useIsInCart = (productId: string) => 
  useCartStore((state) => state.isInCart(productId));
export const useItemQuantity = (productId: string) => 
  useCartStore((state) => state.getItemQuantity(productId));
