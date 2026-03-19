'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useToast } from '@/components/ui/toast';
import { useTranslation } from '@/stores/i18nStore';
import { dataManager } from '@/lib/data/manager';
import { Product } from '@/lib/validation/schemas';
import { formatPrice, generateStars } from '@/lib/utils/helpers';
import {
  ArrowLeft, Heart, ShoppingCart, Star, Leaf, MapPin,
  Package, AlertCircle, Loader2, Plus, Minus, Check,
  Truck, Shield, Award,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const addItem = useCartStore((s) => s.addItem);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(params.id as string));
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product
  const fetchProduct = useCallback(async () => {
    if (!params.id) return;

    setLoading(true);
    setError(null);

    try {
      const productData = await dataManager.getProductById(params.id as string);
      setProduct(productData);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = async () => {
    if (!product || addingToCart) return;

    setAddingToCart(true);
    try {
      addItem(product, quantity);
      showToast(`Added ${quantity} × ${product.name} to cart`, 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add to cart', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!product) return;

    try {
      toggleFavorite(product);
      if (isFavorite) {
        showToast('Removed from favorites', 'info');
      } else {
        showToast('Added to favorites!', 'success');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast('Error updating favorites', 'error');
    }
  };

  const updateQuantity = (newQuantity: number) => {
    if (product && newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-olive-600" />
        <span className="ml-2 text-olive-600">Loading product...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-olive-900 mb-2">Product Not Found</h2>
          <p className="text-olive-600 mb-4">{error || 'This product does not exist or has been removed.'}</p>
          <Link href="/olive-oils" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const stars = generateStars(product.avg_rating || 0);
  const discountPercentage = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/olive-oils" className="flex items-center gap-2 text-olive-600 hover:text-olive-700">
            <ArrowLeft className="w-4 h-4" />
            Back to Olive Oils
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-olive-100">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImageIndex].image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-olive-300" />
                  </div>
                )}
              </div>
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.organic && (
                  <span className="badge-organic text-sm">
                    <Leaf className="w-4 h-4" /> Organic
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="badge bg-red-500 text-white text-sm">
                    -{discountPercentage}%
                  </span>
                )}
              </div>

              {/* Favorite Button */}
              <button
                onClick={handleToggleFavorite}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-all duration-200 hover:scale-110"
              >
                <Heart className={`w-5 h-5 transition-colors ${
                  isFavorite ? 'fill-olive-600 text-olive-600' : 'text-olive-600'
                }`} />
              </button>
            </div>

            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-4">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-olive-600'
                        : 'border-transparent hover:border-olive-300'
                    }`}
                  >
                    <Image
                      src={image.image_url}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-olive-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: stars.full }).map((_, i) => (
                    <Star key={`f${i}`} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  {stars.half && <Star className="w-4 h-4 fill-amber-200 text-amber-400" />}
                  {Array.from({ length: stars.empty }).map((_, i) => (
                    <Star key={`e${i}`} className="w-4 h-4 text-gray-300" />
                  ))}
                  <span className="text-sm text-olive-600 ml-1">
                    {product.avg_rating?.toFixed(1) || '0.0'} ({product.review_count || 0} reviews)
                  </span>
                </div>
                
                <div className="flex items-center gap-1 text-olive-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{product.origin_country}</span>
                </div>
              </div>

              <p className="text-olive-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-olive-900">
                  {formatPrice(product.price)}
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="text-lg text-olive-400 line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                )}
              </div>
              <p className="text-sm text-olive-600 mt-1">{product.volume_ml}ml bottle</p>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border border-olive-200 rounded-lg">
                  <button
                    onClick={() => updateQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-olive-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="p-2 hover:bg-olive-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <span className="text-sm text-olive-600">
                  {product.stock <= 10 ? (
                    <span className="text-amber-600 font-medium">
                      Only {product.stock} left in stock!
                    </span>
                  ) : (
                    `${product.stock} available`
                  )}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock <= 0}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Adding to Cart...
                  </>
                ) : product.stock <= 0 ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Olive Details */}
              <div>
                <h3 className="text-lg font-medium text-olive-900 mb-3">Olive Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-olive-600">Variety</span>
                    <p className="font-medium text-olive-900">{product.olive_variety}</p>
                  </div>
                  <div>
                    <span className="text-sm text-olive-600">Harvest Year</span>
                    <p className="font-medium text-olive-900">{product.harvest_year}</p>
                  </div>
                  {product.region && (
                    <div>
                      <span className="text-sm text-olive-600">Region</span>
                      <p className="font-medium text-olive-900">{product.region}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-olive-600">Volume</span>
                    <p className="font-medium text-olive-900">{product.volume_ml}ml</p>
                  </div>
                </div>
              </div>

              {/* Tasting Notes */}
              {product.tasting_notes && (
                <div>
                  <h3 className="text-lg font-medium text-olive-900 mb-3">Tasting Notes</h3>
                  <p className="text-olive-700">{product.tasting_notes}</p>
                </div>
              )}

              {/* Storage Instructions */}
              {product.storage_instructions && (
                <div>
                  <h3 className="text-lg font-medium text-olive-900 mb-3">Storage Instructions</h3>
                  <p className="text-olive-700">{product.storage_instructions}</p>
                </div>
              )}

              {/* Features */}
              <div>
                <h3 className="text-lg font-medium text-olive-900 mb-3">Why Choose This Oil</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-olive-600" />
                    <span className="text-olive-700">Free shipping on orders over €50</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-olive-600" />
                    <span className="text-olive-700">100% satisfaction guarantee</span>
                  </div>
                  {product.organic && (
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-olive-600" />
                      <span className="text-olive-700">Certified organic production</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
