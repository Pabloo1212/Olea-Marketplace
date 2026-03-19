'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/stores/i18nStore';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldAlert } from 'lucide-react';

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

export default function LoginPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Rate limiting state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutEnd, setLockoutEnd] = useState<number | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle error from auth callback redirect
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'auth_failed') {
      setError(t('auth.authFailed') || 'Error de autenticación. Inténtalo de nuevo.');
    }
  }, [searchParams, t]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutEnd) {
      const tick = () => {
        const remaining = Math.max(0, Math.ceil((lockoutEnd - Date.now()) / 1000));
        setLockoutRemaining(remaining);
        if (remaining <= 0) {
          setLockoutEnd(null);
          setFailedAttempts(0);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      };
      tick();
      timerRef.current = setInterval(tick, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [lockoutEnd]);

  const isLockedOut = lockoutEnd !== null && Date.now() < lockoutEnd;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Generic error message — never reveal whether email exists or password is wrong
        const attempts = failedAttempts + 1;
        setFailedAttempts(attempts);

        if (attempts >= MAX_ATTEMPTS) {
          setLockoutEnd(Date.now() + LOCKOUT_SECONDS * 1000);
          setError(`Demasiados intentos fallidos. Espera ${LOCKOUT_SECONDS} segundos.`);
        } else {
          setError('Email o contraseña incorrectos.');
        }
        setIsLoading(false);
        return;
      }

      // Success — reset attempts
      setFailedAttempts(0);
      window.location.href = '/';
    } catch (err: any) {
      setError('Ha ocurrido un error. Inténtalo de nuevo.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError('No se pudo iniciar sesión con Google.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left – Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2.5 mb-10">
            <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="url(#login-logo)" />
              <path d="M12 20c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8z" stroke="white" strokeWidth="2.2" fill="none" />
              <path d="M20 14v12M16 18l4-4 4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <defs><linearGradient id="login-logo" x1="0" y1="0" x2="40" y2="40"><stop stopColor="#1e293b" /><stop offset="1" stopColor="#334155" /></linearGradient></defs>
            </svg>
            <span className="font-sans font-bold text-xl text-olive-900 tracking-tight">OliveMarket</span>
          </Link>

          <h1 className="font-sans text-3xl font-bold text-olive-900 mb-2 tracking-tight">{t('auth.welcomeBack')}</h1>
          <p className="text-olive-500 mb-8">{t('auth.signInSubtitle')}</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-olive-800 mb-1.5">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  required
                  disabled={isLockedOut}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-olive-800">{t('auth.password')}</label>
                <Link href="/auth/reset-password" className="text-xs text-olive-500 hover:text-olive-700 transition-colors">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  required
                  disabled={isLockedOut}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-olive-400 hover:text-olive-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isLockedOut}
              className="btn-primary w-full py-3.5 text-base"
            >
              {isLockedOut ? (
                <span className="tabular-nums">Bloqueado ({lockoutRemaining}s)</span>
              ) : isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>{t('auth.signIn')} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-olive-200" />
            <span className="text-xs text-olive-400 font-medium">{t('auth.or')}</span>
            <div className="flex-1 h-px bg-olive-200" />
          </div>

          {/* Social Login — Google only */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-olive-200 rounded-xl text-sm font-medium text-olive-800 hover:bg-olive-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t('auth.continueGoogle')}
          </button>

          <p className="text-center text-sm text-olive-600 mt-8">
            {t('auth.noAccount')}{' '}
            <Link href="/auth/register" className="text-olive-800 font-semibold hover:underline">
              {t('auth.createOne')}
            </Link>
          </p>
        </div>
      </div>

      {/* Right – Decorative */}
      <div className="hidden lg:flex flex-1 bg-olive-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-olive-950 via-olive-900 to-olive-800" />
        <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCA0LTRzNCAxIDQgNC0yIDQtNCA0LTQtMi00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />
        <div className="relative z-10 max-w-md text-center px-10">
          <div className="w-24 h-24 rounded-3xl bg-olive-gradient flex items-center justify-center mx-auto mb-8 shadow-xl">
            <svg className="w-12 h-12" viewBox="0 0 40 40" fill="none">
              <path d="M12 20c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8z" stroke="white" strokeWidth="2" fill="none" />
              <path d="M20 14v12M16 18l4-4 4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-sans text-3xl font-bold text-white mb-4 tracking-tight">{t('auth.tagline')}</h2>
          <p className="text-olive-300 leading-relaxed">
            {t('auth.signInSubtitle')}
          </p>
        </div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-olive-700/20 blur-3xl" />
        <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-gold-500/10 blur-3xl" />
      </div>
    </div>
  );
}
