'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { useCartStore } from '@/stores/cartStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useTranslation, useI18nStore, localeLabels, localeFlags, type Locale } from '@/stores/i18nStore';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  Globe,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
  Heart,
  Package,
} from 'lucide-react';

const ALL_LOCALES: Locale[] = ['es', 'en', 'it', 'de'];

export default function Header() {
  const { t, locale } = useTranslation();
  const setLocale = useI18nStore((s) => s.setLocale);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const itemCount = useCartStore((s) => s.getItemCount());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const favoritesItems = useFavoritesStore((s) => s.items);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'customer' | 'producer' | 'admin'>('customer');
  const [mounted, setMounted] = useState(false);

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    window.location.reload();
  };

  useEffect(() => {
    setMounted(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        setUserRole(session.user.user_metadata?.role || 'customer');
      }
    };
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUserRole(session.user.user_metadata?.role || 'customer');
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/ranking', label: t('nav.ranking') },
    { href: '/compare', label: t('nav.compare') },
    { href: '/products', label: t('nav.shop') },
    { href: '/producers', label: t('nav.producers') },
    { href: '/subscriptions', label: t('nav.subscriptions') },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-olive-900/5 border-b border-olive-100'
          : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      <div className="section-padding">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" stroke="#374a1f" strokeWidth="2" />
              <path d="M16 8c-2 3-6 6-6 10a6 6 0 0012 0c0-4-4-7-6-10z" fill="#5d7b35" opacity="0.8" />
              <path d="M16 10c-1.5 2.5-4 5-4 8a4 4 0 008 0c0-3-2.5-5.5-4-8z" fill="#7a9e48" />
            </svg>
            <div>
              <span className="font-serif font-bold text-xl text-olive-900 tracking-tight leading-none">
                <span className="italic text-forest-700">Olive</span>Market
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-olive-600 hover:text-olive-900 hover:bg-olive-50 transition-all duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2.5 rounded-xl hover:bg-olive-50 transition-colors text-olive-500 hover:text-olive-700"
              aria-label={t('nav.search')}
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            {/* Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="hidden md:flex items-center gap-1.5 p-2.5 rounded-xl hover:bg-olive-50 transition-colors text-olive-500 hover:text-olive-700"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium">{locale.toUpperCase()}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl shadow-olive-900/10 border border-olive-100 py-2 animate-scale-in">
                  {ALL_LOCALES.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { setLocale(loc); setIsLangMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2.5 ${
                        locale === loc
                          ? 'text-forest-700 bg-forest-50 font-medium'
                          : 'text-olive-600 hover:bg-olive-50'
                      }`}
                    >
                      <span className="text-base">{localeFlags[loc]}</span>
                      {localeLabels[loc]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleCart}
              className="relative p-2.5 rounded-xl hover:bg-olive-50 transition-colors text-olive-500 hover:text-olive-700"
              aria-label={t('nav.cart')}
            >
              <ShoppingCart className="w-[18px] h-[18px]" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-forest-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {itemCount}
                </span>
              )}
            </button>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-2 rounded-xl hover:bg-olive-50 transition-colors text-olive-500 hover:text-olive-700"
              >
                <div className="w-8 h-8 rounded-full bg-forest-50 flex items-center justify-center">
                  <User className="w-4 h-4 text-forest-600" />
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform hidden sm:block ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-olive-900/10 border border-olive-100 py-2 animate-scale-in">
                  {!mounted ? (
                    <div className="px-4 py-3 text-sm text-olive-400 animate-pulse">Cargando...</div>
                  ) : !isLoggedIn ? (
                    <>
                      <Link href="/auth/login" className="flex items-center gap-3 px-4 py-2.5 text-sm text-olive-600 hover:bg-olive-50 transition-colors">
                        <LogIn className="w-4 h-4" /> {t('nav.login')}
                      </Link>
                      <Link href="/auth/register" className="flex items-center gap-3 px-4 py-2.5 text-sm text-olive-600 hover:bg-olive-50 transition-colors">
                        <UserPlus className="w-4 h-4" /> {t('nav.register')}
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-olive-600 hover:bg-olive-50 transition-colors">
                        <User className="w-4 h-4" /> {t('nav.profile')}
                      </Link>
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-olive-600 hover:bg-olive-50 transition-colors">
                        <Package className="w-4 h-4" /> {t('nav.orders')}
                      </Link>
                      <Link href="/favorites" className="flex items-center justify-between px-4 py-2.5 text-sm text-olive-600 hover:bg-olive-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Heart className="w-4 h-4" /> {t('nav.favorites')}
                        </div>
                        {mounted && favoritesItems.length > 0 && (
                          <span className="bg-forest-100 text-forest-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {favoritesItems.length}
                          </span>
                        )}
                      </Link>
                      {(userRole === 'producer' || userRole === 'admin') && (
                        <>
                          <div className="border-t border-olive-100 my-1" />
                          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-olive-600 hover:bg-olive-50 transition-colors">
                            <LayoutDashboard className="w-4 h-4" /> {t('nav.dashboard')}
                          </Link>
                        </>
                      )}
                      <div className="border-t border-olive-100 my-1" />
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full">
                        <LogOut className="w-4 h-4" /> {t('nav.logout')}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {!mounted ? (
              <div className="hidden lg:inline-flex w-28 h-9 rounded-lg bg-olive-100 animate-pulse" />
            ) : !isLoggedIn ? (
              <Link href="/auth/login" className="hidden lg:inline-flex btn-primary py-2 px-5 text-sm">
                {t('nav.createAccount')}
              </Link>
            ) : null}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-olive-50 transition-colors text-olive-500"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="pb-4 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('home.searchPlaceholder')}
                className="input-field pl-12 pr-4 py-3 rounded-2xl bg-olive-50/50"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-olive-100 animate-slide-up">
          <nav className="section-padding py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-olive-600 hover:bg-olive-50 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {/* Mobile Language Selector */}
            <div className="border-t border-olive-100 my-2 pt-2">
              <p className="px-4 py-1 text-xs text-olive-400 font-medium uppercase tracking-wider">{t('nav.search')}</p>
              <div className="flex gap-2 px-4 pt-2">
                {ALL_LOCALES.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => { setLocale(loc); setIsMobileMenuOpen(false); }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      locale === loc ? 'bg-forest-100 text-forest-700' : 'bg-olive-50 text-olive-600'
                    }`}
                  >
                    {localeFlags[loc]} {loc.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-olive-100 my-2 pt-2">
              <Link
                href="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-olive-600 hover:bg-olive-50 font-medium transition-colors"
              >
                {t('nav.login')}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
