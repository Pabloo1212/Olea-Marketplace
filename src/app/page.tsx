'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { mockProducts, mockProducers, mockReviews } from '@/lib/data/mock-data';
import { useCartStore } from '@/stores/cartStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useTranslation } from '@/stores/i18nStore';
import { formatPrice, generateStars } from '@/lib/utils/helpers';
import {
  ArrowRight,
  Star,
  Leaf,
  Shield,
  Truck,
  Award,
  ChevronRight,
  ShoppingCart,
  MapPin,
  Heart,
  Search,
  Users,
  Globe,
} from 'lucide-react';

// ============================================================
// Product Card Component
// ============================================================

function ProductCard({ product }: { product: typeof mockProducts[0] }) {
  const { t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id));
  const [isHovered, setIsHovered] = useState(false);
  const stars = generateStars(product.avg_rating);

  return (
    <div
      className="card group overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative h-60 sm:h-72 overflow-hidden bg-cream-100">
        <Image
          src="/images/bottle-single.png"
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.organic && (
            <span className="badge-organic">
              <Leaf className="w-3 h-3" /> {t('productCard.organic')}
            </span>
          )}
          {product.compare_at_price && (
            <span className="badge bg-gold-100 text-gold-800">
              {t('productCard.sale')}
            </span>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300">
          <button 
            onClick={(e) => { e.preventDefault(); toggleFavorite(product); }}
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-olive-600 text-olive-600' : 'text-olive-600'}`} />
          </button>
        </div>

        {/* Add to cart overlay */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
            className="w-full btn-primary py-2.5 text-sm"
          >
            <ShoppingCart className="w-4 h-4" /> {t('productCard.addToCart')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <MapPin className="w-3 h-3 text-olive-400" />
          <span className="text-xs text-olive-500">{product.origin_country} · {product.olive_variety}</span>
        </div>

        <Link href={`/products/${product.id}`}>
          <h3 className="font-serif text-base font-semibold text-olive-900 group-hover:text-forest-700 transition-colors line-clamp-2 mb-2">
            {product.name}
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
          <span className="text-xs text-olive-400">({product.review_count})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-olive-900">{formatPrice(product.price)}</span>
          {product.compare_at_price && (
            <span className="text-sm text-olive-400 line-through">{formatPrice(product.compare_at_price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Landing Page
// ============================================================

export default function HomePage() {
  const { t } = useTranslation();
  const featuredProducts = mockProducts.slice(0, 4);
  const topRated = [...mockProducts].sort((a, b) => b.avg_rating - a.avg_rating).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* ===== HERO SECTION WITH BACKGROUND IMAGE ===== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background image */}
        <Image
          src="/images/hero-bg.png"
          alt="Olive grove"
          fill
          className="object-cover"
          priority
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-hero-gradient" />

        <div className="section-padding relative z-10 py-20">
          <div className="max-w-2xl">
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 animate-fade-in-up drop-shadow-lg">
              {t('home.heroTitle')}
              <span className="block text-cream-300">
                {t('home.heroTitleHighlight')}
              </span>
              {t('home.heroTitleEnd')}
            </h1>

            <p className="text-lg sm:text-xl text-cream-200 mb-8 max-w-lg leading-relaxed animate-fade-in-up drop-shadow" style={{ animationDelay: '0.15s' }}>
              {t('home.heroSubtitle')}
            </p>

            {/* Search bar */}
            <div className="relative max-w-md mb-8 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-400" />
              <input
                type="text"
                placeholder={t('home.searchPlaceholder')}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/95 backdrop-blur-sm text-olive-900 text-sm placeholder:text-olive-400 focus:outline-none focus:ring-2 focus:ring-forest-500 shadow-xl"
              />
            </div>

            <div className="flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
              <Link href="/products" className="btn-primary px-8 py-4 text-base shadow-xl">
                {t('home.exploreBtn')} <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== VALUE PROPS ===== */}
      <section className="bg-white border-b border-olive-100">
        <div className="section-padding py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, title: t('valueProps.selectedProducers'), desc: t('valueProps.selectedProducersDesc') },
              { icon: Leaf, title: t('valueProps.gourmetOils'), desc: t('valueProps.gourmetOilsDesc') },
              { icon: Shield, title: t('valueProps.qualityGuaranteed'), desc: t('valueProps.qualityGuaranteedDesc') },
              { icon: Truck, title: t('valueProps.directShipping'), desc: t('valueProps.directShippingDesc') },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-4 group">
                <div className="w-14 h-14 rounded-2xl bg-forest-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-forest-100 transition-colors">
                  <Icon className="w-6 h-6 text-forest-600" />
                </div>
                <h3 className="font-serif font-semibold text-olive-900 text-sm mb-1">{title}</h3>
                <p className="text-xs text-olive-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="bg-cream-gradient">
        <div className="section-padding page-padding">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-forest-600 text-sm font-medium uppercase tracking-wider">{t('home.featuredLabel')}</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-olive-900 mt-2">{t('home.featuredTitle')}</h2>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-2 text-forest-600 hover:text-forest-700 font-medium text-sm transition-colors">
              {t('home.featuredViewAll')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="sm:hidden mt-6 text-center">
            <Link href="/products" className="btn-secondary">
              {t('home.featuredViewAll')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== ABOUT / CTA WITH IMAGE ===== */}
      <section className="bg-white">
        <div className="section-padding page-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-80 lg:h-[450px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/bottles-collection.png"
                alt={t('home.aboutTitle')}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-forest-600 text-sm font-medium uppercase tracking-wider">{t('home.aboutLabel')}</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-olive-900 mt-2 mb-6">
                {t('home.aboutTitle')}
              </h2>
              <p className="text-olive-600 leading-relaxed mb-4">
                {t('home.aboutText1')}
              </p>
              <p className="text-olive-600 leading-relaxed mb-8">
                {t('home.aboutText2')}
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { value: '18+', label: t('home.aboutStatProducers') },
                  { value: '100%', label: t('home.aboutStatAuthentic') },
                  { value: '12', label: t('home.aboutStatCountries') },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center p-3 rounded-xl bg-forest-50">
                    <p className="font-serif text-2xl font-bold text-forest-700">{value}</p>
                    <p className="text-xs text-olive-600 mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <Link href="/producers" className="btn-primary">
                {t('home.aboutBtn')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRODUCER SPOTLIGHT ===== */}
      <section className="bg-cream-gradient">
        <div className="section-padding page-padding">
          <div className="text-center mb-12">
            <span className="text-forest-600 text-sm font-medium uppercase tracking-wider">{t('home.producerSpotlightLabel')}</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-olive-900 mt-2">{t('home.producerSpotlightTitle')}</h2>
            <p className="text-olive-600 mt-3 max-w-2xl mx-auto">
              {t('home.producerSpotlightText')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockProducers.map((producer) => (
              <Link
                key={producer.id}
                href={`/producers/${producer.id}`}
                className="card-premium p-6 text-center group hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-forest-100 to-olive-200 mx-auto mb-4 flex items-center justify-center ring-4 ring-cream-100 group-hover:ring-forest-100 transition-all">
                  <span className="font-serif font-bold text-forest-700 text-xl">
                    {producer.company_name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-serif font-semibold text-olive-900 mb-1">{producer.company_name}</h3>
                <div className="flex items-center justify-center gap-1.5 text-sm text-olive-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{producer.region}, {producer.country}</span>
                </div>
                <p className="text-xs text-olive-400 mt-3 line-clamp-2">{producer.description.slice(0, 100)}...</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SUBSCRIPTION CTA ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-forest-800 to-olive-900" />
        <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '24px 24px'}} />
        <div className="section-padding py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-cream-300 text-sm font-medium uppercase tracking-wider mb-4">{t('home.subscriptionLabel')}</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-6">
              {t('home.subscriptionTitle')}
              <span className="text-cream-300">{t('home.subscriptionTitleHighlight')}</span>
            </h2>
            <p className="text-cream-200/80 text-lg mb-10 max-w-xl mx-auto">
              {t('home.subscriptionText')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/subscriptions" className="btn-gold px-8 py-4 text-base shadow-xl bg-cream-500 hover:bg-cream-600 text-olive-900 font-semibold">
                {t('home.subscriptionBtnPrice')} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/subscriptions" className="btn-secondary bg-transparent border-cream-400/30 text-white hover:bg-white/10 px-8 py-4 text-base">
                {t('home.subscriptionBtnPlans')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TOP RATED ===== */}
      <section className="bg-white">
        <div className="section-padding page-padding">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-forest-600 text-sm font-medium uppercase tracking-wider">{t('home.topRatedLabel')}</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-olive-900 mt-2">{t('home.topRatedTitle')}</h2>
            </div>
            <Link href="/products?sortBy=rating" className="hidden sm:flex items-center gap-2 text-forest-600 hover:text-forest-700 font-medium text-sm transition-colors">
              {t('home.featuredViewAll')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topRated.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="bg-cream-gradient">
        <div className="section-padding page-padding">
          <div className="text-center mb-12">
            <span className="text-forest-600 text-sm font-medium uppercase tracking-wider">{t('home.testimonialsLabel')}</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-olive-900 mt-2">{t('home.testimonialsTitle')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockReviews.slice(0, 3).map((review) => {
              const product = mockProducts.find(p => p.id === review.product_id);
              return (
                <div key={review.id} className="card p-6">
                  <div className="flex items-center mb-3">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                    ))}
                  </div>
                  <h4 className="font-serif font-semibold text-olive-900 mb-2">&ldquo;{review.title}&rdquo;</h4>
                  <p className="text-sm text-olive-600 leading-relaxed mb-4">{review.comment}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-olive-100">
                    <div>
                      <p className="text-sm font-medium text-olive-800">{review.profile?.name}</p>
                      <p className="text-xs text-olive-400">{review.profile?.country}</p>
                    </div>
                    {product && (
                      <span className="text-xs text-forest-600 bg-forest-50 px-2 py-1 rounded-lg">
                        {product.olive_variety}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="bg-white border-t border-olive-100">
        <div className="section-padding py-16 text-center">
          <h2 className="font-serif text-3xl font-bold text-olive-900 mb-4">
            {t('home.ctaTitle')}
          </h2>
          <p className="text-olive-600 mb-8 max-w-lg mx-auto">
            {t('home.ctaText')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="btn-primary px-8 py-4 text-base">
              {t('home.ctaBtn')} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/auth/register?role=producer" className="btn-secondary px-8 py-4 text-base">
              {t('home.ctaSellBtn')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
