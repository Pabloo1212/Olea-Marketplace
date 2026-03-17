'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { useTranslation } from '@/stores/i18nStore';
import { formatPrice } from '@/lib/utils/helpers';
import {
  Minus, Plus, Trash2, ShoppingCart, ArrowRight,
  ArrowLeft, ShieldCheck, Truck, CreditCard,
} from 'lucide-react';

export default function CartPage() {
  const { t } = useTranslation();
  const { items, removeItem, updateQuantity, clearCart, getSubtotal, getTotal } = useCartStore();
  const subtotal = getSubtotal();
  const total = getTotal();
  const shipping = subtotal > 75 ? 0 : subtotal > 0 ? 8.50 : 0;
  const freeShippingRemaining = Math.max(0, 75 - subtotal);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-gradient">
        <div className="section-padding page-padding text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 rounded-full bg-olive-50 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-olive-300" />
            </div>
            <h1 className="font-sans text-3xl font-bold text-olive-900 mb-3">{t('cart.empty')}</h1>
            <p className="text-olive-600 mb-8">
              {t('cart.emptySubtitle')}
            </p>
            <Link href="/products" className="btn-primary px-8 py-3.5">
              <ArrowLeft className="w-4 h-4" /> {t('cart.continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-gradient">
      <div className="section-padding page-padding">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-sans text-3xl sm:text-4xl font-bold text-olive-900">{t('cart.title')}</h1>
          <button onClick={clearCart} className="text-sm text-olive-500 hover:text-red-600 transition-colors flex items-center gap-1.5">
            <Trash2 className="w-4 h-4" /> {t('cart.remove')}
          </button>
        </div>

        {/* Free shipping bar */}
        {subtotal < 75 && (
          <div className="card p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-olive-600 flex items-center gap-2">
                <Truck className="w-4 h-4 text-olive-500" />
                {freeShippingRemaining > 0
                  ? t('cart.freeShippingProgress', { amount: formatPrice(freeShippingRemaining) })
                  : t('cart.freeShippingUnlocked')
                }
              </span>
              <span className="text-xs text-olive-500 font-medium">€75</span>
            </div>
            <div className="h-2 bg-olive-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-olive-400 to-olive-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (subtotal / 75) * 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product_id} className="card p-4 sm:p-5 flex gap-4 sm:gap-6">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-olive-100 to-olive-200 flex-shrink-0 flex items-center justify-center">
                  <div className="w-10 h-16 rounded-lg bg-gradient-to-b from-olive-300 to-olive-400 shadow" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link href={`/products/${item.product.slug}`}>
                        <h3 className="font-sans text-base font-semibold text-olive-900 hover:text-olive-700 transition-colors line-clamp-2">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-olive-500 mt-1">
                        {item.product.olive_variety} • {item.product.volume_ml}ml
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-olive-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3 sm:mt-4">
                    <div className="flex items-center bg-olive-50 rounded-xl border border-olive-200">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="p-2 text-olive-600 hover:text-olive-900 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-olive-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="p-2 text-olive-600 hover:text-olive-900 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold text-olive-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card-premium p-6 sticky top-32">
              <h3 className="font-sans text-lg font-bold text-olive-900 mb-5">{t('cart.orderSummary')}</h3>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-olive-600">{t('cart.subtotal')}</span>
                  <span className="font-medium text-olive-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-olive-600">{t('cart.shipping')}</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-olive-600' : 'text-olive-900'}`}>
                    {shipping === 0 ? t('cart.free') : formatPrice(shipping)}
                  </span>
                </div>
                <div className="border-t border-olive-200 pt-3 flex justify-between">
                  <span className="font-semibold text-olive-900">{t('cart.total')}</span>
                  <span className="text-xl font-bold text-olive-900">{formatPrice(subtotal + shipping)}</span>
                </div>
              </div>

              <Link href="/checkout" className="btn-gold w-full py-3.5 text-base mb-4">
                {t('cart.checkout')} <ArrowRight className="w-5 h-5" />
              </Link>

              <Link href="/products" className="btn-secondary w-full py-2.5 text-sm">
                {t('cart.continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
