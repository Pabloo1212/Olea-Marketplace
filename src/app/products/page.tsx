'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { mockProducts } from '@/lib/data/mock-data';
import { useCartStore } from '@/stores/cartStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useTranslation } from '@/stores/i18nStore';
import { formatPrice, generateStars } from '@/lib/utils/helpers';
import {
  Search, SlidersHorizontal, Grid3X3, List, Star, Leaf, ShoppingCart,
  MapPin, Heart, ChevronDown, X, ArrowUpDown,
} from 'lucide-react';

const VARIETIES = ['Picual', 'Hojiblanca', 'Frantoio', 'Leccino', 'Koroneiki', 'Galega', 'Cobrançosa'];
const COUNTRIES = ['España', 'Italia', 'Greece', 'Portugal'];
const INTENSITIES = ['mild', 'medium', 'intense'];

export default function ProductsPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVarieties, setSelectedVarieties] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedIntensities, setSelectedIntensities] = useState<string[]>([]);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const addItem = useCartStore((s) => s.addItem);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);

  const filteredProducts = useMemo(() => {
    let products = [...mockProducts];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.olive_variety.toLowerCase().includes(q) ||
        p.origin_country.toLowerCase().includes(q)
      );
    }
    if (selectedVarieties.length > 0) {
      products = products.filter(p => selectedVarieties.some(v => p.olive_variety.toLowerCase().includes(v.toLowerCase())));
    }
    if (selectedCountries.length > 0) {
      products = products.filter(p => selectedCountries.includes(p.origin_country));
    }
    if (selectedIntensities.length > 0) {
      products = products.filter(p => selectedIntensities.includes(p.intensity));
    }
    if (organicOnly) {
      products = products.filter(p => p.organic);
    }
    products = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price_asc': products.sort((a, b) => a.price - b.price); break;
      case 'price_desc': products.sort((a, b) => b.price - a.price); break;
      case 'rating': products.sort((a, b) => b.avg_rating - a.avg_rating); break;
      case 'newest': products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      case 'name': products.sort((a, b) => a.name.localeCompare(b.name)); break;
    }

    return products;
  }, [searchQuery, selectedVarieties, selectedCountries, selectedIntensities, organicOnly, sortBy, priceRange]);

  const toggleFilter = (arr: string[], val: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const activeFilterCount = selectedVarieties.length + selectedCountries.length + selectedIntensities.length + (organicOnly ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedVarieties([]);
    setSelectedCountries([]);
    setSelectedIntensities([]);
    setOrganicOnly(false);
    setPriceRange([0, 100]);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-cream-gradient">
      {/* Hero Banner */}
      <div className="bg-olive-900 text-white">
        <div className="section-padding py-10 sm:py-14">
          <h1 className="font-sans text-3xl sm:text-4xl font-bold mb-3 tracking-tight">{t('products.title')}</h1>
          <p className="text-olive-300 max-w-xl">
            {t('products.subtitle')}
          </p>
        </div>
      </div>

      <div className="section-padding py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('products.searchPlaceholder')}
              className="input-field pl-10 py-2.5 text-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                showFilters ? 'bg-olive-700 text-white border-olive-700' : 'bg-white text-olive-700 border-olive-200 hover:border-olive-300'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t('products.filters')}
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-olive-500 text-white text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-olive-200 bg-white text-sm font-medium text-olive-700 focus:outline-none focus:ring-2 focus:ring-olive-500/30 cursor-pointer"
              >
                <option value="rating">{t('products.topRated')}</option>
                <option value="newest">{t('products.newest')}</option>
                <option value="price_asc">{t('products.priceLow')}</option>
                <option value="price_desc">{t('products.priceHigh')}</option>
                <option value="name">{t('products.nameAZ')}</option>
              </select>
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400 pointer-events-none" />
            </div>

            {/* View mode */}
            <div className="hidden sm:flex items-center bg-white rounded-xl border border-olive-200 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-olive-100 text-olive-700' : 'text-olive-400'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-olive-100 text-olive-700' : 'text-olive-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-olive-500 font-medium">{t('products.activeFilters')}</span>
            {selectedVarieties.map(v => (
              <span key={v} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-olive-100 text-olive-700 text-xs font-medium">
                {v}
                <button onClick={() => toggleFilter(selectedVarieties, v, setSelectedVarieties)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedCountries.map(c => (
              <span key={c} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-olive-100 text-olive-700 text-xs font-medium">
                {c}
                <button onClick={() => toggleFilter(selectedCountries, c, setSelectedCountries)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedIntensities.map(i => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-olive-100 text-olive-700 text-xs font-medium capitalize">
                {i}
                <button onClick={() => toggleFilter(selectedIntensities, i, setSelectedIntensities)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {organicOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-olive-100 text-olive-700 text-xs font-medium">
                {t('products.organic')} <button onClick={() => setOrganicOnly(false)}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button onClick={clearAllFilters} className="text-xs text-olive-500 hover:text-olive-700 underline ml-2">
              {t('products.clearAll')}
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Filter Sidebar */}
          {showFilters && (
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="card p-5 sticky top-32 space-y-6">
                {/* Variety */}
                <div>
                  <h4 className="text-sm font-semibold text-olive-900 mb-3">{t('products.variety')}</h4>
                  <div className="space-y-2">
                    {VARIETIES.map(v => (
                      <label key={v} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedVarieties.includes(v)}
                          onChange={() => toggleFilter(selectedVarieties, v, setSelectedVarieties)}
                          className="w-4 h-4 rounded border-olive-300 text-olive-600 focus:ring-olive-500"
                        />
                        <span className="text-sm text-olive-700">{v}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <h4 className="text-sm font-semibold text-olive-900 mb-3">{t('products.country')}</h4>
                  <div className="space-y-2">
                    {COUNTRIES.map(c => (
                      <label key={c} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCountries.includes(c)}
                          onChange={() => toggleFilter(selectedCountries, c, setSelectedCountries)}
                          className="w-4 h-4 rounded border-olive-300 text-olive-600 focus:ring-olive-500"
                        />
                        <span className="text-sm text-olive-700">{c}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Intensity */}
                <div>
                  <h4 className="text-sm font-semibold text-olive-900 mb-3">{t('products.intensity')}</h4>
                  <div className="space-y-2">
                    {INTENSITIES.map(i => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedIntensities.includes(i)}
                          onChange={() => toggleFilter(selectedIntensities, i, setSelectedIntensities)}
                          className="w-4 h-4 rounded border-olive-300 text-olive-600 focus:ring-olive-500"
                        />
                        <span className="text-sm text-olive-700 capitalize">{i}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Organic */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={organicOnly}
                      onChange={() => setOrganicOnly(!organicOnly)}
                      className="w-4 h-4 rounded border-olive-300 text-olive-600 focus:ring-olive-500"
                    />
                    <span className="text-sm font-semibold text-olive-900 flex items-center gap-1.5">
                      <Leaf className="w-4 h-4 text-olive-600" /> {t('products.organic')}
                    </span>
                  </label>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-semibold text-olive-900 mb-3">{t('products.priceRange')}</h4>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="input-field py-2 text-sm w-20"
                      min={0}
                    />
                    <span className="text-olive-400">—</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="input-field py-2 text-sm w-20"
                      min={0}
                    />
                  </div>
                </div>

                <button onClick={clearAllFilters} className="btn-secondary w-full py-2 text-sm">
                  {t('products.clearAll')}
                </button>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            <p className="text-sm text-olive-500 mb-4">{filteredProducts.length} {t('products.found')}</p>

            {filteredProducts.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-olive-50 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-olive-300" />
                </div>
                 <h3 className="font-sans text-lg font-semibold text-olive-900 mb-2">{t('products.noResults')}</h3>
                <p className="text-olive-500 text-sm mb-4">{t('products.adjustFilters')}</p>
                <button onClick={clearAllFilters} className="btn-secondary">
                  {t('products.clearAll')}
                </button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredProducts.map((product) => {
                  const stars = generateStars(product.avg_rating);
                  const faved = isFavorite(product.id);

                  if (viewMode === 'list') {
                    return (
                      <div key={product.id} className="card flex gap-5 p-4">
                        <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-olive-100 to-olive-200 flex-shrink-0 flex items-center justify-center">
                          <div className="w-10 h-16 rounded bg-gradient-to-b from-olive-300 to-olive-400 shadow" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <MapPin className="w-3 h-3 text-olive-400" />
                            <span className="text-xs text-olive-500">{product.origin_country} • {product.olive_variety}</span>
                            {product.organic && <span className="badge-organic text-[10px] py-0.5"><Leaf className="w-2.5 h-2.5" /> {t('products.organic')}</span>}
                          </div>
                          <Link href={`/products/${product.slug}`}>
                            <h3 className="font-sans text-base font-semibold text-olive-900 hover:text-cream-600 transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-olive-600 mt-1 line-clamp-1">{product.short_description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: stars.full }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                              ))}
                              <span className="text-xs text-olive-500 ml-1">({product.review_count})</span>
                            </div>
                            <span className="text-lg font-bold text-olive-900">{formatPrice(product.price)}</span>
                            {product.compare_at_price && (
                              <span className="text-sm text-olive-400 line-through">{formatPrice(product.compare_at_price)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col justify-center gap-2">
                          <button onClick={() => addItem(product)} className="btn-primary py-2 px-4 text-sm">
                            <ShoppingCart className="w-4 h-4" /> {t('products.add')}
                          </button>
                          <button 
                            onClick={() => toggleFavorite(product)} 
                            className="p-2 rounded-xl hover:bg-olive-50 transition-colors flex items-center justify-center"
                          >
                            <Heart className={`w-4 h-4 ${faved ? 'fill-olive-600 text-olive-600' : 'text-olive-400'}`} />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // Grid view card
                  return (
                    <div key={product.id} className="card group overflow-hidden">
                      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-olive-100 to-olive-200">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-14 h-20 mx-auto mb-1 rounded-lg bg-gradient-to-b from-olive-300 to-olive-400 shadow-lg" />
                            <span className="text-olive-600 text-[10px]">{product.volume_ml}ml</span>
                          </div>
                        </div>
                        {product.organic && (
                          <span className="absolute top-3 left-3 badge-organic">
                            <Leaf className="w-3 h-3" /> {t('productCard.organic')}
                          </span>
                        )}
                        {product.compare_at_price && (
                          <span className="absolute top-3 right-12 badge bg-red-100 text-red-700">{t('productCard.sale')}</span>
                        )}
                        {/* Heart */}
                        <button 
                          onClick={() => toggleFavorite(product)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
                        >
                          <Heart className={`w-4 h-4 ${faved ? 'fill-olive-600 text-olive-600' : 'text-olive-400'}`} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                          <button onClick={() => addItem(product)} className="w-full btn-primary py-2 text-sm">
                            <ShoppingCart className="w-4 h-4" /> {t('products.addToCart')}
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MapPin className="w-3 h-3 text-olive-400" />
                          <span className="text-xs text-olive-500">{product.origin_country} • {product.olive_variety}</span>
                        </div>
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="font-sans text-sm font-semibold text-olive-900 group-hover:text-cream-600 transition-colors line-clamp-2 mb-2">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: stars.full }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                          ))}
                          <span className="text-xs text-olive-500 ml-1">({product.review_count})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-olive-900">{formatPrice(product.price)}</span>
                          {product.compare_at_price && (
                            <span className="text-sm text-olive-400 line-through">{formatPrice(product.compare_at_price)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
