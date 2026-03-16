'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect, useState } from 'react';

import esMessages from '@/messages/es.json';
import enMessages from '@/messages/en.json';
import itMessages from '@/messages/it.json';
import deMessages from '@/messages/de.json';

export type Locale = 'es' | 'en' | 'it' | 'de';

const messagesMap: Record<Locale, Record<string, unknown>> = {
  es: esMessages,
  en: enMessages,
  it: itMessages,
  de: deMessages,
};

export const localeLabels: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  it: 'Italiano',
  de: 'Deutsch',
};

export const localeFlags: Record<Locale, string> = {
  es: '🇪🇸',
  en: '🇬🇧',
  it: '🇮🇹',
  de: '🇩🇪',
};

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: 'es', // Default, will be hydrated
      setLocale: (locale: Locale) => set({ locale }),
    }),
    { name: 'olive-locale' }
  )
);

/**
 * Get a nested value from an object using a dot-separated path. 
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // fallback: return the key itself
    }
  }
  return typeof current === 'string' ? current : path;
}

/**
 * Hook that returns a translation function `t(key)` for the current locale.
 * Uses hydration safety to prevent React hydration mismatch errors.
 */
export function useTranslation() {
  const storeLocale = useI18nStore((s) => s.locale);
  const [locale, setLocale] = useState<Locale>('es');

  // Hydrate only after mount to prevent mismatch with server
  useEffect(() => {
    setLocale(storeLocale);
  }, [storeLocale]);

  const messages = messagesMap[locale];

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    let value = getNestedValue(messages, key);
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return value;
  };

  return { t, locale };
}
