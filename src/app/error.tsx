'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-cream-gradient flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="font-sans text-2xl font-bold text-olive-900 mb-2 tracking-tight">Something went wrong</h1>
        <p className="text-olive-600 text-sm mb-6">
          We encountered an unexpected error. Please try again or return to the homepage.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="btn-primary py-2.5 px-5 text-sm">
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <Link href="/" className="btn-secondary py-2.5 px-5 text-sm">
            <ArrowLeft className="w-4 h-4" /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
