'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/stores/i18nStore';
import {
  Store, Settings, AlertCircle, Loader2, Save,
  Mail, Phone, MapPin, Globe, Instagram, Facebook,
} from 'lucide-react';

export default function StoreSettingsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    store_name: '',
    store_description: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    website: '',
    instagram: '',
    facebook: '',
    shipping_policy: '',
    return_policy: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=' + encodeURIComponent('/dashboard/settings'));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // TODO: Implement save functionality
      console.log('Saving store settings:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('Store settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-olive-600" />
        <span className="ml-2 text-olive-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-olive-900 mb-2">Store Settings</h1>
          <p className="text-olive-600">Manage your store information and preferences</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <div className="space-y-8">
          {/* Store Information */}
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <Store className="w-5 h-5 text-olive-600" />
              <h2 className="text-lg font-medium text-olive-900">Store Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-olive-700 mb-2">
                  Store Name
                </label>
                <input
                  type="text"
                  name="store_name"
                  value={formData.store_name}
                  onChange={handleInputChange}
                  placeholder="Your store name"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-olive-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  placeholder="contact@yourstore.com"
                  className="input-field"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-olive-700 mb-2">
                  Store Description
                </label>
                <textarea
                  name="store_description"
                  value={formData.store_description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Tell customers about your store and your olive oils..."
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <Phone className="w-5 h-5 text-olive-600" />
              <h2 className="text-lg font-medium text-olive-900">Contact Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-olive-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  placeholder="+34 600 000 000"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-olive-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com"
                  className="input-field"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-olive-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Your store address"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-5 h-5 text-olive-600" />
              <h2 className="text-lg font-medium text-olive-900">Social Media</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-olive-700 mb-2">
                  Instagram
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="@yourstore"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-olive-700 mb-2">
                  Facebook
                </label>
                <input
                  type="text"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  placeholder="Your Facebook page"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Policies */}
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-olive-600" />
              <h2 className="text-lg font-medium text-olive-900">Policies</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-olive-700 mb-2">
                  Shipping Policy
                </label>
                <textarea
                  name="shipping_policy"
                  value={formData.shipping_policy}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe your shipping policy..."
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-olive-700 mb-2">
                  Return Policy
                </label>
                <textarea
                  name="return_policy"
                  value={formData.return_policy}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe your return policy..."
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
