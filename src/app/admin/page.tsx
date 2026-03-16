'use client';

import React from 'react';
import Link from 'next/link';
import { mockDashboardStats, mockOrders, mockProducers } from '@/lib/data/mock-data';
import { formatPrice, formatDateShort, getOrderStatusColor } from '@/lib/utils/helpers';
import {
  DollarSign, Users, ShoppingCart, Package, TrendingUp,
  ArrowRight, Shield, CheckCircle, XCircle, Clock, BarChart3,
} from 'lucide-react';

const stats = mockDashboardStats.admin;

const pendingProducers = [
  { id: 'pp-1', company: 'Aceites del Sur', country: 'España', date: '2025-03-10T10:00:00Z' },
  { id: 'pp-2', company: 'Oliveira Premium', country: 'Portugal', date: '2025-03-12T10:00:00Z' },
  { id: 'pp-3', company: 'Crete Gold Oil', country: 'Greece', date: '2025-03-14T10:00:00Z' },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-cream-gradient">
      <div className="section-padding page-padding">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-sans text-3xl font-bold text-olive-900">Admin Dashboard</h1>
            <p className="text-olive-600 text-sm mt-1">Platform overview and management</p>
          </div>
          <span className="badge bg-red-100 text-red-700 text-sm">
            <Shield className="w-4 h-4" /> Admin Panel
          </span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, growth: `+${stats.monthlyGrowth}%`, color: 'olive' },
            { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, growth: null, color: 'blue' },
            { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, growth: null, color: 'purple' },
            { label: 'Commission Earned', value: formatPrice(stats.commissionEarned), icon: DollarSign, growth: null, color: 'gold' },
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
                <Link href="/admin/orders" className="text-sm text-olive-600 hover:text-olive-800 flex items-center gap-1 transition-colors">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-olive-100">
                      <th className="text-left py-3 px-5 text-olive-500 font-medium">Order</th>
                      <th className="text-left py-3 px-5 text-olive-500 font-medium">Customer</th>
                      <th className="text-left py-3 px-5 text-olive-500 font-medium">Total</th>
                      <th className="text-left py-3 px-5 text-olive-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockOrders.map((order) => (
                      <tr key={order.id} className="border-b border-olive-50 hover:bg-olive-50/50 transition-colors">
                        <td className="py-3 px-5 font-medium text-olive-900">#{order.id.slice(-3)}</td>
                        <td className="py-3 px-5 text-olive-700">{order.shipping_name}</td>
                        <td className="py-3 px-5 font-semibold text-olive-900">{formatPrice(order.total_price)}</td>
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

          {/* Pending Producers */}
          <div>
            <div className="card">
              <div className="flex items-center justify-between p-5 border-b border-olive-100">
                <h2 className="font-sans text-base font-bold text-olive-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gold-500" /> Pending Approval
                </h2>
                <span className="badge bg-gold-100 text-gold-800">{pendingProducers.length}</span>
              </div>
              <div className="p-4 space-y-3">
                {pendingProducers.map((prod) => (
                  <div key={prod.id} className="flex items-center justify-between p-3 rounded-xl bg-olive-50/50">
                    <div>
                      <p className="text-sm font-medium text-olive-900">{prod.company}</p>
                      <p className="text-xs text-olive-500">{prod.country} • {formatDateShort(prod.date)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button className="p-1.5 rounded-lg bg-olive-100 text-olive-600 hover:bg-olive-200 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 pt-0">
                <Link href="/admin/producers" className="btn-secondary w-full py-2 text-sm">
                  Manage Producers <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Quick stats */}
            <div className="card p-5 mt-6">
              <h3 className="font-sans text-base font-bold text-olive-900 mb-3">Platform Stats</h3>
              <div className="space-y-3">
                {[
                  { label: 'Active Producers', value: stats.totalProducers },
                  { label: 'Active Products', value: stats.activeProducts },
                  { label: 'Pending Approval', value: stats.pendingProducers },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-olive-600">{label}</span>
                    <span className="text-sm font-semibold text-olive-900">{value}</span>
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
