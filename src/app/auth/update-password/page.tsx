'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/stores/i18nStore';
import { Lock, ArrowRight, Check, ShieldCheck } from 'lucide-react';
import PasswordStrength, { isPasswordValid } from '@/components/auth/PasswordStrength';

export default function UpdatePasswordPage() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!isPasswordValid(password)) {
      setError('La contraseña no cumple los requisitos mínimos de seguridad.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'No se pudo actualizar la contraseña. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-gradient p-6">
        <div className="w-full max-w-md">
          <div className="card p-8 sm:p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-forest-600" />
            </div>
            <h1 className="font-sans text-2xl font-bold text-olive-900 mb-3 tracking-tight">
              ¡Contraseña actualizada!
            </h1>
            <p className="text-olive-600 text-sm mb-8 leading-relaxed">
              Tu contraseña se ha cambiado correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Link href="/auth/login" className="btn-primary w-full py-3 text-center inline-flex justify-center">
              Ir al inicio de sesión <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-gradient p-6">
      <div className="w-full max-w-md">
        <div className="card p-8 sm:p-10">
          <div className="w-14 h-14 rounded-2xl bg-olive-50 flex items-center justify-center mb-6">
            <Lock className="w-7 h-7 text-olive-600" />
          </div>
          <h1 className="font-sans text-2xl font-bold text-olive-900 mb-2">
            Nueva contraseña
          </h1>
          <p className="text-olive-600 text-sm mb-6">
            Introduce tu nueva contraseña. Asegúrate de que sea segura.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-olive-800 mb-1.5">Nueva contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                required
                minLength={8}
              />
              <PasswordStrength password={password} className="mt-3" />
            </div>

            <div>
              <label className="block text-sm font-medium text-olive-800 mb-1.5">Confirmar contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                required
                minLength={8}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden.</p>
              )}
              {confirmPassword && password === confirmPassword && password.length > 0 && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Las contraseñas coinciden.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid(password) || password !== confirmPassword}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Actualizar contraseña <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
