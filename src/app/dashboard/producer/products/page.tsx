'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Edit, Trash2, Eye, Package, X, Save, AlertTriangle, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils/helpers';
import { createBrowserClient } from '@supabase/ssr';
import { dataManager } from '@/lib/data/manager';

interface ProductImage {
  id?: string;
  product_id?: string;
  image_url: string;
  alt_text?: string | null;
}

interface Product {
  id: string;
  name: string;
  olive_variety?: string;
  price: number;
  stock: number;
  is_published: boolean;
  images?: ProductImage[] | null;
  description?: string | null;
  short_description?: string | null;
  intensity?: string | null;
  volume_ml?: number | null;
  origin_country?: string | null;
  origin_region?: string | null;
  organic?: boolean;
  harvest_year?: number | null;
  compare_at_price?: number | null;
}

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ─── Delete Confirmation Modal ───────────────────────────────────────────────
function DeleteModal({ product, onConfirm, onCancel, isDeleting }: {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-olive-900">¿Eliminar producto?</h3>
            <p className="text-sm text-olive-600">Esta acción no se puede deshacer.</p>
          </div>
        </div>
        <p className="text-olive-700 bg-olive-50 rounded-xl px-4 py-3 text-sm mb-6">
          Vas a eliminar <strong>"{product.name}"</strong>. El producto será eliminado de tu tienda y no podrá recuperarse.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 btn-secondary py-2.5"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ product, onSave, onCancel, isSaving }: {
  product: Product;
  onSave: (updated: Partial<Product>) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState({
    name: product.name || '',
    short_description: product.short_description || '',
    description: product.description || '',
    price: product.price?.toString() || '',
    compare_at_price: product.compare_at_price?.toString() || '',
    stock: product.stock?.toString() || '',
    volume_ml: product.volume_ml?.toString() || '',
    olive_variety: product.olive_variety || '',
    origin_country: product.origin_country || '',
    origin_region: product.origin_region || '',
    intensity: product.intensity || 'medium',
    organic: product.organic || false,
    is_published: product.is_published || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: form.name,
      short_description: form.short_description,
      description: form.description,
      price: parseFloat(form.price),
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      stock: parseInt(form.stock),
      volume_ml: form.volume_ml ? parseInt(form.volume_ml) : null,
      olive_variety: form.olive_variety,
      origin_country: form.origin_country,
      origin_region: form.origin_region,
      intensity: form.intensity,
      organic: form.organic,
      is_published: form.is_published,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-olive-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="text-lg font-bold text-olive-900">Editar Producto</h3>
          <button onClick={onCancel} className="p-2 rounded-xl hover:bg-olive-50 text-olive-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-olive-800 mb-1">Nombre del producto *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          {/* Short description */}
          <div>
            <label className="block text-sm font-medium text-olive-800 mb-1">Descripción corta</label>
            <input
              type="text"
              value={form.short_description}
              onChange={e => setForm({ ...form, short_description: e.target.value })}
              className="input-field"
              maxLength={300}
            />
          </div>

          {/* Full description */}
          <div>
            <label className="block text-sm font-medium text-olive-800 mb-1">Descripción completa</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="input-field min-h-[100px] resize-none"
            />
          </div>

          {/* Price + compare */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-olive-800 mb-1">Precio (€) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-olive-800 mb-1">Precio tachado (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.compare_at_price}
                onChange={e => setForm({ ...form, compare_at_price: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Stock + Volume */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-olive-800 mb-1">Stock *</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-olive-800 mb-1">Volumen (ml)</label>
              <input
                type="number"
                min="1"
                value={form.volume_ml}
                onChange={e => setForm({ ...form, volume_ml: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Variety + Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-olive-800 mb-1">Variedad de oliva</label>
              <input
                type="text"
                value={form.olive_variety}
                onChange={e => setForm({ ...form, olive_variety: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-olive-800 mb-1">País de origen</label>
              <input
                type="text"
                value={form.origin_country}
                onChange={e => setForm({ ...form, origin_country: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Intensity + Region */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-olive-800 mb-1">Intensidad</label>
              <select
                value={form.intensity}
                onChange={e => setForm({ ...form, intensity: e.target.value })}
                className="input-field"
              >
                <option value="mild">Suave</option>
                <option value="medium">Medio</option>
                <option value="intense">Intenso</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-olive-800 mb-1">Región</label>
              <input
                type="text"
                value={form.origin_region}
                onChange={e => setForm({ ...form, origin_region: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.organic}
                onChange={e => setForm({ ...form, organic: e.target.checked })}
                className="w-4 h-4 rounded border-olive-300 text-olive-600 focus:ring-olive-500"
              />
              <span className="text-sm text-olive-800">Orgánico</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={e => setForm({ ...form, is_published: e.target.checked })}
                className="w-4 h-4 rounded border-olive-300 text-olive-600 focus:ring-olive-500"
              />
              <span className="text-sm text-olive-800">Publicado en tienda</span>
            </label>
          </div>

          {/* Footer buttons */}
          <div className="flex gap-3 pt-2 border-t border-olive-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1 btn-secondary py-2.5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ProducerProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit state
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const supabase = getSupabase();

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error('No estás autenticado');

      const { data: producer, error: producerError } = await supabase
        .from('producers')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (producerError || !producer) {
        setProducts([]);
        return;
      }

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*, images:product_images(*)')
        .eq('producer_id', producer.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const supabase = getSupabase();
      // Delete related images from storage and table first
      const { error: imgError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', deleteTarget.id);
      // Then delete the product
      const { error: delError } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteTarget.id);
      if (delError) throw delError;
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      dataManager.clearCache('products');
      showSuccess('Producto eliminado correctamente');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const handleSaveEdit = async (updated: Partial<Product>) => {
    if (!editTarget) return;
    setIsSaving(true);
    try {
      const supabase = getSupabase();
      const slug = updated.name
        ? updated.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        : undefined;

      const { data, error: updateError } = await supabase
        .from('products')
        .update({ ...updated, ...(slug ? { slug } : {}), updated_at: new Date().toISOString() })
        .eq('id', editTarget.id)
        .select('*, images:product_images(*)')
        .single();

      if (updateError) throw updateError;
      setProducts(prev => prev.map(p => p.id === editTarget.id ? { ...p, ...data } : p));
      setEditTarget(null);
      dataManager.clearCache('products');
      showSuccess('Cambios guardados correctamente');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const filteredProducts = products.filter(p =>
    searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Modals */}
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => !isDeleting && setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
      {editTarget && (
        <EditModal
          product={editTarget}
          onSave={handleSaveEdit}
          onCancel={() => !isSaving && setEditTarget(null)}
          isSaving={isSaving}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-olive-900 mb-1">Mis Productos</h1>
          <p className="text-sm text-olive-600">Gestiona tu catálogo de aceites de oliva.</p>
        </div>
        <Link href="/dashboard/producer/products/new" className="btn-primary py-2.5">
          <Plus className="w-4 h-4" /> Añadir Producto
        </Link>
      </div>

      {/* Feedback */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 flex items-center gap-3">
          ✓ {successMsg}
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-olive-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-olive-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-olive-500 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-olive-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-olive-50 text-olive-600 text-xs uppercase tracking-wider border-b border-olive-100">
                <th className="py-4 px-6 font-semibold">Producto</th>
                <th className="py-4 px-6 font-semibold">Estado</th>
                <th className="py-4 px-6 font-semibold">Stock</th>
                <th className="py-4 px-6 font-semibold">Precio</th>
                <th className="py-4 px-6 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm text-olive-800 divide-y divide-olive-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-olive-500">
                    <div className="w-8 h-8 border-4 border-olive-200 border-t-olive-600 rounded-full animate-spin mx-auto mb-3" />
                    <p className="font-medium">Cargando productos...</p>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map(product => {
                  const firstImage = product.images?.[0]?.image_url;
                  return (
                    <tr key={product.id} className="hover:bg-olive-50/50 transition-colors group">
                      {/* Product cell with real image */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-olive-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {firstImage ? (
                              <img
                                src={firstImage}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-olive-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-olive-900 group-hover:text-gold-600 transition-colors">{product.name}</p>
                            <p className="text-xs text-olive-500 mt-0.5">{product.olive_variety || '—'}</p>
                          </div>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.is_published ? 'Activo' : 'Borrador'}
                        </span>
                      </td>
                      {/* Stock */}
                      <td className="py-4 px-6">
                        <span className={product.stock < 10 ? 'text-red-600 font-medium' : ''}>
                          {product.stock} en stock
                        </span>
                      </td>
                      {/* Price */}
                      <td className="py-4 px-6 font-medium text-olive-900">
                        {formatPrice(product.price)}
                      </td>
                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/products/${product.id}`}
                            className="p-1.5 text-olive-400 hover:text-olive-900 hover:bg-olive-100 rounded-md transition-colors"
                            title="Ver en tienda"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setEditTarget(product)}
                            className="p-1.5 text-olive-400 hover:text-olive-900 hover:bg-olive-100 rounded-md transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="p-1.5 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-olive-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-olive-200" />
                    <p className="text-lg font-medium text-olive-900 mb-1">No hay productos</p>
                    <p className="text-sm mb-4">Aún no has añadido ningún producto a tu tienda.</p>
                    <Link href="/dashboard/producer/products/new" className="btn-primary py-2.5 inline-flex">
                      <Plus className="w-4 h-4" /> Añadir primer producto
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
