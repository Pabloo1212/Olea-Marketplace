'use client';

import React, { useState } from 'react';
import { mockProducers } from '@/lib/data/mock-data';
import { formatDateShort } from '@/lib/utils/helpers';
import { Users, Search, Shield, CheckCircle, XCircle, Eye, Mail, MoreHorizontal } from 'lucide-react';

const mockUsers = [
  { id: 'u1', name: 'Carlos Martínez', email: 'carlos@example.com', role: 'customer', status: 'active', created_at: '2024-06-15T10:00:00Z', orders: 12 },
  { id: 'u2', name: 'María García', email: 'maria@example.com', role: 'customer', status: 'active', created_at: '2024-07-20T10:00:00Z', orders: 8 },
  { id: 'u3', name: 'Finca El Olivar', email: 'finca@olivar.es', role: 'producer', status: 'active', created_at: '2024-01-10T10:00:00Z', orders: 0 },
  { id: 'u4', name: 'Giuseppe Rossi', email: 'giuseppe@toscana.it', role: 'producer', status: 'active', created_at: '2024-03-05T10:00:00Z', orders: 0 },
  { id: 'u5', name: 'Anna Kowalski', email: 'anna@example.com', role: 'customer', status: 'suspended', created_at: '2024-09-01T10:00:00Z', orders: 2 },
  { id: 'u6', name: 'João Silva', email: 'joao@alentejo.pt', role: 'producer', status: 'pending', created_at: '2025-02-28T10:00:00Z', orders: 0 },
];

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filtered = mockUsers.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-cream-gradient">
      <div className="section-padding page-padding">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-sans text-3xl font-bold text-olive-900">User Management</h1>
            <p className="text-olive-600 text-sm mt-1">{mockUsers.length} total users</p>
          </div>
          <span className="badge bg-red-100 text-red-700 text-sm">
            <Shield className="w-4 h-4" /> Admin Only
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..." className="input-field pl-10 py-2.5 text-sm" />
          </div>
          <div className="flex gap-2">
            {['all', 'customer', 'producer'].map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  roleFilter === r ? 'bg-olive-700 text-white' : 'bg-white text-olive-600 border border-olive-200 hover:bg-olive-50'
                }`}>
                {r === 'all' ? 'All Users' : r + 's'}
              </button>
            ))}
          </div>
        </div>

        {/* Users table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-olive-200 bg-olive-50/50">
                  <th className="text-left py-3 px-5 text-olive-500 font-medium">User</th>
                  <th className="text-left py-3 px-5 text-olive-500 font-medium">Role</th>
                  <th className="text-left py-3 px-5 text-olive-500 font-medium">Status</th>
                  <th className="text-left py-3 px-5 text-olive-500 font-medium">Joined</th>
                  <th className="text-left py-3 px-5 text-olive-500 font-medium">Orders</th>
                  <th className="text-right py-3 px-5 text-olive-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-olive-50 hover:bg-olive-50/50 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-olive-200 to-olive-300 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-olive-700">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-olive-900">{user.name}</p>
                          <p className="text-xs text-olive-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`badge capitalize ${
                        user.role === 'producer' ? 'bg-purple-100 text-purple-700' : 'bg-olive-100 text-olive-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`badge capitalize ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' :
                        user.status === 'pending' ? 'bg-gold-100 text-gold-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-olive-500">{formatDateShort(user.created_at)}</td>
                    <td className="py-3 px-5 text-olive-700">{user.orders}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button className="p-2 rounded-lg hover:bg-olive-100 text-olive-500 transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-olive-100 text-olive-500 transition-colors" title="Email">
                          <Mail className="w-4 h-4" />
                        </button>
                        {user.status === 'pending' && (
                          <button className="p-2 rounded-lg hover:bg-green-100 text-olive-500 hover:text-green-600 transition-colors" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {user.status === 'active' && (
                          <button className="p-2 rounded-lg hover:bg-red-50 text-olive-500 hover:text-red-500 transition-colors" title="Suspend">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
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
