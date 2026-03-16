import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream-gradient flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-olive-50 flex items-center justify-center mx-auto mb-5">
          <Compass className="w-8 h-8 text-olive-500" />
        </div>
        <h1 className="font-sans text-5xl font-bold text-olive-900 mb-2 tracking-tight">404</h1>
        <h2 className="font-sans text-xl font-bold text-olive-800 mb-3 tracking-tight">Page Not Found</h2>
        <p className="text-olive-600 text-sm mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="btn-primary py-2.5 px-5 text-sm">
            <ArrowLeft className="w-4 h-4" /> Go Home
          </Link>
          <Link href="/products" className="btn-secondary py-2.5 px-5 text-sm">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
