'use client';

import React from 'react';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { useTranslation } from '@/stores/i18nStore';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    [t('footer.marketplace')]: [
      { label: t('footer.allOils'), href: '/products' },
      { label: t('footer.organicSelection'), href: '/products?organic=true' },
      { label: t('footer.newArrivals'), href: '/products?sortBy=newest' },
      { label: t('footer.topRated'), href: '/products?sortBy=rating' },
      { label: t('footer.subscriptions'), href: '/subscriptions' },
    ],
    [t('footer.producersTitle')]: [
      { label: t('footer.ourProducers'), href: '/producers' },
      { label: t('footer.sellOil'), href: '/auth/register?role=producer' },
      { label: t('footer.producerDashboard'), href: '/dashboard' },
      { label: t('footer.qualityStandards'), href: '/quality' },
    ],
    [t('footer.company')]: [
      { label: t('footer.aboutUs'), href: '/about' },
      { label: t('footer.blog'), href: '/blog' },
      { label: t('footer.contactUs'), href: '/contact' },
    ],
    [t('footer.support')]: [
      { label: t('footer.helpCenter'), href: '/help' },
      { label: t('footer.shippingReturns'), href: '/shipping' },
      { label: t('footer.privacy'), href: '/privacy' },
      { label: t('footer.terms'), href: '/terms' },
    ],
  };

  return (
    <footer className="bg-olive-950 text-olive-200">
      {/* Newsletter */}
      <div className="border-b border-olive-800/50">
        <div className="section-padding py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-serif text-2xl text-white mb-1">{t('footer.newsletterTitle')}</h3>
              <p className="text-olive-400 text-sm">{t('footer.newsletterText')}</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="flex-1 md:w-72 px-4 py-2.5 rounded-l-xl bg-olive-900 border border-olive-700 text-white text-sm placeholder:text-olive-500 focus:outline-none focus:border-forest-500 transition-colors"
              />
              <button className="px-6 py-2.5 bg-forest-600 hover:bg-forest-700 text-white font-medium text-sm rounded-r-xl transition-colors whitespace-nowrap">
                {t('footer.subscribe')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="section-padding py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="15" stroke="#5d7b35" strokeWidth="2" />
                <path d="M16 8c-2 3-6 6-6 10a6 6 0 0012 0c0-4-4-7-6-10z" fill="#7a9e48" opacity="0.8" />
              </svg>
              <span className="font-serif font-bold text-white text-lg">
                <span className="italic text-forest-400">Olive</span>Market
              </span>
            </div>
            <p className="text-olive-400 text-sm leading-relaxed mb-4">
              {t('footer.description')}
            </p>
            <div className="flex gap-2.5">
              {['Instagram', 'X', 'Facebook'].map((name) => (
                <a key={name} href="#" className="w-9 h-9 rounded-lg bg-olive-900 hover:bg-olive-800 flex items-center justify-center transition-colors text-olive-400 text-xs font-medium">
                  {name[0]}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4 capitalize">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-olive-400 hover:text-olive-200 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-olive-800/50">
        <div className="section-padding py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-olive-500 text-xs">
            © {currentYear} OliveMarket. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-olive-500 text-xs">
              <Leaf className="w-3.5 h-3.5" />
              <span>{t('footer.sustainableShopping')}</span>
            </div>
            <span className="text-olive-700">|</span>
            <div className="flex gap-2">
              {['Visa', 'MC', 'Amex', 'GPay'].map((card) => (
                <div key={card} className="w-9 h-5 bg-olive-800 rounded text-[9px] text-olive-400 flex items-center justify-center font-medium">
                  {card}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
