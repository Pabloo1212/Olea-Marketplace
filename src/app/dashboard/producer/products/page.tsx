'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils/helpers';
import { mockProducts } from '@/lib/data/mock-data';
import { Product } from '@/lib/types/database';

export default function ProducerProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // In a real app, we'd fetch only products belonging to the logged-in producer
  // For the MVP, we show products filtered by one mock producer
  const producerProducts = mockProducts
    .filter((p: Product) => p.producer_id === 'prod-001')
    .filter((p: Product) => 
      searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-olive-900 mb-1">Products</h1>
          <p className="text-sm text-olive-600">Manage your product catalog and inventory.</p>
        </div>
        <Link href="/dashboard/producer/products/new" className="btn-primary py-2.5">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Filters/Search */}
      <div className="bg-white p-4 rounded-xl border border-olive-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-olive-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-olive-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select className="bg-olive-50 border-none rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-olive-500 outline-none cursor-pointer">
            <option value="">All Categories</option>
            <option value="extra_virgin">Extra Virgin</option>
            <option value="organic">Organic</option>
            <option value="flavored">Flavored</option>
          </select>
          <select className="bg-olive-50 border-none rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-olive-500 outline-none cursor-pointer">
            <option value="">Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="outofstock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl border border-olive-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-olive-50 text-olive-600 text-xs uppercase tracking-wider border-b border-olive-100">
                <th className="py-4 px-6 font-semibold">Product</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold">Inventory</th>
                <th className="py-4 px-6 font-semibold">Price</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-olive-800 divide-y divide-olive-100">
              {producerProducts.map((product: Product) => (
                <tr key={product.id} className="hover:bg-olive-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-olive-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <Package className="w-5 h-5 text-olive-300" />
                      </div>
                      <div>
                        <p className="font-semibold text-olive-900 group-hover:text-gold-600 transition-colors">{product.name}</p>
                        <p className="text-xs text-olive-500 mt-0.5">{product.olive_variety}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.is_published ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={product.stock < 10 ? 'text-red-600 font-medium' : ''}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium text-olive-900">
                    {formatPrice(product.price)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/products/${product.slug}`} className="p-1.5 text-olive-400 hover:text-olive-900 hover:bg-olive-100 rounded-md transition-colors" title="View in store">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button className="p-1.5 text-olive-400 hover:text-olive-900 hover:bg-olive-100 rounded-md transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {producerProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-olive-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-olive-200" />
                    <p className="text-lg font-medium text-olive-900 mb-1">No products found</p>
                    <p className="text-sm mb-4">You haven&apos;t added any products to your store yet.</p>
                    <Link href="/dashboard/producer/products/new" className="btn-primary py-2.5 inline-flex">
                      <Plus className="w-4 h-4" /> Add Your First Product
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
