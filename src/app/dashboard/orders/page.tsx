'use client';

import React from 'react';
import { mockOrders } from '@/lib/data/mock-data';
import { formatPrice, formatDateShort, getOrderStatusColor } from '@/lib/utils/helpers';
import { Package, Search, Filter } from 'lucide-react';

export default function DashboardOrdersPage() {
  return (
    <div className="min-h-screen bg-cream-gradient">
      <div className="section-padding page-padding">
        <h1 className="font-sans text-3xl font-bold text-olive-900 mb-8">Orders</h1>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
            <input type="text" placeholder="Search orders..." className="input-field pl-10 py-2.5 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            {['all', 'pending', 'paid', 'shipped', 'delivered'].map((status) => (
              <button key={status}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  status === 'all' ? 'bg-olive-700 text-white' : 'bg-white text-olive-600 border border-olive-200 hover:bg-olive-50'
                }`}>
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-olive-200 bg-olive-50/50">
                  <th className="text-left py-3 px-5 text-olive-500 font-medium">Order ID</th>
                  <th className="text-left py-3 px-5 text-olive-500 font-medium">Customer</th>
                  <th className="text-left py-3 px-5 text-olive-500 font-medium">Items</th>
                  <th className="text-left py-3 px-5 text-olive-500 font-medium">Total</th>
                  <th className="text-left py-3 px-5 text-olive-500 font-medium">Date</th>
                  <th className="text-left py-3 px-5 text-olive-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.map((order) => (
                  <tr key={order.id} className="border-b border-olive-50 hover:bg-olive-50/50 transition-colors cursor-pointer">
                    <td className="py-3 px-5 font-medium text-olive-900">#{order.id.slice(-3)}</td>
                    <td className="py-3 px-5">
                      <p className="text-olive-900">{order.shipping_name}</p>
                      <p className="text-xs text-olive-500">{order.shipping_city}, {order.shipping_country}</p>
                    </td>
                    <td className="py-3 px-5 text-olive-700">{order.items?.length || 0} items</td>
                    <td className="py-3 px-5 font-semibold text-olive-900">{formatPrice(order.total_price)}</td>
                    <td className="py-3 px-5 text-olive-500">{formatDateShort(order.created_at)}</td>
                    <td className="py-3 px-5">
                      <span className={`${getOrderStatusColor(order.status)} badge capitalize`}>{order.status}</span>
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
