'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/stores/i18nStore';
import { MailCheck, ArrowLeft, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsResending(true);
    setError('');
    setResent(false);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      setResent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-gradient p-6">
      <div className="w-full max-w-md">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-olive-500 hover:text-olive-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t('auth.returnToSignIn') || 'Volver al inicio de sesión'}
        </Link>

        <div className="card p-8 sm:p-10">
          <div className="w-14 h-14 rounded-2xl bg-forest-50 flex items-center justify-center mb-6">
            <MailCheck className="w-7 h-7 text-forest-600" />
          </div>
          
          <h1 className="font-sans text-2xl font-bold text-olive-900 mb-2">
            {t('auth.verifyTitle') || 'Verificar correo electrónico'}
          </h1>
          <p className="text-olive-600 text-sm mb-6 leading-relaxed">
            {t('auth.verifySubtitle') || 'Introduce tu correo electrónico para reenviar el enlace de verificación.'}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {resent && (
            <div className="bg-forest-50 border border-forest-200 text-forest-700 text-sm rounded-xl px-4 py-3 mb-4">
              {t('auth.verificationResent') || '¡Correo de verificación reenviado! Revisa tu bandeja de entrada.'}
            </div>
          )}

          <form onSubmit={handleResend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-olive-800 mb-1.5">
                {t('auth.email') || 'Correo electrónico'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isResending}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {isResending ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  {t('auth.resendVerification') || 'Reenviar verificación'}
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-olive-400 mt-6 text-center leading-relaxed">
            {t('auth.verificationNote') || 'Si ya verificaste tu correo, puedes iniciar sesión directamente.'}
          </p>
        </div>
      </div>
    </div>
  );
}
