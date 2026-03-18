'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { dataManager } from '@/lib/data/manager';
import { Product } from '@/lib/validation/schemas';
import { useTranslation } from '@/stores/i18nStore';
import { formatPrice } from '@/lib/utils/helpers';
import {
  ArrowLeft, Save, Eye, Package, AlertCircle, Loader2,
  Upload, X, Plus, Trash2, Star, Leaf, MapPin,
} from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    olive_variety: '',
    origin_country: '',
    region: '',
    harvest_year: new Date().getFullYear(),
    volume_ml: 500,
    price: 0,
    compare_at_price: 0,
    stock: 0,
    organic: false,
    is_published: false,
    tasting_notes: '',
    storage_instructions: '',
  });

  // Fetch product data
  const fetchProduct = useCallback(async () => {
    if (!params.id || !user) return;

    setLoading(true);
    setError(null);

    try {
      const productData = await dataManager.getProduct(params.id as string);
      
      // Verify user owns this product
      const producer = await dataManager.getProducerByUserId(user.id);
      if (!producer || productData.producer_id !== producer.id) {
        throw new Error('You do not have permission to edit this product');
      }

      setProduct(productData);
      setFormData({
        name: productData.name,
        description: productData.description,
        olive_variety: productData.olive_variety,
        origin_country: productData.origin_country,
        region: productData.region,
        harvest_year: productData.harvest_year,
        volume_ml: productData.volume_ml,
        price: productData.price,
        compare_at_price: productData.compare_at_price || 0,
        stock: productData.stock,
        organic: productData.organic,
        is_published: productData.is_published,
        tasting_notes: productData.tasting_notes || '',
        storage_instructions: productData.storage_instructions || '',
      });
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  }, [params.id, user]);

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchProduct();
    }
  }, [isAuthenticated, params.id, fetchProduct]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=' + encodeURIComponent(`/dashboard/products/${params.id}/edit`));
    }
  }, [isAuthenticated, router, params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
             type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSave = async () => {
    if (!product || !user) return;

    setSaving(true);
    setError(null);

    try {
      await dataManager.updateProduct(product.id, formData);
      router.push('/dashboard/products');
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-olive-600" />
        <span className="ml-2 text-olive-600">Loading product...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-olive-900 mb-2">Error</h2>
          <p className="text-olive-600 mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => router.push('/dashboard/products')}
            className="btn-primary"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/products')}
            className="flex items-center gap-2 text-olive-600 hover:text-olive-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-olive-900">Edit Product</h1>
              <p className="text-olive-600">Update your olive oil product information</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/products/${product.id}`)}
                className="btn-secondary flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Product
              </button>
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
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-medium text-olive-900 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-olive-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-olive-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Olive Details */}
              <div>
                <h3 className="text-lg font-medium text-olive-900 mb-4">Olive Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-olive-700 mb-1">
                      Olive Variety *
                    </label>
                    <select
                      name="olive_variety"
                      value={formData.olive_variety}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    >
                      <option value="">Select variety</option>
                      <option value="Picual">Picual</option>
                      <option value="Arbequina">Arbequina</option>
                      <option value="Hojiblanca">Hojiblanca</option>
                      <option value="Cornicabra">Cornicabra</option>
                      <option value="Empeltre">Empeltre</option>
                      <option value="Lechín">Lechín</option>
                      <option value="Verdial">Verdial</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-olive-700 mb-1">
                      Origin Country *
                    </label>
                    <input
                      type="text"
                      name="origin_country"
                      value={formData.origin_country}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-olive-700 mb-1">
                      Region
                    </label>
                    <input
                      type="text"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-olive-700 mb-1">
                      Harvest Year *
                    </label>
                    <input
                      type="number"
                      name="harvest_year"
                      value={formData.harvest_year}
                      onChange={handleInputChange}
                      min="2000"
                      max={new Date().getFullYear() + 1}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Pricing & Inventory */}
              <div>
                <h3 className="text-lg font-medium text-olive-900 mb-4">Pricing & Inventory</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-olive-700 mb-1">
                      Volume (ml) *
                    </label>
                    <select
                      name="volume_ml"
                      value={formData.volume_ml}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    >
                      <option value="250">250ml</option>
                      <option value="500">500ml</option>
                      <option value="750">750ml</option>
                      <option value="1000">1000ml</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-olive-700 mb-1">
                      Price (€) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-olive-700 mb-1">
                      Compare at Price (€)
                    </label>
                    <input
                      type="number"
                      name="compare_at_price"
                      value={formData.compare_at_price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-olive-700 mb-1">
                      Stock (units) *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div>
                <h3 className="text-lg font-medium text-olive-900 mb-4">Additional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-olive-700 mb-1">
                      Tasting Notes
                    </label>
                    <textarea
                      name="tasting_notes"
                      value={formData.tasting_notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="input-field"
                      placeholder="Describe the flavor profile, aroma, and characteristics..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-olive-700 mb-1">
                      Storage Instructions
                    </label>
                    <textarea
                      name="storage_instructions"
                      value={formData.storage_instructions}
                      onChange={handleInputChange}
                      rows={2}
                      className="input-field"
                      placeholder="How to store the olive oil..."
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="organic"
                        checked={formData.organic}
                        onChange={handleInputChange}
                        className="rounded border-olive-300 text-olive-600 focus:ring-olive-500"
                      />
                      <span className="text-sm text-olive-700">Organic Product</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_published"
                        checked={formData.is_published}
                        onChange={handleInputChange}
                        className="rounded border-olive-300 text-olive-600 focus:ring-olive-500"
                      />
                      <span className="text-sm text-olive-700">Published</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
