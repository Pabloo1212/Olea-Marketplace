'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/stores/i18nStore';
import { mockProducts } from '@/lib/data/mock-data';
import { Product } from '@/lib/types/database';
import { formatPrice, generateStars } from '@/lib/utils/helpers';
import { useCartStore } from '@/stores/cartStore';
import { Search, X, Plus, ShoppingCart, Star, Beaker, Hexagon, ThumbsUp, Medal } from 'lucide-react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';

// Mocking sensory data since it's not in the base mock-data yet
// A real app would have this in the Product model (e.g. product.sensory_profile)
const getSensoryData = (productId: string, t: any) => {
  // Generate consistent pseudo-random data based on the ID string
  const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return [
    { subject: t('compare.fruitiness'), A: (hash % 5) + 6 },  // 6-10
    { subject: t('compare.pungency'), A: (hash % 6) + 4 },    // 4-9
    { subject: t('compare.bitterness'), A: (hash % 7) + 3 },  // 3-9
    { subject: t('compare.complexity'), A: (hash % 4) + 6 },  // 6-9
    { subject: t('compare.sweetness'), A: (hash % 5) + 4 },   // 4-8
  ];
};

const CHART_COLORS = ['#5d7b35', '#d4af37', '#334155'];

export default function ComparePage() {
  const { t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<{ open: boolean; slot: number }>({ open: false, slot: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  const addProduct = (product: Product, slot: number) => {
    const newSelected = [...selectedProducts];
    if (newSelected.length < 3 && !newSelected.find(p => p.id === product.id)) {
      newSelected.push(product);
      setSelectedProducts(newSelected);
      setIsSearchOpen({ open: false, slot: 0 });
      setSearchQuery('');
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const filteredProducts = mockProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.olive_variety.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(p => !selectedProducts.find(selected => selected.id === p.id));

  // Combine data for the Recharts Radar Chart
  const combinedChartData = () => {
    if (selectedProducts.length === 0) return [];
    
    // Base subjects
    const data = [
      { subject: t('compare.fruitiness') },
      { subject: t('compare.pungency') },
      { subject: t('compare.bitterness') },
      { subject: t('compare.complexity') },
      { subject: t('compare.sweetness') },
    ];

    // Merge each product's sensory data
    selectedProducts.forEach((product, index) => {
      const sensory = getSensoryData(product.id, t);
      sensory.forEach((stat, i) => {
        data[i][`product${index}`] = stat.A;
      });
    });

    return data;
  };

  return (
    <div className="min-h-screen bg-cream-gradient pt-20 pb-20">
      
      {/* Header */}
      <div className="bg-olive-950 text-white py-16 mb-8 text-center px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-forest-900/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-olive-900/80 border border-olive-800 text-gold-400 text-sm font-medium mb-6">
            <Beaker className="w-4 h-4" /> <span>LABORATORIO SENSORIAL</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {t('compare.title')}
          </h1>
          <p className="text-olive-300 text-lg">
            {t('compare.subtitle')}
          </p>
        </div>
      </div>

      <div className="section-padding page-padding max-w-7xl mx-auto">
        
        {/* Mobile Warning */}
        <div className="lg:hidden bg-olive-50 p-4 rounded-xl border border-olive-100 text-olive-700 text-sm mb-6 flex items-start gap-3">
          <Hexagon className="w-5 h-5 flex-shrink-0 text-olive-500 mt-0.5" />
          <p>Para una mejor experiencia comparando gráficos radares, te recomendamos usar un ordenador o tablet en formato horizontal.</p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Chart Area (Spans 1 column on wide screens, acts as a sticky legend) */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-xl shadow-olive-900/5 border border-olive-100 flex flex-col items-center justify-center lg:sticky lg:top-32 h-fit">
            <h3 className="font-serif text-xl font-bold text-olive-900 mb-6 flex items-center gap-2">
              <Hexagon className="w-5 h-5 text-forest-600" />
              {t('compare.sensoryProfile')}
            </h3>

            {selectedProducts.length > 0 ? (
              <div className="w-full h-64 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={combinedChartData()}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 10, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                    <Tooltip 
                      wrapperClassName="text-xs focus:outline-none" 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    {selectedProducts.map((_, index) => (
                      <Radar
                        key={index}
                        name={selectedProducts[index].name.substring(0, 15) + '...'}
                        dataKey={`product${index}`}
                        stroke={CHART_COLORS[index]}
                        fill={CHART_COLORS[index]}
                        fillOpacity={0.3}
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="w-full h-64 flex flex-col items-center justify-center text-center px-4 bg-olive-50/50 rounded-2xl border border-dashed border-olive-200">
                <Beaker className="w-8 h-8 text-olive-300 mb-3" />
                <p className="text-sm text-olive-500">Añade al menos un aceite para ver su perfil sensorial</p>
              </div>
            )}

            {/* Legend */}
            {selectedProducts.length > 0 && (
              <div className="mt-6 w-full space-y-3">
                {selectedProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3 text-sm font-medium">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index] }} />
                    <span className="text-olive-700 truncate">{product.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Cards Area */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Render selected products + empty slots */}
            {[0, 1, 2].map((slotIndex) => {
              const product = selectedProducts[slotIndex];
              
              if (product) {
                 const stars = generateStars(product.avg_rating);
                 return (
                  <div key={product.id} className="bg-white rounded-3xl p-6 shadow-xl shadow-olive-900/5 border border-olive-100 flex flex-col relative group">
                    <button 
                      onClick={() => removeProduct(product.id)}
                      className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-colors z-10"
                      aria-label={t('compare.removeBtn')}
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="h-40 bg-gradient-to-br from-olive-100 to-cream-100 rounded-2xl flex items-center justify-center mb-6">
                       <div className="w-12 h-24 rounded-lg bg-gradient-to-b from-olive-400 to-olive-600 shadow-xl" />
                    </div>

                    <div className="flex-1 border-b border-olive-100 pb-4 mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-olive-400 mb-1 block">
                        <span style={{ color: CHART_COLORS[slotIndex] }}>●</span> {product.olive_variety}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-olive-950 mb-2 leading-tight">
                        {product.name}
                      </h3>
                      <p className="text-xs text-olive-500">{product.origin_country} • {product.origin_region}</p>
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-olive-500">{t('compare.price')}</span>
                        <span className="font-bold text-olive-900">{formatPrice(product.price)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                         <span className="text-olive-500">Rating</span>
                         <span className="font-medium text-olive-900 flex items-center gap-1">
                           {product.avg_rating} <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
                         </span>
                      </div>
                       <div className="flex justify-between text-sm">
                        <span className="text-olive-500">Intensidad</span>
                        <span className="font-medium text-olive-900 capitalize">{product.intensity}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => addItem(product)}
                      className="w-full btn-primary py-2.5 text-sm"
                    >
                      <ShoppingCart className="w-4 h-4" /> {t('compare.buyBtn')}
                    </button>
                  </div>
                );
              }

              // Empty Slot / Selector
              return (
                <div key={`empty-${slotIndex}`} className="bg-olive-50/50 rounded-3xl p-6 border-2 border-dashed border-olive-200 flex flex-col items-center justify-center min-h-[400px]">
                  
                  {isSearchOpen.open && isSearchOpen.slot === slotIndex ? (
                    <div className="w-full h-full flex flex-col bg-white rounded-2xl p-4 shadow-lg animate-fade-in border border-olive-100">
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
                        <input
                          type="text"
                          autoFocus
                          placeholder={t('compare.selectPlaceholder')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-olive-200 bg-olive-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                        />
                        <button 
                          onClick={() => setIsSearchOpen({ open: false, slot: 0 })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-olive-400 hover:text-olive-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-1">
                        {filteredProducts.length === 0 ? (
                          <div className="text-center py-8 text-sm text-olive-500">No hay resultados</div>
                        ) : (
                          filteredProducts.map(p => (
                            <button
                              key={p.id}
                              onClick={() => addProduct(p, slotIndex)}
                              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-olive-50 text-left transition-colors border border-transparent hover:border-olive-100 group"
                            >
                              <div className="flex-1 min-w-0 pr-3">
                                <p className="text-sm font-semibold text-olive-900 truncate">{p.name}</p>
                                <p className="text-xs text-olive-500 truncate">{p.olive_variety}</p>
                              </div>
                              <Plus className="w-4 h-4 text-olive-300 group-hover:text-forest-600 flex-shrink-0" />
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-olive-100 flex items-center justify-center mx-auto mb-4 border border-olive-200 border-dashed">
                        <Plus className="w-6 h-6 text-olive-400" />
                      </div>
                      <h4 className="font-semibold text-olive-700 mb-2">{t('compare.emptySlot')}</h4>
                      <p className="text-sm text-olive-500 mb-6 px-4">Añade otro aceite para comparar su perfil y precio.</p>
                      <button 
                        onClick={() => setIsSearchOpen({ open: true, slot: slotIndex })}
                        className="btn-secondary py-2 text-sm"
                      >
                        {t('compare.addBtn')}
                      </button>
                    </div>
                  )}
                  
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
