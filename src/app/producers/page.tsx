'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Globe, Star, Award, ArrowRight, Leaf, Users } from 'lucide-react';
import { mockProducers, mockProducts } from '@/lib/data/mock-data';

export default function ProducersPage() {
  return (
    <div className="min-h-screen bg-cream-gradient">
      {/* Hero */}
      <div className="bg-olive-900 text-white">
        <div className="section-padding py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-olive-800/50 border border-olive-700/50 text-olive-300 text-sm mb-5">
            <Users className="w-4 h-4" /> Meet the Makers
          </div>
          <h1 className="font-sans text-4xl sm:text-5xl font-bold mb-4 max-w-2xl mx-auto">
            Our Artisan
            <span className="text-gold-400"> Producers</span>
          </h1>
          <p className="text-olive-300 text-lg max-w-xl mx-auto">
            Family estates and cooperatives across the Mediterranean, dedicated to crafting the world&apos;s finest olive oils.
          </p>
        </div>
      </div>

      {/* Producers grid */}
      <div className="section-padding page-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProducers.map((producer) => {
            const products = mockProducts.filter((p) => p.producer_id === producer.id);
            const avgRating = products.length > 0
              ? (products.reduce((sum, p) => sum + p.avg_rating, 0) / products.length).toFixed(1)
              : '—';

            return (
              <Link href={`/producers/${producer.id}`} key={producer.id}
                className="card group overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Banner */}
                <div className="h-32 bg-gradient-to-br from-olive-200 to-olive-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-olive-900/10" />
                  <div className="absolute -bottom-6 left-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-olive-100 to-olive-200 ring-4 ring-white shadow-xl flex items-center justify-center">
                      <span className="font-sans font-bold text-olive-600 text-xl">
                        {producer.company_name.charAt(0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-8">
                  <h2 className="font-sans text-lg font-bold text-olive-900 group-hover:text-olive-700 transition-colors">
                    {producer.company_name}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-olive-500 mt-1 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {producer.region}, {producer.country}
                    </span>
                  </div>
                  <p className="text-sm text-olive-600 line-clamp-2 mb-4">{producer.description}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-olive-100">
                    <div className="flex items-center gap-4 text-xs text-olive-500">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" /> {avgRating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Leaf className="w-3.5 h-3.5" /> {products.length} oils
                      </span>
                    </div>
                    <span className="text-olive-500 group-hover:text-olive-700 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
