'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useToast } from '@/components/ui/toast';
import { useTranslation } from '@/stores/i18nStore';
import { dataManager } from '@/lib/data/manager';
import { Product } from '@/lib/validation/schemas';
import { formatPrice } from '@/lib/utils/helpers';
import ProductCard from '@/components/products/ProductCard';
import {
  Search, Filter, SlidersHorizontal, Leaf, Star,
  ChevronDown, Loader2, Package,
} from 'lucide-react';

export default function OliveOilsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const addItem = useCartStore((s) => s.addItem);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVariety, setSelectedVariety] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedVolume, setSelectedVolume] = useState('');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const allProducts = await dataManager.getProducts();
      // Only show published products
      const publishedProducts = allProducts.filter(p => p.is_published);
      setProducts(publishedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = products.filter(product => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.olive_variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.origin_country.toLowerCase().includes(searchQuery.toLowerCase());

      // Variety filter
      const matchesVariety = selectedVariety === '' || product.olive_variety === selectedVariety;

      // Country filter
      const matchesCountry = selectedCountry === '' || product.origin_country === selectedCountry;

      // Volume filter
      const matchesVolume = selectedVolume === '' || product.volume_ml.toString() === selectedVolume;

      // Organic filter
      const matchesOrganic = !organicOnly || product.organic;

      return matchesSearch && matchesVariety && matchesCountry && matchesVolume && matchesOrganic;
    });

    // Sort products
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'rating':
          return (b.avg_rating || 0) - (a.avg_rating || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [products, searchQuery, selectedVariety, selectedCountry, selectedVolume, organicOnly, sortBy]);

  // Get unique values for filters
  const varieties = React.useMemo(() => {
    const unique = [...new Set(products.map(p => p.olive_variety))];
    return unique.sort();
  }, [products]);

  const countries = React.useMemo(() => {
    const unique = [...new Set(products.map(p => p.origin_country))];
    return unique.sort();
  }, [products]);

  const volumes = React.useMemo(() => {
    const unique = [...new Set(products.map(p => p.volume_ml))];
    return unique.sort((a, b) => a - b);
  }, [products]);

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    try {
      addItem(product, quantity);
      showToast(`Added ${product.name} to cart`, 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add to cart', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-olive-600" />
        <span className="ml-2 text-olive-600">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-white border-b border-olive-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-olive-900 mb-4">Premium Olive Oils</h1>
            <p className="text-xl text-olive-700 max-w-3xl mx-auto">
              Discover exceptional extra virgin olive oils from artisan producers across the Mediterranean
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-olive-400" />
                <input
                  type="text"
                  placeholder="Search for olive oils, varieties, origins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-olive-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field min-w-[200px]"
            >
              <option value="created_at">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-6 bg-white rounded-lg border border-olive-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Variety Filter */}
                <div>
                  <label className="block text-sm font-medium text-olive-700 mb-2">
                    Olive Variety
                  </label>
                  <select
                    value={selectedVariety}
                    onChange={(e) => setSelectedVariety(e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Varieties</option>
                    {varieties.map(variety => (
                      <option key={variety} value={variety}>{variety}</option>
                    ))}
                  </select>
                </div>

                {/* Country Filter */}
                <div>
                  <label className="block text-sm font-medium text-olive-700 mb-2">
                    Origin Country
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Countries</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                {/* Volume Filter */}
                <div>
                  <label className="block text-sm font-medium text-olive-700 mb-2">
                    Bottle Size
                  </label>
                  <select
                    value={selectedVolume}
                    onChange={(e) => setSelectedVolume(e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Sizes</option>
                    {volumes.map(volume => (
                      <option key={volume} value={volume.toString()}>{volume}ml</option>
                    ))}
                  </select>
                </div>

                {/* Organic Filter */}
                <div>
                  <label className="block text-sm font-medium text-olive-700 mb-2">
                    Additional Filters
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={organicOnly}
                      onChange={(e) => setOrganicOnly(e.target.checked)}
                      className="rounded border-olive-300 text-olive-600 focus:ring-olive-500"
                    />
                    <span className="text-olive-700">Organic Only</span>
                  </label>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-olive-600">
                  {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? 's' : ''} found
                </span>
                <button
                  onClick={() => {
                    setSelectedVariety('');
                    setSelectedCountry('');
                    setSelectedVolume('');
                    setOrganicOnly(false);
                    setSearchQuery('');
                  }}
                  className="text-sm text-olive-600 hover:text-olive-700"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {error ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-olive-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-olive-900 mb-2">Unable to Load Products</h3>
            <p className="text-olive-600 mb-4">{error}</p>
            <button onClick={fetchProducts} className="btn-primary">
              Try Again
            </button>
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-olive-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-olive-900 mb-2">
              {searchQuery || selectedVariety || selectedCountry || selectedVolume || organicOnly
                ? 'No products found'
                : 'No products available'
              }
            </h3>
            <p className="text-olive-600 mb-4">
              {searchQuery || selectedVariety || selectedCountry || selectedVolume || organicOnly
                ? 'Try adjusting your filters or search terms'
                : 'Check back soon for new olive oil products'
              }
            </p>
            {(searchQuery || selectedVariety || selectedCountry || selectedVolume || organicOnly) && (
              <button
                onClick={() => {
                  setSelectedVariety('');
                  setSelectedCountry('');
                  setSelectedVolume('');
                  setOrganicOnly(false);
                  setSearchQuery('');
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
