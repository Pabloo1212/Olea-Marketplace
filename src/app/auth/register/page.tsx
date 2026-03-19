'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/stores/i18nStore';
import { Eye, EyeOff, Mail, Lock, User, Building2, ArrowRight, Check, MailCheck } from 'lucide-react';
import PasswordStrength, { isPasswordValid } from '@/components/auth/PasswordStrength';

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
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isGoogleSignupInit, setIsGoogleSignupInit] = useState(false);

  const canSubmitStep1 = name && email && password && isPasswordValid(password) && acceptedTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && role === 'producer') {
      setStep(2);
      return;
    }

    if (!acceptedTerms) {
      setError('Debes aceptar los Términos y la Política de Privacidad.');
      return;
    }

    if (!isPasswordValid(password)) {
      setError('La contraseña no cumple los requisitos mínimos de seguridad.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: name,
            role: role,
            company_name: companyName,
            country: country,
          }
        }
      });

      if (error) {
        // Generic error — never reveal if email already exists
        setError('No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo.');
        setIsLoading(false);
        return;
      }

      // Show verification message instead of redirecting
      setSignupSuccess(true);
    } catch (err: any) {
      setError('Ha ocurrido un error inesperado. Inténtalo de nuevo.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!acceptedTerms) {
      setError('Debes aceptar los Términos y la Política de Privacidad.');
      return;
    }

    if (role === 'producer' && step === 1) {
      setIsGoogleSignupInit(true);
      setStep(2);
      return;
    }

    try {
      // Save user intent to a cookie so the callback route can create the profile correctly
      const dataToSave = {
        role,
        company_name: companyName,
        country,
      };
      document.cookie = `oauth_signup_data=${encodeURIComponent(JSON.stringify(dataToSave))}; path=/; max-age=3600`;

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

  // Success state — email verification message
  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-gradient p-6">
        <div className="w-full max-w-md">
          <div className="card p-8 sm:p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-6">
              <MailCheck className="w-8 h-8 text-forest-600" />
            </div>
            <h1 className="font-sans text-2xl font-bold text-olive-900 mb-3 tracking-tight">
              {t('auth.checkEmail') || '¡Revisa tu correo!'}
            </h1>
            <p className="text-olive-600 text-sm mb-2 leading-relaxed">
              {t('auth.verificationSent') || 'Te hemos enviado un enlace de verificación a:'}
            </p>
            <p className="font-semibold text-olive-900 mb-6">{email}</p>
            <p className="text-olive-500 text-xs mb-8 leading-relaxed">
              {t('auth.verificationInstructions') || 'Haz clic en el enlace del correo para activar tu cuenta. Si no lo ves, revisa tu carpeta de spam.'}
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/auth/login" className="btn-primary w-full py-3 text-center">
                {t('auth.returnToSignIn') || 'Volver al inicio de sesión'}
              </Link>
              <Link href="/auth/verify" className="text-sm text-olive-500 hover:text-olive-700 transition-colors">
                {t('auth.didntReceiveEmail') || '¿No recibiste el correo? Reenviar'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  {/* Password strength indicator */}
                  <PasswordStrength password={password} className="mt-3" />
                </div>

                {/* Terms of Service */}
                <label className="flex items-start gap-3 cursor-pointer py-2">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-olive-300 text-olive-600 focus:ring-olive-500"
                  />
                  <span className="text-xs text-olive-600 leading-relaxed">
                    Acepto los{' '}
                    <Link href="/terms" className="text-olive-800 font-semibold underline hover:text-olive-900">
                      Términos de Servicio
                    </Link>{' '}
                    y la{' '}
                    <Link href="/privacy" className="text-olive-800 font-semibold underline hover:text-olive-900">
                      Política de Privacidad
                    </Link>
                    .
                  </span>
                </label>

                <button type="submit" disabled={isLoading || (role === 'customer' && !canSubmitStep1)} className="btn-primary w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>{role === 'producer' ? 'Siguiente paso' : t('auth.signUp')} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-olive-200" />
                <span className="text-xs text-olive-400 font-medium">{t('auth.or')}</span>
                <div className="flex-1 h-px bg-olive-200" />
              </div>

              {/* Google signup */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-olive-200 rounded-xl text-sm font-medium text-olive-800 hover:bg-olive-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {role === 'producer' ? 'Continuar con Google (Paso 1)' : t('auth.continueGoogle')}
              </button>
            </>
          )}

          {step === 2 && (
            <form onSubmit={(e) => {
              e.preventDefault();
              if (isGoogleSignupInit) {
                handleGoogleSignup();
              } else {
                handleSubmit(e);
              }
            }} className="space-y-4">
              {isGoogleSignupInit && (
                <div className="bg-olive-50 border border-olive-200 text-olive-800 text-sm rounded-xl px-4 py-3 mb-4">
                  Por favor, rellena los datos de tu empresa antes de terminar el registro con Google.
                </div>
              )}
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

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => { setStep(1); setIsGoogleSignupInit(false); }} className="btn-secondary flex-1 py-3">
                  ← Volver
                </button>
                <button type="submit" disabled={isLoading || !companyName || !country} className="btn-primary flex-1 py-3">
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>{isGoogleSignupInit ? 'Finalizar con Google' : t('auth.signUp')} <ArrowRight className="w-4 h-4" /></>
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
