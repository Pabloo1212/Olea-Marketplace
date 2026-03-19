'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/stores/i18nStore';
import { mockProducts } from '@/lib/data/mock-data';
import { formatPrice, generateStars } from '@/lib/utils/helpers';
import { Star, Trophy, Medal, ChevronRight, Award, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';

export default function RankingPage() {
  const { t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);

  // Calculate OliveMarket Index Score for each product
  // OMI Score = (Rating * 15) + (ReviewCount * 0.5)
  const rankedProducts = useMemo(() => {
    const scoredProducts = mockProducts.map(p => ({
      ...p,
      omiScore: (p.avg_rating * 15) + (p.review_count * 0.5)
    }));
    
    // Sort descending by score
    return scoredProducts.sort((a, b) => b.omiScore - a.omiScore).slice(0, 10);
  }, []);

  return (
    <div className="min-h-screen bg-cream-gradient pt-20 pb-20">
      
      {/* Hero Header */}
      <div className="bg-olive-950 text-white pb-24 pt-16 relative overflow-hidden">
        {/* Subtle background blob */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-forest-900/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="section-padding page-padding max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-olive-900/80 border border-olive-800 text-gold-400 text-sm font-medium mb-6">
            <Award className="w-4 h-4" /> <span>OFICIAL 2026</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-forest-400 italic font-light">The</span> {t('ranking.title')}
          </h1>
          <p className="text-olive-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {t('ranking.subtitle')}
          </p>
        </div>
      </div>

      {/* Ranking List */}
      <div className="section-padding page-padding max-w-4xl mx-auto -mt-16 relative z-20">
        <div className="space-y-6">
          {rankedProducts.map((product, index) => {
            const position = index + 1;
            const stars = generateStars(product.avg_rating);
            
            // Determine Medal Colors
            let medalColor = 'text-olive-500 bg-olive-100';
            let MedalIcon = Medal;
            let medalLabel = '';
            
            if (position === 1) {
              medalColor = 'text-gold-500 bg-gold-50 border-gold-200';
              MedalIcon = Trophy;
              medalLabel = t('ranking.medalGold');
            } else if (position === 2) {
              medalColor = 'text-slate-500 bg-slate-50 border-slate-200';
              medalLabel = t('ranking.medalSilver');
            } else if (position === 3) {
              medalColor = 'text-amber-700 bg-amber-50 border-amber-200';
              medalLabel = t('ranking.medalBronze');
            }

            return (
              <div 
                key={product.id} 
                className={`card group overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row items-stretch ${position <= 3 ? 'border-2 border-transparent hover:border-gold-300/50' : ''}`}
              >
                
                {/* Ranking Number / Medal */}
                <div className={`w-full md:w-24 flex md:flex-col items-center justify-between md:justify-center p-4 md:p-6 border-b md:border-b-0 md:border-r border-olive-100/50 ${medalColor}`}>
                  <div className="flex items-center gap-3 md:flex-col">
                    <span className="font-serif text-3xl font-bold opacity-80">#{position}</span>
                    {position <= 3 && (
                      <div className="flex flex-col items-center">
                        <MedalIcon className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{medalLabel}</span>
                      </div>
                    )}
                  </div>
                  <div className="md:hidden text-right">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 block">{t('ranking.omiScore')}</span>
                    <span className="font-mono text-xl font-bold">{product.omiScore.toFixed(1)}</span>
                  </div>
                </div>

                {/* Product Image Area */}
                <div className="w-full md:w-56 h-48 md:h-auto bg-gradient-to-br from-olive-50 to-cream-100 relative flex-shrink-0 flex items-center justify-center p-6">
                  {/* Abstract bottle shape mock */}
                  <div className="w-16 h-28 rounded-xl bg-gradient-to-b from-olive-400 to-olive-600 shadow-xl group-hover:scale-105 transition-transform duration-500" />
                  
                  {/* View Details Overlay */}
                  <Link href={`/products/${product.id}`} className="absolute inset-0 flex items-center justify-center bg-olive-950/0 group-hover:bg-olive-950/10 transition-colors">
                    <span className="opacity-0 group-hover:opacity-100 btn-secondary bg-white text-xs py-1.5 px-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      {t('ranking.viewProduct')}
                    </span>
                  </Link>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                  <div className="flexItems-start justify-between gap-4 mb-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-forest-600 mb-1">
                        {product.origin_country} • {product.olive_variety}
                      </p>
                      <div onClick={() => console.log('Product clicked:', product.id)} className="cursor-pointer">
                        <h2 className="font-serif text-2xl font-bold text-olive-950 group-hover:text-forest-700 transition-colors">
                          {product.name}
                        </h2>
                      </div>
                    </div>
                    
                    <div className="hidden md:block text-right">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-olive-400 block">{t('ranking.omiScore')}</span>
                      <span className="font-mono text-3xl font-bold text-olive-950">{product.omiScore.toFixed(1)}</span>
                    </div>
                  </div>

                  <p className="text-olive-600 mt-2 mb-4 line-clamp-2 md:line-clamp-none text-sm md:text-base">
                    {product.description}
                  </p>

                  <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-olive-100">
                    
                    {/* Rating Stats */}
                    <div className="flex items-center gap-2">
                       <div className="flex">
                        {Array.from({ length: stars.full }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-olive-700">
                        {t('ranking.scoreDetails', { rating: product.avg_rating, reviews: product.review_count })}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="block text-lg font-bold text-olive-950">{formatPrice(product.price)}</span>
                        {product.volume_ml && <span className="text-xs text-olive-400">{product.volume_ml}ml</span>}
                      </div>
                      <button 
                        onClick={() => addItem(product)}
                        className="btn-primary py-2 px-4 shadow-sm"
                      >
                        <ShoppingCart className="w-4 h-4" /> <span className="hidden sm:inline-block ml-2">{t('ranking.buyNow')}</span>
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-olive-500 max-w-2xl mx-auto">
            El <strong>OliveMarket Index (OMI)</strong> se actualiza dinámicamente utilizando un algoritmo que pondera las valoraciones profesionales cruzadas con las reseñas verificadas de nuestra comunidad de amantes del aceite de oliva en todo el mundo.
          </p>
        </div>
      </div>

    </div>
  );
}
