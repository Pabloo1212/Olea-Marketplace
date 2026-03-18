'use client';

import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Package, LayoutDashboard, Settings, LogOut, ShoppingBag, Plus } from 'lucide-react';

export default function ProducerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-olive-50 font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-olive-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-olive-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-olive-900 flex items-center justify-center">
              <span className="text-white font-bold text-sm">OM</span>
            </div>
            <span className="font-bold text-lg text-olive-900">Producer Hub</span>
          </Link>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1">
          <Link href="/dashboard/producer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-olive-900 bg-olive-50">
            <LayoutDashboard className="w-5 h-5 text-olive-500" />
            Overview
          </Link>
          <Link href="/dashboard/producer/products" className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-olive-600 hover:text-olive-900 hover:bg-olive-50 transition-colors">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-olive-400" />
              Products
            </div>
          </Link>
          <Link href="/dashboard/producer/products/new" className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-olive-600 hover:text-olive-900 hover:bg-olive-50 transition-colors ml-4 pl-4 border-l-2 border-olive-100">
            <div className="flex items-center gap-3">
              <Plus className="w-4 h-4 text-olive-400" />
              Add Product
            </div>
          </Link>
          <Link href="/dashboard/producer/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-olive-600 hover:text-olive-900 hover:bg-olive-50 transition-colors">
            <ShoppingBag className="w-5 h-5 text-olive-400" />
            Orders
          </Link>
          <Link href="/dashboard/producer/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-olive-600 hover:text-olive-900 hover:bg-olive-50 transition-colors">
            <Settings className="w-5 h-5 text-olive-400" />
            Store Settings
          </Link>
        </div>

        <div className="p-4 border-t border-olive-100">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-olive-200 p-4 flex items-center justify-between">
          <span className="font-bold text-lg text-olive-900">Producer Hub</span>
          <button className="p-2 text-olive-600 hover:bg-olive-50 rounded-lg">
            <LayoutDashboard className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
