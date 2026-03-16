'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { mockProducts, mockReviews } from '@/lib/data/mock-data';
import { useCartStore } from '@/stores/cartStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { formatPrice, formatDate, generateStars } from '@/lib/utils/helpers';
import {
  Star, Leaf, ShoppingCart, MapPin, Heart, Minus, Plus,
  ChevronRight, Shield, Truck, Award, Package, ArrowLeft,
  Share2, Check,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = mockProducts.find((p) => p.slug === slug);
  const addItem = useCartStore((s) => s.addItem);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product?.id || ''));
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'producer'>('description');
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <div className="section-padding page-padding text-center">
        <h1 className="font-sans text-3xl font-bold text-olive-900 mb-4">Product Not Found</h1>
        <p className="text-olive-600 mb-6">The product you're looking for doesn't exist.</p>
        <Link href="/products" className="btn-primary">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>
    );
  }

  const stars = generateStars(product.avg_rating);
  const producer = product.producer;
  const reviews = mockReviews.filter((r) => r.product_id === product.id);
  const relatedProducts = mockProducts
    .filter((p) => p.id !== product.id && (p.producer_id === product.producer_id || p.olive_variety === product.olive_variety))
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const intensityLabel = { mild: 'Mild & Delicate', medium: 'Medium & Balanced', intense: 'Intense & Robust' };
  const intensityWidth = { mild: '33%', medium: '66%', intense: '100%' };

  return (
    <div className="min-h-screen bg-cream-gradient">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-olive-100">
        <div className="section-padding py-3">
          <nav className="flex items-center gap-2 text-sm text-olive-500">
            <Link href="/" className="hover:text-olive-700 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/products" className="hover:text-olive-700 transition-colors">Shop</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-olive-800 font-medium truncate max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="section-padding py-8 sm:py-12">
        {/* Product Main */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-olive-100 to-olive-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-28 h-44 mx-auto mb-3 rounded-xl bg-gradient-to-b from-olive-300 to-olive-500 shadow-2xl" />
                <span className="text-olive-600 text-sm font-medium">{product.volume_ml}ml</span>
              </div>
              {product.organic && (
                <span className="absolute top-5 left-5 badge-organic text-sm px-3 py-1.5">
                  <Leaf className="w-4 h-4" /> Certified Organic
                </span>
              )}
              {product.compare_at_price && (
                <span className="absolute top-5 right-5 badge bg-red-100 text-red-700 text-sm px-3 py-1.5">
                  Sale
                </span>
              )}
              <button 
                onClick={(e) => { e.preventDefault(); if (product) toggleFavorite(product); }}
                className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-olive-600 text-olive-600' : 'text-olive-600'}`} />
              </button>
            </div>
            {/* Thumbnail row */}
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-olive-100 to-olive-200 flex items-center justify-center cursor-pointer border-2 transition-colors ${
                    i === 0 ? 'border-olive-500' : 'border-transparent hover:border-olive-300'
                  }`}
                >
                  <div className="w-8 h-12 rounded bg-gradient-to-b from-olive-300 to-olive-400 shadow" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            {/* Origin */}
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-olive-400" />
              <span className="text-sm text-olive-500">{product.origin_region}, {product.origin_country}</span>
              <span className="text-olive-300">•</span>
              <span className="text-sm text-olive-500">{product.olive_variety}</span>
            </div>

            <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold text-olive-900 mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center">
                {Array.from({ length: stars.full }).map((_, i) => (
                  <Star key={`f${i}`} className="w-5 h-5 fill-gold-400 text-gold-400" />
                ))}
                {Array.from({ length: stars.empty }).map((_, i) => (
                  <Star key={`e${i}`} className="w-5 h-5 text-olive-200" />
                ))}
              </div>
              <span className="text-sm text-olive-600 font-medium">{product.avg_rating}</span>
              <span className="text-sm text-olive-400">({product.review_count} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-olive-900">{formatPrice(product.price)}</span>
              {product.compare_at_price && (
                <>
                  <span className="text-xl text-olive-400 line-through">{formatPrice(product.compare_at_price)}</span>
                  <span className="badge bg-red-100 text-red-700">
                    Save {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                  </span>
                </>
              )}
            </div>

            <p className="text-olive-600 leading-relaxed mb-6">{product.short_description}</p>

            {/* Intensity meter */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-olive-800">Intensity</span>
                <span className="text-sm text-olive-600 capitalize">{intensityLabel[product.intensity]}</span>
              </div>
              <div className="h-2 bg-olive-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-olive-300 via-olive-500 to-olive-700 rounded-full transition-all duration-500"
                  style={{ width: intensityWidth[product.intensity] }}
                />
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Variety', value: product.olive_variety },
                { label: 'Harvest', value: product.harvest_year.toString() },
                { label: 'Volume', value: `${product.volume_ml}ml` },
                { label: 'Origin', value: product.origin_country },
              ].map(({ label, value }) => (
                <div key={label} className="bg-olive-50/50 rounded-xl p-3">
                  <span className="text-xs text-olive-500 block mb-0.5">{label}</span>
                  <span className="text-sm font-semibold text-olive-900">{value}</span>
                </div>
              ))}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              {product.stock > 10 ? (
                <span className="flex items-center gap-1.5 text-sm font-medium text-olive-600">
                  <Check className="w-4 h-4" /> In Stock ({product.stock} available)
                </span>
              ) : product.stock > 0 ? (
                <span className="flex items-center gap-1.5 text-sm font-medium text-gold-700">
                  <Package className="w-4 h-4" /> Only {product.stock} left!
                </span>
              ) : (
                <span className="text-sm font-medium text-red-600">Out of Stock</span>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center bg-olive-50 rounded-xl border border-olive-200">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-olive-600 hover:text-olive-900 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold text-olive-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-3 text-olive-600 hover:text-olive-900 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-300 ${
                  addedToCart
                    ? 'bg-olive-600 text-white'
                    : 'btn-gold'
                }`}
              >
                {addedToCart ? (
                  <><Check className="w-5 h-5" /> Added to Cart!</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                )}
              </button>
            </div>

            {/* Share */}
            <button className="flex items-center gap-2 text-sm text-olive-500 hover:text-olive-700 transition-colors">
              <Share2 className="w-4 h-4" /> Share this product
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-olive-100">
              {[
                { icon: Shield, text: 'Quality Guarantee' },
                { icon: Truck, text: 'Free Shipping €75+' },
                { icon: Award, text: 'Award Winning' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="text-center">
                  <Icon className="w-5 h-5 text-olive-500 mx-auto mb-1" />
                  <span className="text-[11px] text-olive-500">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-16">
          <div className="flex border-b border-olive-200 gap-0 mb-8">
            {(['description', 'reviews', 'producer'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-olive-700 text-olive-900'
                    : 'border-transparent text-olive-500 hover:text-olive-700'
                }`}
              >
                {tab === 'reviews' ? `Reviews (${reviews.length})` : tab}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="card p-6 sm:p-8 animate-fade-in">
              <h3 className="font-sans text-xl font-bold text-olive-900 mb-4">About this Oil</h3>
              <p className="text-olive-700 leading-relaxed mb-6">{product.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Variety', value: product.olive_variety },
                  { label: 'Harvest Year', value: product.harvest_year },
                  { label: 'Origin Region', value: product.origin_region },
                  { label: 'Organic', value: product.organic ? 'Yes – Certified' : 'No' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-cream-50 rounded-xl p-4">
                    <span className="text-xs text-olive-500 block mb-1">{label}</span>
                    <span className="text-sm font-semibold text-olive-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4 animate-fade-in">
              {reviews.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-olive-500">No reviews yet for this product.</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="card p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                          ))}
                          {Array.from({ length: 5 - review.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-olive-200" />
                          ))}
                        </div>
                        <h4 className="font-semibold text-olive-900">&ldquo;{review.title}&rdquo;</h4>
                      </div>
                      {review.is_verified_purchase && (
                        <span className="badge bg-olive-100 text-olive-700 text-[10px]">
                          <Check className="w-3 h-3" /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-olive-600 leading-relaxed mb-3">{review.comment}</p>
                    <div className="flex items-center gap-2 text-xs text-olive-500">
                      <span className="font-medium">{review.profile?.name}</span>
                      <span>•</span>
                      <span>{review.profile?.country}</span>
                      <span>•</span>
                      <span>{formatDate(review.created_at)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'producer' && producer && (
            <div className="card p-6 sm:p-8 animate-fade-in">
              <div className="flex items-start gap-5 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-olive-100 to-olive-200 flex items-center justify-center flex-shrink-0">
                  <span className="font-sans font-bold text-olive-600 text-2xl">
                    {producer.company_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-sans text-xl font-bold text-olive-900">{producer.company_name}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-olive-500 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{producer.region}, {producer.country}</span>
                  </div>
                </div>
              </div>
              <p className="text-olive-600 leading-relaxed mb-5">{producer.description}</p>
              <Link href={`/producers/${producer.id}`} className="btn-secondary text-sm">
                View All Products <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="font-sans text-2xl font-bold text-olive-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => {
                const rpStars = generateStars(rp.avg_rating);
                return (
                  <Link key={rp.id} href={`/products/${rp.slug}`} className="card group overflow-hidden">
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-olive-100 to-olive-200 flex items-center justify-center">
                      <div className="w-12 h-18 rounded-lg bg-gradient-to-b from-olive-300 to-olive-400 shadow-lg" />
                      {rp.organic && (
                        <span className="absolute top-3 left-3 badge-organic text-[10px]">
                          <Leaf className="w-2.5 h-2.5" /> Organic
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-sans text-sm font-semibold text-olive-900 group-hover:text-olive-700 transition-colors line-clamp-2 mb-2">
                        {rp.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: rpStars.full }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-gold-400 text-gold-400" />
                        ))}
                      </div>
                      <span className="text-base font-bold text-olive-900">{formatPrice(rp.price)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
