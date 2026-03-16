'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { useTranslation } from '@/stores/i18nStore';
import { formatPrice } from '@/lib/utils/helpers';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export default function CartDrawer() {
  const { t } = useTranslation();
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal, getTotal, getItemCount } = useCartStore();
  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const shipping = subtotal > 0 ? (subtotal >= 75 ? 0 : 8.50) : 0;
  const total = subtotal + shipping;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={closeCart} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-olive-100">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-olive-700" />
            <h2 className="font-sans text-lg font-semibold text-olive-900">
              {t('cart.title')} ({itemCount})
            </h2>
          </div>
          <button onClick={closeCart} className="p-2 rounded-xl hover:bg-olive-50 transition-colors">
            <X className="w-5 h-5 text-olive-600" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-olive-50 flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-olive-300" />
              </div>
              <h3 className="font-sans text-lg text-olive-900 mb-2">{t('cart.empty')}</h3>
              <p className="text-olive-500 text-sm mb-6">{t('cart.emptySubtitle')}</p>
              <Link
                href="/products"
                onClick={closeCart}
                className="btn-primary"
              >
                {t('cart.browseProducts')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product_id} className="flex gap-4 p-3 rounded-xl bg-cream-50/50 border border-olive-100/30">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg bg-olive-100 flex-shrink-0 overflow-hidden relative">
                    <div className="w-full h-full bg-gradient-to-br from-olive-200 to-olive-300 flex items-center justify-center">
                      <span className="text-olive-500 text-[10px] text-center px-1">{item.product.name.slice(0, 20)}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-olive-900 truncate">{item.product.name}</h4>
                    <p className="text-xs text-olive-500 mt-0.5">{item.product.olive_variety} • {item.product.volume_ml}ml</p>
                    <p className="text-sm font-semibold text-olive-800 mt-1">
                      {formatPrice(item.product.price)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-olive-200 flex items-center justify-center hover:bg-olive-50 transition-colors"
                        >
                          <Minus className="w-3 h-3 text-olive-600" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-olive-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-7 h-7 rounded-lg bg-white border border-olive-200 flex items-center justify-center hover:bg-olive-50 transition-colors disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3 text-olive-600" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-olive-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <div className="border-t border-olive-100 px-6 py-4 space-y-3 bg-cream-50/30">
            <div className="flex justify-between text-sm text-olive-600">
              <span>{t('cart.subtotal')}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-olive-600">
              <span>{t('cart.shipping')}</span>
              <span>{shipping === 0 ? <span className="text-olive-600 font-medium">{t('cart.free')}</span> : formatPrice(shipping)}</span>
            </div>
            {subtotal < 75 && (
              <p className="text-xs text-olive-500 bg-olive-50 rounded-lg px-3 py-2">
                🌿 {t('cart.freeShippingProgress', { amount: formatPrice(75 - subtotal) })}
              </p>
            )}
            <div className="flex justify-between text-base font-semibold text-olive-900 pt-2 border-t border-olive-100">
              <span>{t('cart.total')}</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary w-full justify-center py-3.5 text-base"
            >
              {t('cart.checkout')} <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={closeCart}
              className="w-full text-center text-sm text-olive-600 hover:text-olive-800 transition-colors py-1"
            >
              {t('cart.continueShopping')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
