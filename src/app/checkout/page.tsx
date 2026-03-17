'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { useTranslation } from '@/stores/i18nStore';
import { formatPrice } from '@/lib/utils/helpers';
import {
  CreditCard, Lock, MapPin, ArrowLeft, ShieldCheck, Check,
} from 'lucide-react';

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { items, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = subtotal > 75 ? 0 : 8.50;
  const tax = Math.round(subtotal * 0.21 * 100) / 100;
  const total = subtotal + shipping + tax;

  const [formData, setFormData] = useState({
    email: '', firstName: '', lastName: '',
    address: '', city: '', postalCode: '', country: '',
    cardName: '', cardNumber: '', expiry: '', cvc: '',
  });

  const updateField = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  if (items.length === 0) {
    return (
      <div className="section-padding page-padding text-center">
        <h1 className="font-sans text-3xl font-bold text-olive-900 mb-4">{t('cart.empty')}</h1>
        <Link href="/products" className="btn-primary">
          <ArrowLeft className="w-4 h-4" /> {t('cart.browseProducts')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-gradient">
      <div className="section-padding py-8 sm:py-12">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-olive-500 hover:text-olive-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t('checkout.backToCart')}
        </Link>

        <h1 className="font-sans text-3xl sm:text-4xl font-bold text-olive-900 mb-8">{t('checkout.title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <div className="card p-6">
              <h2 className="font-sans text-lg font-bold text-olive-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-olive-700 text-white text-xs flex items-center justify-center">1</span>
                {t('checkout.contactInfo')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-olive-800 mb-1">{t('checkout.email')}</label>
                  <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)}
                    placeholder="you@example.com" className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1">{t('checkout.firstName')}</label>
                  <input type="text" value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)}
                    className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1">{t('checkout.lastName')}</label>
                  <input type="text" value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)}
                    className="input-field" required />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="card p-6">
              <h2 className="font-sans text-lg font-bold text-olive-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-olive-700 text-white text-xs flex items-center justify-center">2</span>
                <MapPin className="w-4 h-4" /> {t('checkout.shippingAddress')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-olive-800 mb-1">{t('checkout.address')}</label>
                  <input type="text" value={formData.address} onChange={(e) => updateField('address', e.target.value)}
                    className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1">{t('checkout.city')}</label>
                  <input type="text" value={formData.city} onChange={(e) => updateField('city', e.target.value)}
                    className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1">{t('checkout.postalCode')}</label>
                  <input type="text" value={formData.postalCode} onChange={(e) => updateField('postalCode', e.target.value)}
                    className="input-field" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-olive-800 mb-1">{t('checkout.country')}</label>
                  <select value={formData.country} onChange={(e) => updateField('country', e.target.value)} className="input-field" required>
                    <option value="">{t('checkout.selectCountry')}</option>
                    <option value="ES">España</option><option value="IT">Italia</option>
                    <option value="GR">Greece</option><option value="PT">Portugal</option>
                    <option value="FR">France</option><option value="DE">Germany</option>
                    <option value="GB">United Kingdom</option><option value="US">United States</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="card p-6">
              <h2 className="font-sans text-lg font-bold text-olive-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-olive-700 text-white text-xs flex items-center justify-center">3</span>
                <CreditCard className="w-4 h-4" /> {t('checkout.payment')}
              </h2>
              <div className="bg-olive-50 rounded-xl p-4 mb-4 flex items-center gap-3">
                <Lock className="w-4 h-4 text-olive-500" />
                <span className="text-sm text-olive-600">{t('checkout.securePayment')}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-olive-800 mb-1">{t('checkout.cardName')}</label>
                  <input type="text" value={formData.cardName} onChange={(e) => updateField('cardName', e.target.value)}
                    className="input-field" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-olive-800 mb-1">{t('checkout.cardNumber')}</label>
                  <input type="text" value={formData.cardNumber} onChange={(e) => updateField('cardNumber', e.target.value)}
                    placeholder="4242 4242 4242 4242" className="input-field" maxLength={19} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1">{t('checkout.expiry')}</label>
                  <input type="text" value={formData.expiry} onChange={(e) => updateField('expiry', e.target.value)}
                    placeholder="MM/YY" className="input-field" maxLength={5} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1">{t('checkout.cvc')}</label>
                  <input type="text" value={formData.cvc} onChange={(e) => updateField('cvc', e.target.value)}
                    placeholder="123" className="input-field" maxLength={4} required />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card-premium p-6 sticky top-32">
              <h3 className="font-sans text-lg font-bold text-olive-900 mb-5">{t('cart.orderSummary')}</h3>

              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={item.product_id} className="flex justify-between text-sm gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-olive-800 font-medium line-clamp-1">{item.product.name}</span>
                      <span className="text-olive-500"> × {item.quantity}</span>
                    </div>
                    <span className="font-medium text-olive-900 flex-shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-olive-200 pt-4 space-y-2 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-olive-600">{t('cart.subtotal')}</span>
                  <span className="text-olive-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-olive-600">{t('cart.shipping')}</span>
                  <span className={shipping === 0 ? 'text-olive-600' : 'text-olive-900'}>
                    {shipping === 0 ? t('cart.free') : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-olive-600">{t('checkout.tax')} (21%)</span>
                  <span className="text-olive-900">{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-olive-200 pt-3 flex justify-between">
                  <span className="font-semibold text-olive-900">{t('cart.total')}</span>
                  <span className="text-xl font-bold text-olive-900">{formatPrice(total)}</span>
                </div>
              </div>

              <button className="btn-gold w-full py-3.5 text-base mb-3">
                <Lock className="w-4 h-4" /> {t('checkout.placeOrder')}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-olive-500">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('checkout.poweredByStripe')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
