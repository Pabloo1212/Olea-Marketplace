'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push('/dashboard/products')}
          className="flex items-center gap-2 text-olive-600 hover:text-olive-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>
        
        <div className="card">
          <h1 className="text-2xl font-bold text-olive-900 mb-4">Edit Product</h1>
          <p className="text-olive-600">
            Product editing functionality will be implemented here. 
            For now, please use the product management page.
          </p>
        </div>
      </div>
    </div>
  );
}
