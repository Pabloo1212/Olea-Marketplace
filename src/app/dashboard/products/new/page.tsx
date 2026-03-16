'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Check, Upload, Leaf, Globe,
  Package, FileText, Image as ImageIcon,
} from 'lucide-react';

const steps = [
  { id: 1, label: 'Basic Info', icon: FileText },
  { id: 2, label: 'Details', icon: Globe },
  { id: 3, label: 'Images', icon: ImageIcon },
  { id: 4, label: 'Review', icon: Check },
];

export default function NewProductPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', description: '', short_description: '',
    price: '', compare_at_price: '', stock: '',
    olive_variety: '', harvest_year: new Date().getFullYear().toString(),
    origin_region: '', origin_country: '',
    organic: false, intensity: 'medium',
    volume_ml: '500', tasting_notes: '',
    best_before: '', awards: '',
  });

  const updateField = (field: string, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const isStep1Valid = formData.name && formData.short_description && formData.price && formData.stock;
  const isStep2Valid = formData.olive_variety && formData.origin_country;

  return (
    <div className="min-h-screen bg-cream-gradient">
      <div className="section-padding py-8 max-w-3xl mx-auto">
        <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-sm text-olive-500 hover:text-olive-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        <h1 className="font-sans text-3xl font-bold text-olive-900 mb-8">Add New Product</h1>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          {steps.map(({ id, label, icon: Icon }, i) => (
            <React.Fragment key={id}>
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step >= id
                    ? 'bg-olive-700 text-white shadow-md'
                    : 'bg-olive-100 text-olive-400'
                }`}>
                  {step > id ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${
                  step >= id ? 'text-olive-900' : 'text-olive-400'
                }`}>{label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 rounded ${
                  step > id ? 'bg-olive-700' : 'bg-olive-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="card p-6 sm:p-8 space-y-5">
            <h2 className="font-sans text-lg font-bold text-olive-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-olive-500" /> Basic Information
            </h2>
            <div>
              <label className="block text-sm font-medium text-olive-800 mb-1">Product Name *</label>
              <input type="text" value={formData.name} onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g. Arbequina Reserve – Early Harvest" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-olive-800 mb-1">Short Description *</label>
              <input type="text" value={formData.short_description} onChange={(e) => updateField('short_description', e.target.value)}
                placeholder="A brief tagline for your product" className="input-field" maxLength={150} />
              <span className="text-xs text-olive-400 mt-1 block">{formData.short_description.length}/150</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-olive-800 mb-1">Full Description</label>
              <textarea value={formData.description} onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe your olive oil's story, production method, flavor profile..."
                className="input-field min-h-[120px] resize-y" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-olive-800 mb-1">Price (€) *</label>
                <input type="number" step="0.01" min="0" value={formData.price}
                  onChange={(e) => updateField('price', e.target.value)} className="input-field" placeholder="24.90" />
              </div>
              <div>
                <label className="block text-sm font-medium text-olive-800 mb-1">Compare at Price</label>
                <input type="number" step="0.01" min="0" value={formData.compare_at_price}
                  onChange={(e) => updateField('compare_at_price', e.target.value)} className="input-field" placeholder="29.90" />
              </div>
              <div>
                <label className="block text-sm font-medium text-olive-800 mb-1">Stock *</label>
                <input type="number" min="0" value={formData.stock}
                  onChange={(e) => updateField('stock', e.target.value)} className="input-field" placeholder="100" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="card p-6 sm:p-8 space-y-5">
            <h2 className="font-sans text-lg font-bold text-olive-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-olive-500" /> Product Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-olive-800 mb-1">Olive Variety *</label>
                <select value={formData.olive_variety} onChange={(e) => updateField('olive_variety', e.target.value)} className="input-field">
                  <option value="">Select variety</option>
                  <option value="Picual">Picual</option>
                  <option value="Arbequina">Arbequina</option>
                  <option value="Hojiblanca">Hojiblanca</option>
                  <option value="Frantoio">Frantoio</option>
                  <option value="Koroneiki">Koroneiki</option>
                  <option value="Leccino">Leccino</option>
                  <option value="Cobrançosa">Cobrançosa</option>
                  <option value="Galega">Galega</option>
                  <option value="Blend">Blend / Coupage</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-olive-800 mb-1">Volume (ml)</label>
                <select value={formData.volume_ml} onChange={(e) => updateField('volume_ml', e.target.value)} className="input-field">
                  <option value="250">250 ml</option>
                  <option value="500">500 ml</option>
                  <option value="750">750 ml</option>
                  <option value="1000">1 L</option>
                  <option value="5000">5 L</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-olive-800 mb-1">Country of Origin *</label>
                <select value={formData.origin_country} onChange={(e) => updateField('origin_country', e.target.value)} className="input-field">
                  <option value="">Select country</option>
                  <option value="España">España</option>
                  <option value="Italia">Italia</option>
                  <option value="Greece">Greece</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Tunisia">Tunisia</option>
                  <option value="Morocco">Morocco</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-olive-800 mb-1">Region</label>
                <input type="text" value={formData.origin_region} onChange={(e) => updateField('origin_region', e.target.value)}
                  className="input-field" placeholder="e.g. Jaén, Andalucía" />
              </div>
              <div>
                <label className="block text-sm font-medium text-olive-800 mb-1">Harvest Year</label>
                <input type="number" value={formData.harvest_year} onChange={(e) => updateField('harvest_year', e.target.value)}
                  className="input-field" min="2020" max="2030" />
              </div>
              <div>
                <label className="block text-sm font-medium text-olive-800 mb-1">Intensity</label>
                <div className="flex gap-2">
                  {['mild', 'medium', 'intense'].map((level) => (
                    <button key={level} type="button"
                      onClick={() => updateField('intensity', level)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${
                        formData.intensity === level
                          ? 'bg-olive-700 text-white shadow-sm'
                          : 'bg-olive-50 text-olive-600 border border-olive-200 hover:bg-olive-100'
                      }`}>
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-olive-800 mb-1">Tasting Notes</label>
              <input type="text" value={formData.tasting_notes} onChange={(e) => updateField('tasting_notes', e.target.value)}
                className="input-field" placeholder="e.g. artichoke, green almond, black pepper" />
            </div>
            <label className="flex items-center gap-3 p-3 rounded-xl bg-olive-50 cursor-pointer hover:bg-olive-100 transition-colors">
              <input type="checkbox" checked={formData.organic}
                onChange={(e) => updateField('organic', e.target.checked)}
                className="w-5 h-5 rounded text-olive-600 focus:ring-olive-500 border-olive-300" />
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-olive-500" />
                <span className="text-sm font-medium text-olive-800">This product is certified organic</span>
              </div>
            </label>
          </div>
        )}

        {/* Step 3: Images */}
        {step === 3 && (
          <div className="card p-6 sm:p-8 space-y-5">
            <h2 className="font-sans text-lg font-bold text-olive-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-olive-500" /> Product Images
            </h2>
            <div className="border-2 border-dashed border-olive-300 rounded-2xl p-10 text-center hover:border-olive-400 hover:bg-olive-50/50 transition-colors cursor-pointer">
              <Upload className="w-10 h-10 mx-auto mb-3 text-olive-400" />
              <p className="text-sm font-medium text-olive-700 mb-1">Drag & drop your images here</p>
              <p className="text-xs text-olive-500">or click to browse • PNG, JPG up to 5MB</p>
              <input type="file" multiple accept="image/*" className="hidden" />
            </div>
            <p className="text-xs text-olive-500">
              Upload at least one image. The first image will be used as the main product photo.
              Recommended: 1200×1200px, square format.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-xl bg-olive-100 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-olive-300" />
                </div>
              ))}
              <button className="aspect-square rounded-xl border-2 border-dashed border-olive-300 flex items-center justify-center hover:bg-olive-50 transition-colors">
                <span className="text-2xl text-olive-400">+</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="card p-6 sm:p-8 space-y-5">
            <h2 className="font-sans text-lg font-bold text-olive-900 flex items-center gap-2">
              <Check className="w-5 h-5 text-olive-500" /> Review & Publish
            </h2>
            <div className="bg-olive-50 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-olive-500">Name:</span> <span className="font-medium text-olive-900">{formData.name || '—'}</span></div>
                <div><span className="text-olive-500">Price:</span> <span className="font-medium text-olive-900">€{formData.price || '—'}</span></div>
                <div><span className="text-olive-500">Variety:</span> <span className="font-medium text-olive-900">{formData.olive_variety || '—'}</span></div>
                <div><span className="text-olive-500">Origin:</span> <span className="font-medium text-olive-900">{formData.origin_region ? `${formData.origin_region}, ` : ''}{formData.origin_country || '—'}</span></div>
                <div><span className="text-olive-500">Volume:</span> <span className="font-medium text-olive-900">{formData.volume_ml} ml</span></div>
                <div><span className="text-olive-500">Intensity:</span> <span className="font-medium text-olive-900 capitalize">{formData.intensity}</span></div>
                <div><span className="text-olive-500">Stock:</span> <span className="font-medium text-olive-900">{formData.stock || '—'} units</span></div>
                <div><span className="text-olive-500">Organic:</span> <span className="font-medium text-olive-900">{formData.organic ? 'Yes ✅' : 'No'}</span></div>
              </div>
              {formData.short_description && (
                <div className="text-sm">
                  <span className="text-olive-500">Description:</span>
                  <p className="font-medium text-olive-900 mt-1">{formData.short_description}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1 py-3">Save as Draft</button>
              <button className="btn-gold flex-1 py-3">
                <Check className="w-4 h-4" /> Publish Product
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
            className={`btn-secondary py-2.5 px-5 ${step === 1 ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !isStep1Valid : step === 2 ? !isStep2Valid : false}
              className={`btn-primary py-2.5 px-5 ${
                (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid) ? 'opacity-40 cursor-not-allowed' : ''
              }`}>
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
