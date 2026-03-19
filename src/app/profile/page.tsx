'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/stores/i18nStore';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, formatDateShort, getOrderStatusColor, getInitials } from '@/lib/utils/helpers';
import {
  User, Mail, MapPin, Calendar, Edit, Package,
  Heart, Settings, LogOut, CreditCard, Bell, ShieldCheck, Award, Loader2, Lock
} from 'lucide-react';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, profile, loading, isAuthenticated, signOut, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    country: '',
  });

  // Populate form with real profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || user?.user_metadata?.full_name || '',
        email: profile.email || user?.email || '',
        city: (profile as any)?.city || '',
        country: (profile as any)?.country || '',
      });
    } else if (user) {
      setFormData({
        name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        email: user.email || '',
        city: '',
        country: '',
      });
    }
  }, [profile, user]);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateProfile({
      name: formData.name,
      ...(formData.city ? { city: formData.city } : {}),
      ...(formData.country ? { country: formData.country } : {}),
    } as any);

    setIsSaving(false);
    if (!error) {
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2500);
    }
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-gradient">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-olive-600 mx-auto mb-3" />
          <p className="text-olive-500 text-sm">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — shouldn't reach here if middleware works, but just in case
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-gradient p-6">
        <div className="card p-8 text-center max-w-md w-full">
          <Lock className="w-10 h-10 text-olive-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-olive-900 mb-2">Acceso restringido</h2>
          <p className="text-olive-600 text-sm mb-6">Necesitas iniciar sesión para ver tu perfil.</p>
          <Link href="/auth/login" className="btn-primary inline-flex">Iniciar sesión</Link>
        </div>
      </div>
    );
  }

  const displayName = formData.name || user.email?.split('@')[0] || 'Usuario';
  const memberSince = user.created_at || new Date().toISOString();

  return (
    <div className="min-h-screen bg-cream-gradient">
      <div className="section-padding page-padding">
        {/* Profile Header */}
        <div className="card p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-olive-200 to-olive-400 flex items-center justify-center ring-4 ring-white shadow-xl flex-shrink-0 overflow-hidden">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-sans font-bold text-white text-2xl">
                  {getInitials(displayName)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-sans text-2xl font-bold text-olive-900">{displayName}</h1>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-olive-600">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-olive-400" /> {user.email}
                    </span>
                    {formData.city && formData.country && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-olive-400" /> {formData.city}, {formData.country}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-olive-400" /> {t('profile.memberSince')} {formatDateShort(memberSince)}
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
            <div className="p-8 text-center text-olive-500">
              <Package className="w-10 h-10 mx-auto mb-3 text-olive-300" />
              <p>{t('profile.noOrders')}</p>
              <Link href="/olive-oils" className="btn-primary mt-4 inline-flex">{t('profile.browseProducts')}</Link>
            </div>
          </div>
        )}

        {/* The Olive Club Tab */}
        {activeTab === 'olive-club' && (
          <div className="space-y-6">
            <div className="card p-8 bg-gradient-to-br from-olive-900 to-forest-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
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
                  <div className="text-5xl font-serif font-bold text-white mb-2">0</div>
                  <div className="w-full bg-olive-950/50 rounded-full h-2 mb-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-gold-600 to-gold-400 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <div className="text-xs text-olive-300 flex justify-between">
                    <span>0</span>
                    <span>2000</span>
                  </div>
                </div>
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
            <Link href="/olive-oils" className="btn-primary inline-flex">{t('profile.exploreProducts')}</Link>
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
                    readOnly
                    className="input-field bg-olive-50 cursor-not-allowed"
                    title="El email no se puede cambiar desde aquí" />
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
                <button onClick={handleSave} disabled={isSaving} className="btn-primary mt-5 py-2.5 text-sm">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isSaving ? 'Guardando...' : t('profile.saveChanges')}
                </button>
              ) : (
                <button onClick={() => setEditing(true)} className="btn-secondary mt-5 py-2.5 text-sm">
                  <Edit className="w-4 h-4" /> {t('profile.editProfile')}
                </button>
              )}
              {saved && (
                <div className="mt-3 py-2 px-4 bg-olive-100 text-olive-700 text-sm rounded-xl inline-flex items-center gap-2">
                  ✓ Cambios guardados
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
                <Link href="/auth/reset-password" className="flex items-center gap-3 w-full p-3 rounded-xl text-left hover:bg-olive-50 transition-colors">
                  <Settings className="w-5 h-5 text-olive-400" />
                  <div>
                    <p className="text-sm font-medium text-olive-900">{t('profile.changePassword')}</p>
                    <p className="text-xs text-olive-500">{t('profile.updatePassword')}</p>
                  </div>
                </Link>
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
