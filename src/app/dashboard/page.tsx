'use client';

import React from 'react';
import Link from 'next/link';
import { mockDashboardStats, mockOrders, mockProducts } from '@/lib/data/mock-data';
import { formatPrice, formatDateShort, getOrderStatusColor } from '@/lib/utils/helpers';
import {
  DollarSign, Package, ShoppingCart, TrendingUp,
  AlertTriangle, ArrowRight, BarChart3, Box,
} from 'lucide-react';

const stats = mockDashboardStats.producer;
const recentOrders = mockOrders.slice(0, 4);
const lowStockProducts = mockProducts.filter((p) => p.stock < 50).slice(0, 3);

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-cream-gradient">
      <div className="section-padding page-padding">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-sans text-3xl font-bold text-olive-900">Producer Dashboard</h1>
            <p className="text-olive-600 text-sm mt-1">Welcome back, Finca El Olivar</p>
          </div>
          <Link href="/dashboard/products/new" className="btn-primary text-sm">
            <Package className="w-4 h-4" /> Add Product
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Sales', value: formatPrice(stats.totalSales), icon: DollarSign, growth: `+${stats.monthlyGrowth}%`, color: 'olive' },
            { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, growth: null, color: 'blue' },
            { label: 'Active Products', value: stats.activeProducts, icon: Box, growth: null, color: 'purple' },
            { label: 'Pending Orders', value: stats.pendingOrders, icon: Package, growth: null, color: 'gold' },
          ].map(({ label, value, icon: Icon, growth, color }) => (
            <div key={label} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  color === 'olive' ? 'bg-olive-100' :
                  color === 'blue' ? 'bg-blue-100' :
                  color === 'purple' ? 'bg-purple-100' : 'bg-gold-100'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    color === 'olive' ? 'text-olive-600' :
                    color === 'blue' ? 'text-blue-600' :
                    color === 'purple' ? 'text-purple-600' : 'text-gold-600'
                  }`} />
                </div>
                {growth && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-olive-600 bg-olive-50 px-2 py-1 rounded-lg">
                    <TrendingUp className="w-3 h-3" /> {growth}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-olive-900">{value}</p>
              <p className="text-xs text-olive-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between p-5 border-b border-olive-100">
                <h2 className="font-sans text-lg font-bold text-olive-900">Recent Orders</h2>
                <Link href="/dashboard/orders" className="text-sm text-olive-600 hover:text-olive-800 flex items-center gap-1 transition-colors">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-olive-100">
                      <th className="text-left py-3 px-5 text-olive-500 font-medium">Order</th>
                      <th className="text-left py-3 px-5 text-olive-500 font-medium">Customer</th>
                      <th className="text-left py-3 px-5 text-olive-500 font-medium">Date</th>
                      <th className="text-left py-3 px-5 text-olive-500 font-medium">Total</th>
                      <th className="text-left py-3 px-5 text-olive-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-olive-50 hover:bg-olive-50/50 transition-colors">
                        <td className="py-3 px-5 font-medium text-olive-900">#{order.id.slice(-3)}</td>
                        <td className="py-3 px-5 text-olive-700">{order.shipping_name}</td>
                        <td className="py-3 px-5 text-olive-500">{formatDateShort(order.created_at)}</td>
                        <td className="py-3 px-5 font-semibold text-olive-900">{formatPrice(order.total_price)}</td>
                        <td className="py-3 px-5">
                          <span className={`${getOrderStatusColor(order.status)} badge capitalize`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick stats */}
            <div className="card p-5">
              <h3 className="font-sans text-base font-bold text-olive-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-olive-500" /> Monthly Revenue
              </h3>
              <p className="text-3xl font-bold text-olive-900 mb-1">{formatPrice(stats.totalRevenue)}</p>
              <p className="text-xs text-olive-500">Avg. order value: {formatPrice(stats.avgOrderValue)}</p>
              <div className="mt-4 h-20 flex items-end gap-1.5">
                {[40, 55, 35, 70, 60, 80, 65, 90, 75, 85, 95, 88].map((h, i) => (
                  <div key={i} className="flex-1 bg-olive-200 rounded-t-sm hover:bg-olive-400 transition-colors"
                    style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-olive-400 mt-1">
                <span>Jan</span><span>Jun</span><span>Dec</span>
              </div>
            </div>

            {/* Low stock */}
            <div className="card p-5">
              <h3 className="font-sans text-base font-bold text-olive-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gold-500" /> Low Stock Alert
              </h3>
              <div className="space-y-3">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <span className="text-sm text-olive-700 truncate flex-1 pr-3">{p.name}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                      p.stock < 40 ? 'bg-red-50 text-red-600' : 'bg-gold-50 text-gold-700'
                    }`}>
                      {p.stock} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
