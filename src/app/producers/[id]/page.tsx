'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { mockProducers, mockProducts } from '@/lib/data/mock-data';
import { useCartStore } from '@/stores/cartStore';
import { useTranslation } from '@/stores/i18nStore';
import { formatPrice, generateStars } from '@/lib/utils/helpers';
import {
  MapPin, Globe, Phone, Star, Leaf, ShoppingCart, ArrowLeft,
  Award, Heart, ChevronRight, Mail, TreeDeciduous, Calendar, CheckCircle, Medal
} from 'lucide-react';

export default function ProducerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);
  const [isFollowing, setIsFollowing] = useState(false);

  const producer = mockProducers.find((p) => p.id === params.id);

  if (!producer) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center">
        <h1 className="font-serif text-3xl font-bold text-olive-900 mb-4">{t('common.notFound')}</h1>
        <button onClick={() => router.back()} className="btn-secondary">
          <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.goHome')}
        </button>
      </div>
    );
  }

  const producerProducts = mockProducts.filter((p) => p.producer_id === producer.id);

  return (
    <div className="min-h-screen bg-cream-50 pb-20 selection:bg-gold-200">
      
      {/* 1. Full-bleed Hero Editorial Banner */}
      <div className="relative h-[60vh] min-h-[500px] w-full bg-olive-950 overflow-hidden">
        {/* Placeholder for actual producer banner image */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-gradient-to-tr from-olive-900 to-forest-800" />
        <div className="absolute inset-0 bg-black/20" /> {/* Subtle darkening for text readability */}
        
        {/* Top Navigation Bar overlay */}
        <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium bg-black/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" /> {t('producerProfile.backToList')}
          </button>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/20 border border-gold-400/30 text-gold-300 text-xs font-bold tracking-widest uppercase backdrop-blur-md">
            <Award className="w-3.5 h-3.5" /> {t('producerProfile.atelierLabel')}
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 lg:p-24 z-20 flex flex-col md:flex-row md:items-end justify-between gap-8 bg-gradient-to-t from-olive-950 via-olive-950/80 to-transparent">
          <div className="max-w-3xl">
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight leading-tight">
              {producer.company_name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-olive-200 text-sm md:text-base mb-6">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-gold-400" /> 
                {producer.region}, {producer.country}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-gold-400" /> 
                {t('producerProfile.verifiedProducer')}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
             <button className="btn-primary bg-gold-500 hover:bg-gold-600 text-olive-950 border-none shadow-lg shadow-gold-900/20 py-3 px-6 font-bold">
               <Mail className="w-4 h-4 mr-2" /> {t('producerProfile.contactB2B')}
             </button>
             <button 
               onClick={() => setIsFollowing(!isFollowing)}
               className={`py-3 px-6 rounded-xl font-bold text-sm transition-all border flex items-center justify-center ${
                 isFollowing 
                 ? 'bg-white/10 border-white/20 text-white' 
                 : 'bg-white text-olive-950 border-white hover:bg-cream-50'
               }`}
             >
               <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-white' : ''}`} /> 
               {isFollowing ? 'Siguiendo' : t('producerProfile.followProducer')}
             </button>
          </div>
        </div>
      </div>

      {/* 2. Editorial Layout Constraints */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Story & Map */}
          <div className="lg:col-span-7 space-y-16">
            
            {/* The Story */}
            <section className="prose prose-olive lg:prose-lg max-w-none">
              <h2 className="font-serif text-3xl font-bold text-olive-950 mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-gold-400 block" />
                {t('producerProfile.aboutProducer')}
              </h2>
              <p className="text-olive-700 leading-relaxed text-lg first-letter:text-6xl first-letter:font-serif first-letter:text-olive-900 first-letter:mr-3 first-letter:float-left">
                {producer.description}
              </p>
              {/* Fake editorial expansion text for premium feel */}
              <p className="text-olive-700 leading-relaxed mt-4">
                Nuestro compromiso con la excelencia comienza en el campo. Cada olivo es tratado con un respeto reverencial por los ciclos naturales, permitiendo que la tierra exprese su carácter único a través de cada gota de nuestro aceite. La recolección temprana y la extracción en frío garantizan no solo un sabor inigualable, sino también la preservación de todos los polifenoles y antioxidantes.
              </p>
            </section>

            {/* Quick Stats Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-olive-100 text-center shadow-sm">
                <TreeDeciduous className="w-8 h-8 text-forest-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-olive-950 mb-1">15.000+</div>
                <div className="text-xs font-semibold text-olive-500 uppercase tracking-widest">{t('producerProfile.statsTrees')}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-olive-100 text-center shadow-sm">
                <Medal className="w-8 h-8 text-gold-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-olive-950 mb-1">Top 10</div>
                <div className="text-xs font-semibold text-olive-500 uppercase tracking-widest">{t('producerProfile.statsAwards')}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-olive-100 text-center shadow-sm">
                <Calendar className="w-8 h-8 text-olive-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-olive-950 mb-1">Desde 1892</div>
                <div className="text-xs font-semibold text-olive-500 uppercase tracking-widest">{t('producerProfile.statsExperience')}</div>
              </div>
            </section>

            {/* Geography Map iframe */}
            <section>
              <h3 className="font-serif text-2xl font-bold text-olive-950 mb-6">{t('producerProfile.region')}</h3>
              <div className="w-full h-80 bg-olive-100 rounded-3xl overflow-hidden border border-olive-200 relative group">
                {/* Fake Map Image Placeholder to imitate Google Maps */}
                <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=43.7711,11.2486&zoom=9&size=800x400&maptype=terrain&key=YOUR_API_KEY_HERE')] bg-cover bg-center grayscale opacity-80 mix-blend-multiply transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100" />
                
                {/* Map completely placeholder for now */}
                 <div className="absolute inset-0 flex items-center justify-center bg-olive-900/5 group-hover:bg-transparent transition-colors">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 transform group-hover:-translate-y-2 transition-transform duration-500">
                      <MapPin className="w-5 h-5 text-forest-600 animate-bounce" />
                      <span className="font-medium text-olive-900">{producer.region}</span>
                    </div>
                 </div>
              </div>
            </section>

          </div>

          {/* Right Column: Products & Shop */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-olive-900/5 border border-olive-100 sticky top-24">
              <h3 className="font-serif text-2xl font-bold text-olive-950 mb-8 flex items-center gap-2">
                 {t('producerProfile.ourOils')}
                 <span className="bg-olive-100 text-olive-600 text-sm font-bold px-2.5 py-0.5 rounded-full ml-auto">
                   {producerProducts.length}
                 </span>
              </h3>

              <div className="space-y-6">
                {producerProducts.map((product) => {
                  const stars = generateStars(product.avg_rating);
                  return (
                    <div key={product.id} className="group flex gap-4 p-4 rounded-2xl hover:bg-olive-50 transition-colors border border-transparent hover:border-olive-100">
                      {/* Product Thumbnail */}
                      <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-olive-100 to-cream-100 flex-shrink-0 flex items-center justify-center p-2 relative">
                        <div className="w-8 h-14 rounded bg-gradient-to-b from-olive-400 to-olive-600 shadow-md group-hover:scale-110 transition-transform duration-300" />
                        {product.organic && (
                          <div className="absolute -top-2 -right-2 bg-forest-500 text-white rounded-full p-1 shadow-sm">
                            <Leaf className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <Link href={`/products/${product.id}`}>
                          <h4 className="font-serif text-lg font-bold text-olive-950 group-hover:text-forest-700 transition-colors truncate">
                            {product.name}
                          </h4>
                        </Link>
                        <p className="text-xs font-semibold text-olive-400 uppercase tracking-widest mb-1 truncate">
                          {product.olive_variety}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-olive-900">{formatPrice(product.price)}</span>
                          </div>
                          
                          <button 
                            onClick={() => addItem(product)}
                            className="p-2 rounded-lg bg-olive-100 text-olive-700 hover:bg-forest-600 hover:text-white transition-colors"
                            aria-label={t('products.add')}
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* B2B Footer inside card */}
              <div className="mt-8 pt-8 border-t border-olive-100">
                <p className="text-sm text-olive-500 text-center mb-4">
                  ¿Tienes un restaurante o tienda gourmet?
                </p>
                <button className="w-full btn-secondary bg-transparent border-2 border-olive-200 hover:border-olive-900 hover:bg-olive-900 hover:text-white transition-all text-sm py-3">
                  {t('producerProfile.contactB2B')}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
