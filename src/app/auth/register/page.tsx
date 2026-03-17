'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { useTranslation } from '@/stores/i18nStore';
import { Eye, EyeOff, Mail, Lock, User, Building2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'customer' | 'producer'>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getSupabase = () => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && role === 'producer') {
      setStep(2);
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const supabase = getSupabase();
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role,
            company_name: companyName,
            country: country,
          }
        }
      });
      
      if (error) throw error;
      
      // Redirect to home after successful signup
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || t('auth.createAccount'));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left – Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2.5 mb-10">
            <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="url(#reg-logo)" />
              <path d="M12 20c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8z" stroke="white" strokeWidth="2.2" fill="none" />
              <path d="M20 14v12M16 18l4-4 4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <defs><linearGradient id="reg-logo" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#1e293b" /><stop offset="1" stopColor="#334155" /></linearGradient></defs>
            </svg>
            <span className="font-sans font-bold text-xl text-olive-900 tracking-tight">OliveMarket</span>
          </Link>

          <h1 className="font-sans text-3xl font-bold text-olive-900 mb-2 tracking-tight">{t('auth.createAccount')}</h1>
          <p className="text-olive-500 mb-8">{t('auth.createSubtitle')}</p>

          {/* Step indicator for producers */}
          {role === 'producer' && (
            <div className="flex items-center gap-3 mb-8">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    s <= step ? 'bg-olive-700 text-white' : 'bg-olive-100 text-olive-400'
                  }`}>
                    {s < step ? <Check className="w-4 h-4" /> : s}
                  </div>
                  <span className={`text-xs font-medium ${s <= step ? 'text-olive-800' : 'text-olive-400'}`}>
                    {s === 1 ? t('auth.signUp') : t('auth.producer')}
                  </span>
                  {s < 2 && <div className={`w-8 h-0.5 ${s < step ? 'bg-olive-600' : 'bg-olive-200'}`} />}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              {/* Role selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { value: 'customer' as const, icon: User, label: t('auth.customer'), desc: t('auth.customerDesc') },
                  { value: 'producer' as const, icon: Building2, label: t('auth.producer'), desc: t('auth.producerDesc') },
                ].map(({ value, icon: Icon, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => setRole(value)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      role === value
                        ? 'border-olive-600 bg-olive-50/50'
                        : 'border-olive-200 hover:border-olive-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${role === value ? 'text-olive-700' : 'text-olive-400'}`} />
                    <p className="font-semibold text-sm text-olive-900">{label}</p>
                    <p className="text-xs text-olive-500">{desc}</p>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1.5">{t('auth.name')}</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder={t('auth.name')} className="input-field pl-10" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1.5">{t('auth.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" className="input-field pl-10" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1.5">{t('auth.password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                      className="input-field pl-10 pr-10" required minLength={8} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-olive-400 hover:text-olive-600 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-base">
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>{t('auth.signUp')} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-olive-800 mb-1.5">{t('auth.producer')}</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={t('auth.producerDesc')} className="input-field pl-10" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-olive-800 mb-1.5">{t('checkout.country')}</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="input-field" required>
                  <option value="">{t('checkout.selectCountry')}</option>
                  <option value="España">España</option>
                  <option value="Italia">Italia</option>
                  <option value="Greece">Greece</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">
                  ←
                </button>
                <button type="submit" disabled={isLoading} className="btn-primary flex-1 py-3">
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>{t('auth.signUp')} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>
          )}


          <p className="text-center text-sm text-olive-600 mt-8">
            {t('auth.hasAccount')}{' '}
            <Link href="/auth/login" className="text-olive-800 font-semibold hover:underline">
              {t('auth.signInLink')}
            </Link>
          </p>
        </div>
      </div>

      {/* Right – Decorative */}
      <div className="hidden lg:flex flex-1 bg-olive-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-olive-950 via-olive-900 to-olive-800" />
        <div className="relative z-10 max-w-md text-center px-10">
          <div className="w-24 h-24 rounded-3xl bg-olive-gradient flex items-center justify-center mx-auto mb-8 shadow-xl">
            <svg className="w-12 h-12" viewBox="0 0 40 40" fill="none">
              <path d="M12 20c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8z" stroke="white" strokeWidth="2" fill="none" />
              <path d="M20 14v12M16 18l4-4 4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-sans text-3xl font-bold text-white mb-4 tracking-tight">{t('auth.tagline')}</h2>
          <p className="text-olive-300 leading-relaxed">
            {t('auth.createSubtitle')}
          </p>
        </div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-olive-700/20 blur-3xl" />
        <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-gold-500/10 blur-3xl" />
      </div>
    </div>
  );
}
