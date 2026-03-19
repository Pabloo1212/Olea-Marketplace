'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useCartStore } from '@/stores/cartStore';
import { useTranslation } from '@/stores/i18nStore';
import { formatPrice, generateStars } from '@/lib/utils/helpers';
import { Heart, ShoppingCart, MapPin, Star, Leaf, ArrowRight, Trash2 } from 'lucide-react';

export default function FavoritesPage() {
  const { t } = useTranslation();
  const { items: favorites, removeFavorite } = useFavoritesStore();
  const addItem = useCartStore((s) => s.addItem);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-cream-gradient pt-24 pb-16">
      <div className="section-padding page-padding max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-olive-900 mb-2">{t('favorites.title')}</h1>
            <p className="text-olive-600">{t('favorites.count', { count: favorites.length })}</p>
          </div>
          <Link href="/products" className="hidden sm:inline-flex btn-secondary py-2 px-4 text-sm">
            {t('favorites.exploreMore')}
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="card p-12 text-center bg-white">
            <div className="w-20 h-20 rounded-full bg-olive-50 mx-auto flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-olive-300" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-olive-900 mb-3">{t('favorites.emptyTitle')}</h2>
            <p className="text-olive-600 mb-8 max-w-md mx-auto">
              {t('favorites.emptyText')}
            </p>
            <Link href="/products" className="btn-primary inline-flex">
              {t('favorites.emptyBtn')} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product) => {
              const stars = generateStars(product.avg_rating);
              return (
                <div key={product.id} className="card group overflow-hidden bg-white hover:shadow-xl transition-all duration-300">
                  <div className="relative h-60 overflow-hidden bg-cream-100 flex items-center justify-center">
                    <div className="w-16 h-28 rounded-lg bg-gradient-to-b from-olive-300 to-olive-400 shadow-lg" />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.organic && (
                        <span className="badge-organic">
                          <Leaf className="w-3 h-3" /> {t('productCard.organic')}
                        </span>
                      )}
                    </div>

                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        removeFavorite(product.id);
                      }}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors z-10 text-olive-400"
                      aria-label={t('favorites.removeBtn')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    {/* Add to cart overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addItem(product);
                        }}
                        className="w-full btn-primary py-2 text-sm"
                      >
                        <ShoppingCart className="w-4 h-4" /> {t('favorites.addBtn')} 
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MapPin className="w-3 h-3 text-olive-400" />
                      <span className="text-xs text-olive-500">{product.origin_country} · {product.olive_variety}</span>
                    </div>

                    <div onClick={() => console.log('Product clicked:', product.id)} className="cursor-pointer">
                      <h3 className="font-serif text-base font-semibold text-olive-900 hover:text-forest-700 transition-colors line-clamp-2 mb-2">
                        {product.name}
                      </h3>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex items-center">
                        {Array.from({ length: stars.full }).map((_, i) => (
                          <Star key={`f${i}`} className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                        ))}
                      </div>
                      <span className="text-xs text-olive-400">({product.review_count})</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-olive-900">{formatPrice(product.price)}</span>
                        {product.compare_at_price && (
                          <span className="text-sm text-olive-400 line-through">{formatPrice(product.compare_at_price)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
