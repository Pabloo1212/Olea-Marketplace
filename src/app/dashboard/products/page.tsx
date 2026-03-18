'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { dataManager } from '@/lib/data/manager';
import { Product } from '@/lib/validation/schemas';
import { useTranslation } from '@/stores/i18nStore';
import { formatPrice, formatDateShort } from '@/lib/utils/helpers';
import {
  Plus, Search, Filter, Eye, Edit, Trash2, MoreVertical,
  Package, AlertCircle, Loader2, Star, Leaf, MapPin,
} from 'lucide-react';

export default function DashboardProductsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch products for the current producer
  const fetchProducts = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Get producer info first
      const producer = await dataManager.getProducerByUserId(user.id);
      if (!producer) {
        throw new Error('Producer account not found. Please complete your producer profile first.');
      }

      // Fetch products for this producer
      const producerProducts = await dataManager.getProducerProducts(producer.id);
      setProducts(producerProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProducts();
    }
  }, [isAuthenticated, user, fetchProducts]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=' + encodeURIComponent('/dashboard/products'));
    }
  }, [isAuthenticated, router]);

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.olive_variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.origin_country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle product actions
  const handleEditProduct = useCallback((productId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit product:', productId);
    alert('Edit functionality will be implemented soon. Product ID: ' + productId);
  }, [router]);

  const handleViewProduct = useCallback((productId: string) => {
    // TODO: Implement view functionality
    console.log('View product:', productId);
    alert('View functionality will be implemented soon. Product ID: ' + productId);
  }, [router]);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    if (!user) return;

    setIsDeleting(true);
    try {
      await dataManager.deleteProduct(productId);
      
      // Refresh products list
      await fetchProducts();
      
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  }, [user, fetchProducts]);

  const handleSelectProduct = useCallback((productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  }, [selectedProducts.length, filteredProducts]);

  const handleBulkDelete = useCallback(async () => {
    if (!user || selectedProducts.length === 0) return;

    setIsDeleting(true);
    try {
      // Delete all selected products
      await Promise.all(
        selectedProducts.map(productId => dataManager.deleteProduct(productId))
      );
      
      // Refresh products list
      await fetchProducts();
      
      setSelectedProducts([]);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Error deleting products:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete products');
    } finally {
      setIsDeleting(false);
    }
  }, [user, selectedProducts, fetchProducts]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream-gradient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-olive-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-gradient">
      <div className="section-padding py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="font-sans text-3xl font-bold text-olive-900 mb-2">My Products</h1>
              <p className="text-olive-600">Manage your olive oil products</p>
            </div>
            
            <Link
              href="/dashboard/products/new"
              className="btn-primary mt-4 sm:mt-0 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Product
            </Link>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <button
                    onClick={fetchProducts}
                    className="text-sm text-red-600 hover:text-red-800 mt-2 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="card p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-olive-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              
              <button className="btn-secondary flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-olive-600" />
                <span className="ml-2 text-olive-600">Loading products...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-olive-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-olive-900 mb-2">
                  {searchQuery ? 'No products found' : 'No products yet'}
                </h3>
                <p className="text-olive-600 mb-6">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Start by adding your first olive oil product'
                  }
                </p>
                {!searchQuery && (
                  <Link
                    href="/dashboard/products/new"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Product
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* Bulk Actions */}
                {selectedProducts.length > 0 && (
                  <div className="p-4 bg-olive-50 border-b border-olive-200 flex items-center justify-between">
                    <span className="text-sm text-olive-700">
                      {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="btn-danger text-sm py-1.5 px-3"
                      >
                        Delete Selected
                      </button>
                      <button
                        onClick={() => setSelectedProducts([])}
                        className="btn-secondary text-sm py-1.5 px-3"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-olive-50 border-b border-olive-200">
                      <tr>
                        <th className="text-left p-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.length === filteredProducts.length}
                            onChange={handleSelectAll}
                            className="rounded border-olive-300 text-olive-600 focus:ring-olive-500"
                          />
                        </th>
                        <th className="text-left p-4 font-medium text-olive-900">Product</th>
                        <th className="text-left p-4 font-medium text-olive-900">Variety</th>
                        <th className="text-left p-4 font-medium text-olive-900">Origin</th>
                        <th className="text-left p-4 font-medium text-olive-900">Price</th>
                        <th className="text-left p-4 font-medium text-olive-900">Stock</th>
                        <th className="text-left p-4 font-medium text-olive-900">Status</th>
                        <th className="text-left p-4 font-medium text-olive-900">Created</th>
                        <th className="text-left p-4 font-medium text-olive-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b border-olive-100 hover:bg-olive-50/50">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => handleSelectProduct(product.id)}
                              className="rounded border-olive-300 text-olive-600 focus:ring-olive-500"
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-olive-100 flex items-center justify-center overflow-hidden relative">
                                {product.images && product.images.length > 0 ? (
                                  <Image
                                    src={product.images[0].image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                  />
                                ) : (
                                  <Package className="w-6 h-6 text-olive-400" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-olive-900 line-clamp-1">
                                  {product.name}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-olive-500">
                                  {product.organic && (
                                    <span className="flex items-center gap-1">
                                      <Leaf className="w-3 h-3" />
                                      Organic
                                    </span>
                                  )}
                                  <span>{product.volume_ml}ml</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-olive-700">
                            {product.olive_variety}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1 text-sm text-olive-700">
                              <MapPin className="w-3 h-3" />
                              {product.origin_country}
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <span className="font-medium text-olive-900">
                                {formatPrice(product.price)}
                              </span>
                              {product.compare_at_price && (
                                <span className="text-sm text-olive-400 line-through ml-2">
                                  {formatPrice(product.compare_at_price)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`text-sm ${
                              product.stock <= 10 
                                ? 'text-amber-600 font-medium' 
                                : 'text-olive-700'
                            }`}>
                              {product.stock} units
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`badge ${
                              product.is_published 
                                ? 'badge-active' 
                                : 'badge-draft'
                            }`}>
                              {product.is_published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-olive-500">
                            {formatDateShort(product.created_at)}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleViewProduct(product.id)}
                                className="p-1.5 rounded-lg hover:bg-olive-100 text-olive-600 transition-colors"
                                title="View product"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditProduct(product.id)}
                                className="p-1.5 rounded-lg hover:bg-olive-100 text-olive-600 transition-colors"
                                title="Edit product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setProductToDelete(product.id);
                                  setShowDeleteConfirm(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                                title="Delete product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold text-olive-900 mb-2">
                  Confirm Deletion
                </h3>
                <p className="text-olive-600 mb-6">
                  {productToDelete 
                    ? 'Are you sure you want to delete this product? This action cannot be undone.'
                    : `Are you sure you want to delete ${selectedProducts.length} product(s)? This action cannot be undone.`
                  }
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setProductToDelete(null);
                    }}
                    className="btn-secondary"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (productToDelete) {
                        handleDeleteProduct(productToDelete);
                      } else {
                        handleBulkDelete();
                      }
                    }}
                    className="btn-danger"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
