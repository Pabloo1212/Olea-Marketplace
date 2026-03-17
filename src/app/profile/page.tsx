'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/stores/i18nStore';
import { mockOrders } from '@/lib/data/mock-data';
import { formatPrice, formatDateShort, getOrderStatusColor, getInitials } from '@/lib/utils/helpers';
import {
  User, Mail, MapPin, Calendar, Edit, Package,
  Heart, Settings, LogOut, CreditCard, Bell, ShieldCheck, Award
} from 'lucide-react';

const mockUser = {
  name: 'Carlos Martínez',
  email: 'carlos@example.com',
  avatar_url: null,
  country: 'España',
  city: 'Jaén',
  created_at: '2024-06-15T10:00:00Z',
  role: 'customer',
  points: 1250,
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('orders');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: mockUser.name,
    email: mockUser.email,
    city: mockUser.city,
    country: mockUser.country,
  });

  const userOrders = mockOrders.slice(0, 5);

  const handleLogout = async () => {
    const { createBrowserClient } = await import('@supabase/ssr');
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleSave = () => {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleEditProfile = () => {
    setActiveTab('settings');
    setEditing(true);
  };

  const tabs = [
    { id: 'orders', label: t('profile.myOrders'), icon: Package },
    { id: 'olive-club', label: t('profile.oliveClub'), icon: Award },
    { id: 'wishlist', label: t('profile.wishlist'), icon: Heart },
    { id: 'settings', label: t('profile.settings'), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-cream-gradient">
      <div className="section-padding page-padding">
        {/* Profile Header */}
        <div className="card p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-olive-200 to-olive-400 flex items-center justify-center ring-4 ring-white shadow-xl flex-shrink-0">
              <span className="font-sans font-bold text-white text-2xl">
                {getInitials(mockUser.name)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-sans text-2xl font-bold text-olive-900">{mockUser.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-olive-600">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-olive-400" /> {mockUser.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-olive-400" /> {mockUser.city}, {mockUser.country}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-olive-400" /> {t('profile.memberSince')} {formatDateShort(mockUser.created_at)}
                    </span>
                  </div>
                </div>
                <button onClick={handleEditProfile}
                  className="btn-secondary py-2 px-4 text-sm hidden sm:flex">
                  <Edit className="w-4 h-4" /> {t('profile.editProfile')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-olive-100 max-w-lg">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-olive-700 text-white shadow-sm'
                  : 'text-olive-600 hover:bg-olive-50'
              }`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-olive-100">
              <h2 className="font-sans text-lg font-bold text-olive-900">{t('profile.orderHistory')}</h2>
            </div>
            {userOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-olive-100">
                      <th className="text-left py-3 px-5 text-olive-500 font-medium">{t('profile.order')}</th>
                      <th className="text-left py-3 px-5 text-olive-500 font-medium">{t('profile.date')}</th>
                      <th className="text-left py-3 px-5 text-olive-500 font-medium">{t('profile.items')}</th>
                      <th className="text-left py-3 px-5 text-olive-500 font-medium">{t('profile.total')}</th>
                      <th className="text-left py-3 px-5 text-olive-500 font-medium">{t('profile.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userOrders.map((order) => (
                      <tr key={order.id} className="border-b border-olive-50 hover:bg-olive-50/50 transition-colors">
                        <td className="py-3 px-5 font-medium text-olive-900">#{order.id.slice(-3)}</td>
                        <td className="py-3 px-5 text-olive-500">{formatDateShort(order.created_at)}</td>
                        <td className="py-3 px-5 text-olive-700">{order.items?.length || 0} {t('profile.items').toLowerCase()}</td>
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
            ) : (
              <div className="p-8 text-center text-olive-500">
                <Package className="w-10 h-10 mx-auto mb-3 text-olive-300" />
                <p>{t('profile.noOrders')}</p>
                <Link href="/products" className="btn-primary mt-4 inline-flex">{t('profile.browseProducts')}</Link>
              </div>
            )}
          </div>
        )}

        {/* The Olive Club Tab */}
        {activeTab === 'olive-club' && (
          <div className="space-y-6">
            <div className="card p-8 bg-gradient-to-br from-olive-900 to-forest-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-forest-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gold-300 text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-sm border border-white/5">
                    <Award className="w-3.5 h-3.5" /> {t('profile.oliveClub')}
                  </div>
                  <h3 className="font-serif text-3xl font-bold mb-2">{t('profile.level')}: {t('profile.expert')}</h3>
                  <p className="text-olive-200 text-sm max-w-sm">
                    {t('profile.pointsToNext', { points: '750' })} <span className="text-gold-400 font-semibold">{t('profile.sommelierMaster')}</span>.
                  </p>
                </div>
                
                <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 min-w-[200px]">
                  <div className="text-sm text-gold-200 font-medium uppercase tracking-widest mb-1">{t('profile.yourPoints')}</div>
                  <div className="text-5xl font-serif font-bold text-white mb-2">{mockUser.points}</div>
                  <div className="w-full bg-olive-950/50 rounded-full h-2 mb-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-gold-600 to-gold-400 h-2 rounded-full" style={{ width: '62.5%' }}></div>
                  </div>
                  <div className="text-xs text-olive-300 flex justify-between">
                    <span>0</span>
                    <span>2000</span>
                  </div>
                </div>
              </div>
            </div>

            <h4 className="font-serif text-xl font-bold text-olive-900 mt-8 mb-4">{t('profile.myBadges')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-olive-100 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#CD7F32] to-[#8c5622] flex items-center justify-center shadow-lg shadow-[#CD7F32]/20 mb-4 border-2 border-white ring-2 ring-[#CD7F32]/30">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h5 className="font-bold text-olive-900 mb-1">{t('profile.umbriaBadge')}</h5>
                <p className="text-xs text-olive-500">{t('profile.umbriaDesc')}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-olive-100 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow opacity-100">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E2E8F0] to-[#94A3B8] flex items-center justify-center shadow-lg shadow-slate-400/20 mb-4 border-2 border-white ring-2 ring-slate-300">
                  <Calendar className="w-8 h-8 text-slate-700" />
                </div>
                <h5 className="font-bold text-olive-900 mb-1">{t('profile.harvestBadge')}</h5>
                <p className="text-xs text-olive-500">{t('profile.harvestDesc')}</p>
              </div>

              <div className="bg-olive-50 p-6 rounded-2xl border border-dashed border-olive-200 flex flex-col items-center text-center opacity-70">
                <div className="w-16 h-16 rounded-full bg-olive-100 flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-olive-300" />
                </div>
                <h5 className="font-bold text-olive-500 mb-1">{t('profile.sommelierMaster')}</h5>
                <p className="text-xs text-olive-400">{t('profile.lockedBadge')}</p>
                <button className="mt-4 text-xs font-bold text-gold-600 hover:text-gold-700 uppercase tracking-widest">
                  {t('profile.seeHow')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="card p-8 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-olive-300" />
            <h3 className="font-sans text-lg font-bold text-olive-900 mb-2">{t('profile.yourWishlist')}</h3>
            <p className="text-olive-600 text-sm mb-4">{t('profile.wishlistDesc')}</p>
            <Link href="/products" className="btn-primary inline-flex">{t('profile.exploreProducts')}</Link>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-sans text-lg font-bold text-olive-900 mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-olive-500" /> {t('profile.personalInfo')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1">{t('profile.fullName')}</label>
                  <input type="text" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    readOnly={!editing}
                    className={`input-field ${!editing ? 'bg-olive-50 cursor-not-allowed' : ''}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1">{t('profile.email')}</label>
                  <input type="email" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    readOnly={!editing}
                    className={`input-field ${!editing ? 'bg-olive-50 cursor-not-allowed' : ''}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1">{t('profile.city')}</label>
                  <input type="text" value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    readOnly={!editing}
                    className={`input-field ${!editing ? 'bg-olive-50 cursor-not-allowed' : ''}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1">{t('profile.country')}</label>
                  <input type="text" value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    readOnly={!editing}
                    className={`input-field ${!editing ? 'bg-olive-50 cursor-not-allowed' : ''}`} />
                </div>
              </div>
              {editing ? (
                <button onClick={handleSave} className="btn-primary mt-5 py-2.5 text-sm">
                  {t('profile.saveChanges')}
                </button>
              ) : (
                <button onClick={() => setEditing(true)} className="btn-secondary mt-5 py-2.5 text-sm">
                  <Edit className="w-4 h-4" /> {t('profile.editProfile')}
                </button>
              )}
              {saved && (
                <div className="mt-3 py-2 px-4 bg-olive-100 text-olive-700 text-sm rounded-xl inline-flex items-center gap-2">
                  ✓ {t('profile.saveChanges')}
                </div>
              )}
            </div>

            <div className="card p-6">
              <h3 className="font-sans text-lg font-bold text-olive-900 mb-5 flex items-center gap-2">
                <Bell className="w-5 h-5 text-olive-500" /> {t('profile.notifications')}
              </h3>
              <div className="space-y-3">
                {[
                  { label: t('profile.orderUpdates'), desc: t('profile.orderUpdatesDesc') },
                  { label: t('profile.newProducts'), desc: t('profile.newProductsDesc') },
                  { label: t('profile.promotions'), desc: t('profile.promotionsDesc') },
                ].map(({ label, desc }) => (
                  <label key={label} className="flex items-center justify-between p-3 rounded-xl hover:bg-olive-50 transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-olive-900">{label}</p>
                      <p className="text-xs text-olive-500">{desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-olive-600 focus:ring-olive-500 border-olive-300" />
                  </label>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-sans text-lg font-bold text-olive-900 mb-5 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-olive-500" /> {t('profile.security')}
              </h3>
              <div className="space-y-3">
                <button onClick={() => alert(t('profile.comingSoon'))} className="flex items-center gap-3 w-full p-3 rounded-xl text-left hover:bg-olive-50 transition-colors">
                  <CreditCard className="w-5 h-5 text-olive-400" />
                  <div>
                    <p className="text-sm font-medium text-olive-900">{t('profile.paymentMethods')}</p>
                    <p className="text-xs text-olive-500">{t('profile.manageCards')}</p>
                  </div>
                </button>
                <button onClick={() => alert(t('profile.comingSoon'))} className="flex items-center gap-3 w-full p-3 rounded-xl text-left hover:bg-olive-50 transition-colors">
                  <Settings className="w-5 h-5 text-olive-400" />
                  <div>
                    <p className="text-sm font-medium text-olive-900">{t('profile.changePassword')}</p>
                    <p className="text-xs text-olive-500">{t('profile.updatePassword')}</p>
                  </div>
                </button>
                <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-xl text-left hover:bg-red-50 text-red-600 transition-colors">
                  <LogOut className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium">{t('profile.signOut')}</p>
                    <p className="text-xs text-red-400">{t('profile.logoutDesc')}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
