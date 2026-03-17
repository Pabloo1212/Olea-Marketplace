'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/stores/i18nStore';
import { Mail, ArrowLeft, ArrowRight, Check } from 'lucide-react';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setSent(true);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-gradient p-6">
      <div className="w-full max-w-md">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-olive-500 hover:text-olive-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t('auth.returnToSignIn')}
        </Link>

        <div className="card p-8 sm:p-10">
          {!sent ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-olive-50 flex items-center justify-center mb-6">
                <Mail className="w-7 h-7 text-olive-600" />
              </div>
              <h1 className="font-sans text-2xl font-bold text-olive-900 mb-2">{t('auth.resetTitle')}</h1>
              <p className="text-olive-600 text-sm mb-6">
                {t('auth.resetSubtitle')}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1.5">{t('auth.email')}</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" className="input-field" required />
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>{t('auth.sendResetLink')} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-olive-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-olive-600" />
              </div>
              <h2 className="font-sans text-2xl font-bold text-olive-900 mb-2">{t('auth.checkEmail')}</h2>
              <p className="text-olive-600 text-sm mb-6">
                {t('auth.resetSent')} <strong>{email}</strong>.
              </p>
              <Link href="/auth/login" className="btn-primary">
                {t('auth.returnToSignIn')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
