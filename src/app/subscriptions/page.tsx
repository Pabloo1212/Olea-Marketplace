'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/stores/i18nStore';
import { Check, ArrowRight, Shield, BarChart3, Truck, Crown } from 'lucide-react';

export default function SubscriptionsPage() {
  const { t } = useTranslation();

  const plans = [
    {
      name: 'Standard Supply',
      price: 29.90,
      description: t('subscriptions.subtitle'),
      features: [
        '1 premium EVOO (500ml)',
        t('subscriptions.cancelAnytime'),
      ],
      highlight: false,
      icon: Shield,
    },
    {
      name: 'Professional Plan',
      price: 49.90,
      description: t('subscriptions.subtitle'),
      features: [
        '2 premium EVOO (500ml)',
        t('subscriptions.cancelAnytime'),
        '10% discount',
      ],
      highlight: true,
      icon: Crown,
    },
  ];

  return (
    <div className="min-h-screen bg-cream-gradient">
      {/* Hero */}
      <div className="relative overflow-hidden bg-olive-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-olive-950 via-olive-900 to-olive-800" />
        <div className="section-padding py-16 sm:py-24 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-olive-800/50 border border-olive-700/40 text-olive-300 text-sm mb-6">
            <BarChart3 className="w-4 h-4" /> {t('subscriptions.badge')}
          </div>
          <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 max-w-3xl mx-auto leading-tight tracking-tight">
            {t('subscriptions.title')}
          </h1>
          <p className="text-olive-300 text-lg max-w-xl mx-auto">
            {t('subscriptions.subtitle')}
          </p>
        </div>
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-olive-800/30 blur-3xl" />
      </div>

      {/* Plans */}
      <div className="section-padding -mt-8 relative z-20 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`rounded-3xl p-7 sm:p-8 relative overflow-hidden ${
                  plan.highlight
                    ? 'bg-gradient-to-br from-white to-cream-50 border-2 border-cream-300 shadow-xl shadow-cream-500/10'
                    : 'card'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 right-6 bg-cream-600 text-white text-xs font-bold px-4 py-1.5 rounded-b-xl">
                    {t('subscriptions.mostPopular')}
                  </div>
                )}

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                  plan.highlight ? 'bg-cream-100' : 'bg-olive-50'
                }`}>
                  <Icon className={`w-6 h-6 ${plan.highlight ? 'text-cream-600' : 'text-olive-600'}`} />
                </div>

                <h2 className="font-sans text-xl font-bold text-olive-900 mb-1">{plan.name}</h2>
                <p className="text-sm text-olive-500 mb-5">{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-olive-900">€{plan.price.toFixed(2)}</span>
                  <span className="text-olive-500 text-sm">/month</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-olive-600">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        plan.highlight ? 'text-cream-600' : 'text-olive-500'
                      }`} />
                      {feat}
                    </li>
                  ))}
                </ul>

                <button className={plan.highlight ? 'btn-gold w-full py-3.5' : 'btn-primary w-full py-3.5'}>
                  {t('subscriptions.subscribeNow')} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white">
        <div className="section-padding page-padding">
          <div className="text-center mb-12">
            <span className="text-olive-500 text-sm font-medium uppercase tracking-wider">{t('subscriptions.howItWorksSubtitle')}</span>
            <h2 className="font-sans text-3xl sm:text-4xl font-bold text-olive-900 mt-2 tracking-tight">{t('subscriptions.howItWorks')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { step: '1', icon: Shield, title: t('subscriptions.subscribeNow'), desc: t('subscriptions.subtitle') },
              { step: '2', icon: BarChart3, title: t('subscriptions.howItWorks'), desc: t('subscriptions.subtitle') },
              { step: '3', icon: Truck, title: t('subscriptions.howItWorksSubtitle'), desc: t('subscriptions.subtitle') },
            ].map(({ step, icon: StepIcon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-olive-50 flex items-center justify-center mx-auto mb-4">
                  <StepIcon className="w-7 h-7 text-olive-600" />
                </div>
                <h3 className="font-sans text-lg font-semibold text-olive-900 mb-2">{title}</h3>
                <p className="text-sm text-olive-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-cream-gradient">
        <div className="section-padding page-padding max-w-3xl mx-auto">
          <h2 className="font-sans text-3xl font-bold text-olive-900 text-center mb-10 tracking-tight">{t('subscriptions.faq')}</h2>
          <div className="space-y-4">
            {[
              { q: t('subscriptions.cancelAnytime'), a: t('subscriptions.subtitle') },
            ].map(({ q, a }) => (
              <div key={q} className="card p-5">
                <h3 className="font-semibold text-olive-900 mb-2">{q}</h3>
                <p className="text-sm text-olive-500">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
