'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/cartStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useTranslation } from '@/stores/i18nStore';
import { useToast } from '@/components/ui/toast';
import { formatPrice, generateStars } from '@/lib/utils/helpers';
import { validateProduct } from '@/lib/validation/schemas';
import {
  ArrowRight,
  Star,
  Leaf,
  ShoppingCart,
  MapPin,
  Heart,
  Loader2,
} from 'lucide-react';

interface ProductCardProps {
  product: any;
  className?: string;
  showQuickAdd?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  onAddToCart?: (product: any, quantity?: number) => void;
}

function ProductCard({ 
  product, 
  className = '', 
  showQuickAdd = true,
  variant = 'default',
  onAddToCart
}: ProductCardProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const addItem = useCartStore((s) => s.addItem);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id));
  
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Memoized calculations
  const stars = useMemo(() => generateStars(product.avg_rating || 0), [product.avg_rating]);
  const hasDiscount = useMemo(() => product.compare_at_price && product.compare_at_price > product.price, [product.compare_at_price, product.price]);
  const discountPercentage = useMemo(() => {
    if (!hasDiscount) return 0;
    return Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100);
  }, [hasDiscount, product.compare_at_price, product.price]);

  // Validate product data
  const validatedProduct = useMemo(() => {
    try {
      return validateProduct(product);
    } catch (error) {
      console.error('Invalid product data:', error);
      return null;
    }
  }, [product]);

  // Early return if product is invalid
  if (!validatedProduct) {
    return (
      <div className={`card opacity-50 ${className}`}>
        <div className="p-4 text-center text-olive-500">
          <p>Product data unavailable</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart || validatedProduct.stock <= 0) return;
    
    setIsAddingToCart(true);
    try {
      if (onAddToCart) {
        onAddToCart(validatedProduct, 1);
      } else {
        addItem(validatedProduct, 1);
        showToast('Added to cart!', 'success');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add to cart', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  }, [isAddingToCart, validatedProduct, addItem, onAddToCart, showToast]);

  const handleToggleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isTogglingFavorite) return;
    
    setIsTogglingFavorite(true);
    try {
      toggleFavorite(validatedProduct);
      // Show success toast
      if (isFavorite) {
        showToast('Removed from favorites', 'info');
      } else {
        showToast('Added to favorites!', 'success');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast('Error updating favorites', 'error');
    } finally {
      setIsTogglingFavorite(false);
    }
  }, [isTogglingFavorite, validatedProduct, toggleFavorite, isFavorite, showToast]);

  const getImageUrl = useCallback(() => {
    if (imageError || !validatedProduct.images?.length) {
      return '/images/placeholder-bottle.png';
    }
    return validatedProduct.images[0].image_url;
  }, [imageError, validatedProduct.images]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  // Variant-specific renderings
  if (variant === 'compact') {
    return (
      <div className={`card group overflow-hidden relative ${className}`}>
        <Link href={`/products/${validatedProduct.slug}`} className="block">
          <div className="flex gap-3 p-3">
            <div className="w-16 h-16 rounded-lg bg-cream-100 flex-shrink-0 overflow-hidden relative">
              {imageLoading && (
                <div className="absolute inset-0 bg-olive-100 animate-pulse" />
              )}
              <Image
                src={getImageUrl()}
                alt={validatedProduct.name}
                fill
                className="object-cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-olive-900 truncate group-hover:text-olive-700 transition-colors">
                {validatedProduct.name}
              </h3>
              <p className="text-xs text-olive-500 mb-1">
                {validatedProduct.olive_variety} • {validatedProduct.volume_ml}ml
              </p>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-olive-900">
                  {formatPrice(validatedProduct.price)}
                </span>
                {validatedProduct.stock > 0 ? (
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="p-1.5 rounded-lg bg-olive-100 hover:bg-olive-200 text-olive-600 transition-colors disabled:opacity-50"
                  >
                    {isAddingToCart ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-3 h-3" />
                    )}
                  </button>
                ) : (
                  <span className="text-xs text-red-500">Out of stock</span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`card group overflow-hidden relative ${className}`}>
      {/* Image Container */}
      <div className="relative h-60 sm:h-72 overflow-hidden bg-cream-100">
        <Link href={`/products/${validatedProduct.id}`}>
          {imageLoading && (
            <div className="absolute inset-0 bg-olive-100 animate-pulse z-10" />
          )}
          <Image
            src={getImageUrl()}
            alt={validatedProduct.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {validatedProduct.organic && (
            <span className="badge-organic text-xs">
              <Leaf className="w-3 h-3" /> {t('productCard.organic')}
            </span>
          )}
          {hasDiscount && (
            <span className="badge bg-red-500 text-white text-xs">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Favorite Button - Fixed positioning to avoid conflicts */}
        <button
          onClick={handleToggleFavorite}
          disabled={isTogglingFavorite}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-all duration-200 hover:scale-110 disabled:opacity-50 z-20"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isTogglingFavorite ? (
            <Loader2 className="w-4 h-4 animate-spin text-olive-600" />
          ) : (
            <Heart className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-olive-600 text-olive-600' : 'text-olive-600'
            }`} />
          )}
        </button>

        {/* Quick Add to Cart Overlay */}
        {showQuickAdd && (
          <div className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 z-10 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || validatedProduct.stock <= 0}
              className="w-full btn-primary py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {t('productCard.adding')}
                </>
              ) : validatedProduct.stock <= 0 ? (
                t('productCard.outOfStock')
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {t('productCard.addToCart')}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-4">
        {/* Origin and Variety */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <MapPin className="w-3 h-3 text-olive-400" />
          <span className="text-xs text-olive-500">
            {validatedProduct.origin_country} · {validatedProduct.olive_variety}
          </span>
        </div>

        {/* Product Name */}
        <Link href={`/products/${validatedProduct.id}`}>
          <h3 className="font-serif text-base font-semibold text-olive-900 group-hover:text-forest-700 transition-colors line-clamp-2 mb-2">
            {validatedProduct.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center">
            {Array.from({ length: stars.full }).map((_, i) => (
              <Star key={`f${i}`} className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
            ))}
            {Array.from({ length: stars.empty }).map((_, i) => (
              <Star key={`e${i}`} className="w-3.5 h-3.5 text-olive-200" />
            ))}
          </div>
          <span className="text-xs text-olive-400">
            ({validatedProduct.review_count || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-olive-900">
            {formatPrice(validatedProduct.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-olive-400 line-through">
              {formatPrice(validatedProduct.compare_at_price)}
            </span>
          )}
        </div>

        {/* Stock Indicator */}
        {validatedProduct.stock <= 10 && (
          <div className="mt-2 text-xs text-amber-600">
            Only {validatedProduct.stock} left
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
