'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, X, Save, Image as ImageIcon } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function NewProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    short_description: '',
    description: '',
    price: '',
    compare_at_price: '',
    stock: '',
    olive_variety: '',
    harvest_year: new Date().getFullYear().toString(),
    origin_region: '',
    origin_country: 'Spain',
    organic: false,
    intensity: 'medium',
    volume_ml: '500',
    is_published: true,
  });

  const getSupabase = () => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages((prev) => [...prev, ...filesArray]);
      
      const newUrls = filesArray.map(file => URL.createObjectURL(file));
      setImageUrls((prev) => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const supabase = getSupabase();
      
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('You must be logged in to create a product');

      // 1. Get Producer ID for this user
      const { data: producerData, error: producerError } = await supabase
        .from('producers')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
        
      if (producerError || !producerData) {
        throw new Error('You must have a producer profile to add products');
      }

      // 2. Insert Product
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
          producer_id: producerData.id,
          name: formData.name,
          slug,
          description: formData.description,
          short_description: formData.short_description,
          price: parseFloat(formData.price),
          compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
          currency: 'EUR',
          stock: parseInt(formData.stock),
          olive_variety: formData.olive_variety,
          harvest_year: parseInt(formData.harvest_year),
          origin_region: formData.origin_region,
          origin_country: formData.origin_country,
          organic: formData.organic,
          intensity: formData.intensity,
          volume_ml: parseInt(formData.volume_ml),
          is_published: formData.is_published,
        })
        .select()
        .single();

      if (productError) throw productError;

      // 3. Upload Images
      if (images.length > 0 && newProduct) {
        const uploadPromises = images.map(async (file, index) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${newProduct.id}/${Date.now()}_${index}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, file);

          if (uploadError) return null;

          const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(fileName);

          return {
            product_id: newProduct.id,
            image_url: publicUrl,
            alt_text: `${formData.name} image ${index + 1}`,
            position: index
          };
        });

        const uploadedImagesData = (await Promise.all(uploadPromises)).filter(Boolean);

        if (uploadedImagesData.length > 0) {
          await supabase
            .from('product_images')
            .insert(uploadedImagesData);
        }
      }

      // Redirect back to products list
      window.location.href = '/dashboard/producer/products';
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to create product');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/producer/products" className="w-10 h-10 rounded-full bg-white border border-olive-100 flex items-center justify-center text-olive-500 hover:text-olive-900 hover:bg-olive-50 transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-olive-900">Add New Product</h1>
          <p className="text-sm text-olive-600">List a new olive oil in your store.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Info */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-olive-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1">Product Title</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" placeholder="e.g. Premium Arbequina Extra Virgin" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1">Short Description</label>
                  <input type="text" value={formData.short_description} onChange={(e) => setFormData({...formData, short_description: e.target.value})} className="input-field" placeholder="Brief summary for product cards..." required maxLength={150} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1">Full Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input-field min-h-[150px] resize-none" placeholder="Detailed product description, tasting notes, pair recommendations..." required />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-olive-900 mb-4">Product Images</h2>
              
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-olive-200 rounded-xl p-8 bg-olive-50/50 hover:bg-olive-50 hover:border-olive-300 transition-colors cursor-pointer group relative">
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-olive-400 group-hover:text-gold-500 transition-colors">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="font-medium text-olive-900 mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-olive-500">SVG, PNG, JPG or WEBP (max. 5MB)</p>
              </div>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg border border-olive-100 overflow-hidden group">
                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Origins */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-olive-900 mb-4">Origin & Specs</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1">Olive Variety</label>
                  <input type="text" value={formData.olive_variety} onChange={(e) => setFormData({...formData, olive_variety: e.target.value})} className="input-field" placeholder="e.g. Picual, Arbequina" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1">Harvest Year</label>
                  <input type="number" value={formData.harvest_year} onChange={(e) => setFormData({...formData, harvest_year: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1">Origin City/Region</label>
                  <input type="text" value={formData.origin_region} onChange={(e) => setFormData({...formData, origin_region: e.target.value})} className="input-field" placeholder="e.g. Jaén, Tuscany" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1">Intensity</label>
                  <select value={formData.intensity} onChange={(e) => setFormData({...formData, intensity: e.target.value})} className="input-field" required>
                    <option value="mild">Mild (Suave)</option>
                    <option value="medium">Medium (Medio)</option>
                    <option value="intense">Intense (Intenso)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Pricing & Stock */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-olive-900 mb-4">Pricing & Inventory</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1">Price (€)</label>
                  <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="input-field text-lg font-medium text-olive-900" placeholder="0.00" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1">Compare at price (€)</label>
                  <input type="number" step="0.01" value={formData.compare_at_price} onChange={(e) => setFormData({...formData, compare_at_price: e.target.value})} className="input-field text-olive-500" placeholder="Optional" />
                  <p className="text-xs text-olive-500 mt-1">To show a crossed-out discounted price.</p>
                </div>
                <div className="pt-2 border-t border-olive-100">
                  <label className="block text-sm font-medium text-olive-800 mb-1">Stock Quantity</label>
                  <input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="input-field" placeholder="0" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-olive-800 mb-1">Volume (ml)</label>
                  <input type="number" value={formData.volume_ml} onChange={(e) => setFormData({...formData, volume_ml: e.target.value})} className="input-field" placeholder="500" required />
                </div>
              </div>
            </div>

            {/* Properties */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-olive-900 mb-4">Properties</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-olive-100 hover:bg-olive-50 transition-colors">
                  <input type="checkbox" checked={formData.organic} onChange={(e) => setFormData({...formData, organic: e.target.checked})} className="w-5 h-5 rounded border-olive-300 text-gold-600 focus:ring-gold-500 cursor-pointer" />
                  <div>
                    <span className="block font-medium text-sm text-olive-900">Organic Certification</span>
                    <span className="block text-xs text-olive-500">Show organic badge on product</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Publish */}
            <div className="card-premium p-6">
              <h2 className="text-lg font-bold text-olive-900 mb-4">Publishing</h2>
              <label className="flex items-center gap-3 cursor-pointer mb-6">
                <input type="checkbox" checked={formData.is_published} onChange={(e) => setFormData({...formData, is_published: e.target.checked})} className="w-5 h-5 rounded border-olive-300 text-olive-600 focus:ring-olive-500 cursor-pointer" />
                <span className="font-medium text-sm text-olive-900">Publish immediately to store</span>
              </label>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Save className="w-4 h-4" /> Save Product</>
                )}
              </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
