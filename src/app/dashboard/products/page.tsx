'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { mockProducts } from '@/lib/data/mock-data';
import { formatPrice, formatDateShort } from '@/lib/utils/helpers';
import { Plus, Edit, Trash2, Eye, Search, Leaf, Package } from 'lucide-react';

const producerProducts = mockProducts.filter((p) => p.producer_id === 'prod-001');

export default function DashboardProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = producerProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cream-gradient">
      <div className="section-padding page-padding">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-sans text-3xl font-bold text-olive-900">My Products</h1>
          <Link href="/dashboard/products/new" className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..." className="input-field pl-10 py-2.5 text-sm" />
        </div>

        {/* Products table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-olive-200 bg-olive-50/50">
                  <th className="text-left py-3 px-5 text-olive-500 font-medium">Product</th>
                  <th className="text-left py-3 px-5 text-olive-500 font-medium">Price</th>
                  <th className="text-left py-3 px-5 text-olive-500 font-medium">Stock</th>
                  <th className="text-left py-3 px-5 text-olive-500 font-medium">Status</th>
                  <th className="text-left py-3 px-5 text-olive-500 font-medium">Rating</th>
                  <th className="text-right py-3 px-5 text-olive-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b border-olive-50 hover:bg-olive-50/50 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-olive-100 to-olive-200 flex items-center justify-center flex-shrink-0">
                          <div className="w-5 h-8 rounded bg-gradient-to-b from-olive-300 to-olive-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-olive-900 truncate max-w-xs">{product.name}</p>
                          <p className="text-xs text-olive-500 flex items-center gap-1">
                            {product.olive_variety} • {product.volume_ml}ml
                            {product.organic && <Leaf className="w-3 h-3 text-olive-500" />}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 font-semibold text-olive-900">{formatPrice(product.price)}</td>
                    <td className="py-3 px-5">
                      <span className={`text-sm font-medium flex items-center gap-1 ${
                        product.stock < 40 ? 'text-red-600' : product.stock < 80 ? 'text-gold-600' : 'text-olive-600'
                      }`}>
                        <Package className="w-3.5 h-3.5" /> {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`badge ${product.is_published ? 'bg-olive-100 text-olive-700' : 'bg-gray-100 text-gray-600'}`}>
                        {product.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-olive-700">{product.avg_rating} ⭐</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/products/${product.slug}`}
                          className="p-2 rounded-lg hover:bg-olive-100 text-olive-500 transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button className="p-2 rounded-lg hover:bg-olive-100 text-olive-500 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-50 text-olive-500 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
