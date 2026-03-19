'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface Rule {
  label: string;
  test: (pw: string) => boolean;
}

const rules: Rule[] = [
  { label: 'Mínimo 8 caracteres', test: (pw) => pw.length >= 8 },
  { label: 'Una letra mayúscula', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Un número', test: (pw) => /[0-9]/.test(pw) },
  { label: 'Un carácter especial (!@#$...)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

export function getPasswordScore(password: string): number {
  if (!password) return 0;
  return rules.filter((r) => r.test(password)).length;
}

export function isPasswordValid(password: string): boolean {
  return getPasswordScore(password) >= 3; // At least 3 of 4 rules
}

const strengthConfig = [
  { label: 'Muy débil', color: 'bg-red-500', textColor: 'text-red-600' },
  { label: 'Débil', color: 'bg-orange-500', textColor: 'text-orange-600' },
  { label: 'Aceptable', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
  { label: 'Buena', color: 'bg-lime-500', textColor: 'text-lime-600' },
  { label: 'Excelente', color: 'bg-green-500', textColor: 'text-green-600' },
];

export default function PasswordStrength({ password, className = '' }: PasswordStrengthProps) {
  const score = getPasswordScore(password);
  const config = strengthConfig[score];

  if (!password) return null;

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Strength bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? config.color : 'bg-olive-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${config.textColor}`}>{config.label}</p>

      {/* Rules checklist */}
      <ul className="space-y-1">
        {rules.map((rule) => {
          const passed = rule.test(password);
          return (
            <li key={rule.label} className="flex items-center gap-2 text-xs">
              {passed ? (
                <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 text-olive-300 flex-shrink-0" />
              )}
              <span className={passed ? 'text-olive-700' : 'text-olive-400'}>{rule.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
