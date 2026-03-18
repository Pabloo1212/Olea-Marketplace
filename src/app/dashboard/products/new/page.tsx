'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { dataManager } from '@/lib/data/manager';
import { ImageUploader } from '@/lib/upload/image-uploader';
import { validateNewProduct, NewProductData } from '@/lib/validation/schemas';
import { useTranslation } from '@/stores/i18nStore';
import {
  ArrowLeft, ArrowRight, Check, Upload, Leaf, Globe,
  Package, FileText, Image as ImageIcon, Loader2, AlertCircle,
} from 'lucide-react';

const steps = [
  { id: 1, label: 'Basic Info', icon: FileText },
  { id: 2, label: 'Details', icon: Globe },
  { id: 3, label: 'Images', icon: ImageIcon },
  { id: 4, label: 'Review', icon: Check },
];

interface FormErrors {
  [key: string]: string[];
}

export default function NewProductPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    compare_at_price: '',
    stock: '',
    olive_variety: '',
    harvest_year: new Date().getFullYear().toString(),
    origin_region: '',
    origin_country: '',
    organic: false,
    intensity: 'medium',
    volume_ml: '500',
    tasting_notes: '',
    best_before: '',
    awards: '',
  });

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=' + encodeURIComponent('/dashboard/products/new'));
    }
  }, [isAuthenticated, router]);

  const updateField = useCallback((field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: [] }));
    }
  }, [errors]);

  const validateStep = useCallback((stepNumber: number): boolean => {
    const newErrors: FormErrors = {};

    if (stepNumber === 1) {
      if (!formData.name.trim()) {
        newErrors.name = ['Product name is required'];
      }
      if (!formData.short_description.trim()) {
        newErrors.short_description = ['Short description is required'];
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        newErrors.price = ['Valid price is required'];
      }
      if (!formData.stock || parseInt(formData.stock) < 0) {
        newErrors.stock = ['Valid stock quantity is required'];
      }
    }

    if (stepNumber === 2) {
      if (!formData.olive_variety) {
        newErrors.olive_variety = ['Olive variety is required'];
      }
      if (!formData.origin_country) {
        newErrors.origin_country = ['Country of origin is required'];
      }
    }

    if (stepNumber === 3) {
      if (uploadedImages.length === 0) {
        newErrors.images = ['At least one image is required'];
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, uploadedImages.length]);

  const handleNext = useCallback(() => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  }, [step, validateStep]);

  const handlePrevious = useCallback(() => {
    setStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handleImageSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 5 - uploadedImages.length);
    
    for (const file of newFiles) {
      try {
        // Validate file
        const validationErrors = ImageUploader.validateFile(file);
        if (validationErrors.length > 0) {
          setErrors(prev => ({
            ...prev,
            images: validationErrors.map(e => e.message)
          }));
          continue;
        }

        // Create preview
        const preview = URL.createObjectURL(file);
        setImagePreviews(prev => [...prev, preview]);
        setUploadedImages(prev => [...prev, file]);
        
        // Clear image errors
        if (errors.images) {
          setErrors(prev => ({ ...prev, images: [] }));
        }
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }
  }, [uploadedImages.length, errors.images]);

  const removeImage = useCallback((index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(prev[index]);
      return newPreviews;
    });
  }, []);

  const handleSubmit = useCallback(async (isDraft: boolean = false) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare product data
      const productData: NewProductData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        short_description: formData.short_description.trim(),
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        stock: parseInt(formData.stock),
        olive_variety: formData.olive_variety,
        harvest_year: parseInt(formData.harvest_year),
        origin_region: formData.origin_region.trim(),
        origin_country: formData.origin_country,
        organic: formData.organic,
        intensity: formData.intensity as 'mild' | 'medium' | 'intense',
        volume_ml: parseInt(formData.volume_ml),
        is_published: !isDraft,
        images: uploadedImages.map(file => ({ file })),
      };

      // Validate with Zod
      const validatedData = validateNewProduct(productData);

      // Get producer info
      const producer = await dataManager.getProducerByUserId(user.id);
      if (!producer) {
        throw new Error('Producer account not found. Please complete your producer profile first.');
      }

      // Create product
      const createdProduct = await dataManager.createProduct(validatedData, producer.id);

      console.log('Product created successfully:', createdProduct);
      
      // Redirect to products list
      router.push('/dashboard/products');
      
    } catch (error) {
      console.error('Error creating product:', error);
      
      if (error instanceof Error) {
        // Try to extract field-specific errors
        if (error.message.includes('name')) {
          setErrors(prev => ({ ...prev, name: [error.message] }));
        } else if (error.message.includes('price')) {
          setErrors(prev => ({ ...prev, price: [error.message] }));
        } else {
          setErrors(prev => ({ ...prev, general: [error.message] }));
        }
      } else {
        setErrors(prev => ({ ...prev, general: ['An unexpected error occurred'] }));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [user, formData, uploadedImages, router]);

  const isStep1Valid = formData.name && formData.short_description && formData.price && formData.stock;
  const isStep2Valid = formData.olive_variety && formData.origin_country;
  const isStep3Valid = uploadedImages.length > 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream-gradient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-olive-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-gradient">
      <div className="section-padding py-8 max-w-3xl mx-auto">
        <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-sm text-olive-500 hover:text-olive-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        <h1 className="font-sans text-3xl font-bold text-olive-900 mb-8">Add New Product</h1>

        {/* Stepper */}
        <div className="flex items-center mb-8 overflow-x-auto">
          {steps.map(({ id, label, icon: Icon }, i) => (
            <React.Fragment key={id}>
              <div className="flex items-center gap-2 flex-shrink-0">
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
                <div className={`flex-1 h-0.5 mx-3 rounded min-w-[2rem] ${
                  step > id ? 'bg-olive-700' : 'bg-olive-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* General Errors */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Error</p>
                {errors.general.map((error, i) => (
                  <p key={i} className="text-sm text-red-700 mt-1">{error}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="card p-6 sm:p-8 space-y-5">
            <h2 className="font-sans text-lg font-bold text-olive-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-olive-500" /> Basic Information
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-olive-800 mb-1">Product Name *</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g. Arbequina Reserve – Early Harvest" 
                className={`input-field ${errors.name ? 'border-red-300 focus:border-red-500' : ''}`}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-olive-800 mb-1">Short Description *</label>
              <input 
                type="text" 
                value={formData.short_description} 
                onChange={(e) => updateField('short_description', e.target.value)}
                placeholder="A brief tagline for your product" 
                className={`input-field ${errors.short_description ? 'border-red-300 focus:border-red-500' : ''}`}
                maxLength={150} 
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-olive-400">{formData.short_description.length}/150</span>
                {errors.short_description && (
                  <p className="text-sm text-red-600">{errors.short_description[0]}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-olive-800 mb-1">Full Description</label>
              <textarea 
                value={formData.description} 
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe your olive oil's story, production method, flavor profile..."
                className="input-field min-h-[120px] resize-y" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-olive-800 mb-1">Price (€) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  value={formData.price}
                  onChange={(e) => updateField('price', e.target.value)} 
                  className={`input-field ${errors.price ? 'border-red-300 focus:border-red-500' : ''}`}
                  placeholder="24.90" 
                />
                {errors.price && (
                  <p className="text-sm text-red-600 mt-1">{errors.price[0]}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-olive-800 mb-1">Compare at Price</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  value={formData.compare_at_price}
                  onChange={(e) => updateField('compare_at_price', e.target.value)} 
                  className="input-field" 
                  placeholder="29.90" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-olive-800 mb-1">Stock *</label>
                <input 
                  type="number" 
                  min="0" 
                  value={formData.stock}
                  onChange={(e) => updateField('stock', e.target.value)} 
                  className={`input-field ${errors.stock ? 'border-red-300 focus:border-red-500' : ''}`}
                  placeholder="100" 
                />
                {errors.stock && (
                  <p className="text-sm text-red-600 mt-1">{errors.stock[0]}</p>
                )}
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
                <select 
                  value={formData.olive_variety} 
                  onChange={(e) => updateField('olive_variety', e.target.value)} 
                  className={`input-field ${errors.olive_variety ? 'border-red-300 focus:border-red-500' : ''}`}
                >
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
                {errors.olive_variety && (
                  <p className="text-sm text-red-600 mt-1">{errors.olive_variety[0]}</p>
                )}
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
                <select 
                  value={formData.origin_country} 
                  onChange={(e) => updateField('origin_country', e.target.value)} 
                  className={`input-field ${errors.origin_country ? 'border-red-300 focus:border-red-500' : ''}`}
                >
                  <option value="">Select country</option>
                  <option value="España">España</option>
                  <option value="Italia">Italia</option>
                  <option value="Greece">Greece</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Tunisia">Tunisia</option>
                  <option value="Morocco">Morocco</option>
                </select>
                {errors.origin_country && (
                  <p className="text-sm text-red-600 mt-1">{errors.origin_country[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-olive-800 mb-1">Region</label>
                <input 
                  type="text" 
                  value={formData.origin_region} 
                  onChange={(e) => updateField('origin_region', e.target.value)}
                  className="input-field" 
                  placeholder="e.g. Jaén, Andalucía" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-olive-800 mb-1">Harvest Year</label>
                <input 
                  type="number" 
                  value={formData.harvest_year} 
                  onChange={(e) => updateField('harvest_year', e.target.value)}
                  className="input-field" 
                  min="2020" 
                  max={new Date().getFullYear() + 1} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-olive-800 mb-1">Intensity</label>
                <div className="flex gap-2">
                  {['mild', 'medium', 'intense'].map((level) => (
                    <button 
                      key={level} 
                      type="button"
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
              <input 
                type="text" 
                value={formData.tasting_notes} 
                onChange={(e) => updateField('tasting_notes', e.target.value)}
                className="input-field" 
                placeholder="e.g. artichoke, green almond, black pepper" 
              />
            </div>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-olive-50 cursor-pointer hover:bg-olive-100 transition-colors">
              <input 
                type="checkbox" 
                checked={formData.organic}
                onChange={(e) => updateField('organic', e.target.checked)}
                className="w-5 h-5 rounded text-olive-600 focus:ring-olive-500 border-olive-300" 
              />
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
            
            <div 
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer ${
                errors.images 
                  ? 'border-red-300 bg-red-50 hover:border-red-400' 
                  : 'border-olive-300 hover:border-olive-400 hover:bg-olive-50/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-olive-400" />
              <p className="text-sm font-medium text-olive-700 mb-1">Drag & drop your images here</p>
              <p className="text-xs text-olive-500">or click to browse • PNG, JPG up to 5MB</p>
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                accept="image/jpeg,image/jpg,image/png,image/webp" 
                className="hidden" 
                onChange={(e) => handleImageSelect(e.target.files)}
              />
            </div>
            
            {errors.images && (
              <p className="text-sm text-red-600">{errors.images[0]}</p>
            )}
            
            <p className="text-xs text-olive-500">
              Upload at least one image. The first image will be used as the main product photo.
              Recommended: 1200×1200px, square format.
            </p>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-olive-100">
                      <img 
                        src={preview} 
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-olive-700 text-white text-xs rounded">
                        Main
                      </div>
                    )}
                  </div>
                ))}
                
                {uploadedImages.length < 5 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="aspect-square rounded-xl border-2 border-dashed border-olive-300 flex items-center justify-center hover:bg-olive-50 transition-colors"
                  >
                    <span className="text-2xl text-olive-400">+</span>
                  </button>
                )}
              </div>
            )}
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
              
              {uploadedImages.length > 0 && (
                <div className="text-sm">
                  <span className="text-olive-500">Images:</span>
                  <p className="font-medium text-olive-900 mt-1">{uploadedImages.length} image(s) uploaded</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="btn-secondary flex-1 py-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save as Draft
              </button>
              <button 
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="btn-gold flex-1 py-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4" />}
                {isSubmitting ? 'Publishing...' : 'Publish Product'}
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button 
            onClick={handlePrevious} 
            disabled={step === 1}
            className={`btn-secondary py-2.5 px-5 ${step === 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>
          
          {step < 4 ? (
            <button 
              onClick={handleNext}
              disabled={
                (step === 1 && !isStep1Valid) || 
                (step === 2 && !isStep2Valid) || 
                (step === 3 && !isStep3Valid)
              }
              className={`btn-primary py-2.5 px-5 ${
                (step === 1 && !isStep1Valid) || 
                (step === 2 && !isStep2Valid) || 
                (step === 3 && !isStep3Valid) 
                  ? 'opacity-40 cursor-not-allowed' 
                  : ''
              }`}
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
