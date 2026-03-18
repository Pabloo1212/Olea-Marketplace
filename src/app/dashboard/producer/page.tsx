'use client';

import React from 'react';
import { Package, ShoppingBag, TrendingUp, Users, ArrowUpRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils/helpers';

export default function ProducerDashboardOverview() {
  const stats = [
    { label: 'Total Sales', value: formatPrice(12450), trend: '+12.5%', icon: TrendingUp },
    { label: 'Active Products', value: '45', trend: '+3', icon: Package },
    { label: 'Pending Orders', value: '12', trend: '-2', icon: ShoppingBag },
    { label: 'Total Customers', value: '890', trend: '+15%', icon: Users },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-olive-900 mb-2">Welcome back, Producer!</h1>
        <p className="text-olive-600">Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-olive-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-olive-50 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-olive-600" />
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
                <ArrowUpRight className="w-4 h-4" />
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-olive-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-olive-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders - Mock */}
      <div className="bg-white rounded-2xl border border-olive-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-olive-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-olive-900">Recent Orders</h2>
          <button className="text-sm font-medium text-gold-600 hover:text-gold-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-olive-50 text-olive-600 text-sm border-b border-olive-100">
                <th className="py-4 px-6 font-medium">Order ID</th>
                <th className="py-4 px-6 font-medium">Customer</th>
                <th className="py-4 px-6 font-medium">Date</th>
                <th className="py-4 px-6 font-medium">Amount</th>
                <th className="py-4 px-6 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-olive-800 divide-y divide-olive-100">
              {[1, 2, 3, 4].map((i) => (
                <tr key={i} className="hover:bg-olive-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium">#ORD-{Math.floor(Math.random() * 10000)}</td>
                  <td className="py-4 px-6">Customer Name</td>
                  <td className="py-4 px-6">Oct 24, 2024</td>
                  <td className="py-4 px-6 font-medium">{formatPrice(Math.random() * 200 + 50)}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                      Pending
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
