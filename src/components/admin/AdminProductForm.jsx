import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';
import SpecificationsEditor from './SpecificationsEditor';
import ImageManager from './ImageManager';
import { createProduct, updateProduct } from '../../services/productService';

/**
 * Generate URL-friendly slug from product name.
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const EMPTY_FORM = {
  id: '',
  name: '',
  category: '',
  brand: '',
  manufacturer: '',
  marketer: 'Thakkar Medico Traders',
  price: '',
  currency: 'USD',
  strength: '',
  packagingSize: '',
  packagingType: '',
  saltComposition: '',
  countryOfOrigin: 'India',
  minimumOrderQuantity: '',
  storage: '',
  treatment: '',
  description: '',
  images: [],
  specifications: {}
};

/**
 * AdminProductForm — Modal form for creating and editing products.
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onSave - Called after successful create/update
 * @param {Object|null} props.product - null = create mode, object = edit mode
 * @param {Array} props.categories - For the category dropdown
 */
export default function AdminProductForm({ isOpen, onClose, onSave, product, categories = [] }) {
  const isEditMode = Boolean(product);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Populate form when product changes (edit mode)
  useEffect(() => {
    if (product) {
      setForm({
        id: product.id || '',
        name: product.name || '',
        category: product.category || '',
        brand: product.brand || '',
        manufacturer: product.manufacturer || '',
        marketer: product.marketer || 'Thakkar Medico Traders',
        price: product.price || '',
        currency: product.currency || 'USD',
        strength: product.strength || '',
        packagingSize: product.packagingSize || '',
        packagingType: product.packagingType || '',
        saltComposition: product.saltComposition || '',
        countryOfOrigin: product.countryOfOrigin || 'India',
        minimumOrderQuantity: product.minimumOrderQuantity || '',
        storage: product.storage || '',
        treatment: product.treatment || '',
        description: product.description || '',
        images: product.images || [],
        specifications: product.specifications || {}
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [product, isOpen]);

  // Auto-generate slug ID from name (only in create mode)
  const handleNameChange = (name) => {
    setForm(prev => ({
      ...prev,
      name,
      ...(isEditMode ? {} : { id: generateSlug(name) })
    }));
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (!form.name.trim()) throw new Error('Product name is required.');
      if (!form.id.trim()) throw new Error('Product ID (slug) is required.');
      if (!form.category) throw new Error('Please select a category.');

      if (isEditMode) {
        await updateProduct(form.id, form);
      } else {
        await createProduct(form);
      }

      onSave();
    } catch (err) {
      console.error('Product save failed:', err);
      setError(err.message || 'Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-brand-gray-950/70 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white border border-brand-gray-300 rounded-xl shadow-xl w-full max-w-3xl z-10 my-8 overflow-hidden">

        {/* Header */}
        <div className="bg-brand-gray-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h3 className="text-sm font-bold tracking-tight">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-[11px] text-brand-gray-300">
              {isEditMode ? `Editing: ${product.name}` : 'Fill in the product details below'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-brand-gray-800 text-brand-gray-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Row: ID + Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-brand-gray-700 mb-1">
                Product ID (Slug) *
              </label>
              <input
                type="text"
                value={form.id}
                onChange={(e) => handleChange('id', e.target.value)}
                disabled={isEditMode}
                placeholder="auto-generated"
                className="w-full border border-brand-gray-300 rounded px-3 py-2 text-xs text-brand-gray-900 font-mono focus:outline-none focus:border-brand-red-400 disabled:bg-brand-gray-100 disabled:text-brand-gray-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-brand-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Azithromycin Tablets IP 500mg"
                className="w-full border border-brand-gray-300 rounded px-3 py-2 text-xs text-brand-gray-900 font-semibold focus:outline-none focus:border-brand-red-400"
                required
              />
            </div>
          </div>

          {/* Row: Category + Brand + Manufacturer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-brand-gray-700 mb-1">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full border border-brand-gray-300 rounded px-3 py-2 text-xs text-brand-gray-900 bg-white focus:outline-none focus:border-brand-red-400"
                required
              >
                <option value="">Select category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-gray-700 mb-1">Brand</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                placeholder="e.g. Azee 500"
                className="w-full border border-brand-gray-300 rounded px-3 py-2 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-red-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-gray-700 mb-1">Manufacturer</label>
              <input
                type="text"
                value={form.manufacturer}
                onChange={(e) => handleChange('manufacturer', e.target.value)}
                placeholder="e.g. Cipla Ltd"
                className="w-full border border-brand-gray-300 rounded px-3 py-2 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-red-400"
              />
            </div>
          </div>

          {/* Row: Marketer + Country of Origin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-brand-gray-700 mb-1">Marketer</label>
              <input
                type="text"
                value={form.marketer}
                onChange={(e) => handleChange('marketer', e.target.value)}
                placeholder="e.g. Thakkar Medico Traders"
                className="w-full border border-brand-gray-300 rounded px-3 py-2 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-red-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-gray-700 mb-1">Country of Origin</label>
              <input
                type="text"
                value={form.countryOfOrigin}
                onChange={(e) => handleChange('countryOfOrigin', e.target.value)}
                placeholder="e.g. India"
                className="w-full border border-brand-gray-300 rounded px-3 py-2 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-red-400"
              />
            </div>
          </div>

          {/* Row: Price + Currency + Strength */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-brand-gray-700 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="0.00"
                className="w-full border border-brand-gray-300 rounded px-3 py-2 text-xs text-brand-gray-900 font-mono focus:outline-none focus:border-brand-red-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-gray-700 mb-1">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full border border-brand-gray-300 rounded px-3 py-2 text-xs text-brand-gray-900 bg-white focus:outline-none focus:border-brand-red-400"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-gray-700 mb-1">Strength</label>
              <input
                type="text"
                value={form.strength}
                onChange={(e) => handleChange('strength', e.target.value)}
                placeholder="e.g. 500mg"
                className="w-full border border-brand-gray-300 rounded px-3 py-2 text-xs text-brand-gray-900 font-mono focus:outline-none focus:border-brand-red-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-gray-700 mb-1">MOQ</label>
              <input
                type="text"
                value={form.minimumOrderQuantity}
                onChange={(e) => handleChange('minimumOrderQuantity', e.target.value)}
                placeholder="e.g. 50 Boxes"
                className="w-full border border-brand-gray-300 rounded px-3 py-2 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-red-400"
              />
            </div>
          </div>

          {/* Row: Packaging Size + Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-brand-gray-700 mb-1">Packaging Size</label>
              <input
                type="text"
                value={form.packagingSize}
                onChange={(e) => handleChange('packagingSize', e.target.value)}
                placeholder="e.g. 10x10 Capsules"
                className="w-full border border-brand-gray-300 rounded px-3 py-2 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-red-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-gray-700 mb-1">Packaging Type</label>
              <input
                type="text"
                value={form.packagingType}
                onChange={(e) => handleChange('packagingType', e.target.value)}
                placeholder="e.g. Blister Box"
                className="w-full border border-brand-gray-300 rounded px-3 py-2 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-red-400"
              />
            </div>
          </div>

          {/* Salt Composition */}
          <div>
            <label className="block text-xs font-bold text-brand-gray-700 mb-1">
              Salt Composition / Active Ingredient (API)
            </label>
            <textarea
              value={form.saltComposition}
              onChange={(e) => handleChange('saltComposition', e.target.value)}
              placeholder="e.g. Azithromycin Dihydrate IP equivalent to Anhydrous Azithromycin 500mg"
              rows={2}
              className="w-full border border-brand-gray-300 rounded px-3 py-2 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-red-400 resize-none"
            />
          </div>

          {/* Treatment / Therapeutic Use */}
          <div>
            <label className="block text-xs font-bold text-brand-gray-700 mb-1">
              Therapeutic Use / Treatment
            </label>
            <input
              type="text"
              value={form.treatment}
              onChange={(e) => handleChange('treatment', e.target.value)}
              placeholder="e.g. Community-Acquired Pneumonia, Strep Throat"
              className="w-full border border-brand-gray-300 rounded px-3 py-2 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-red-400"
            />
          </div>

          {/* Storage */}
          <div>
            <label className="block text-xs font-bold text-brand-gray-700 mb-1">
              Storage & Stability Instructions
            </label>
            <input
              type="text"
              value={form.storage}
              onChange={(e) => handleChange('storage', e.target.value)}
              placeholder="e.g. Store below 30°C. Protect from light and moisture."
              className="w-full border border-brand-gray-300 rounded px-3 py-2 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-red-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-brand-gray-700 mb-1">
              Product Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Detailed product description for the catalog..."
              rows={3}
              className="w-full border border-brand-gray-300 rounded px-3 py-2 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-red-400 resize-none"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-brand-gray-200 pt-4">
            {/* Images */}
            <ImageManager
              images={form.images}
              onChange={(imgs) => handleChange('images', imgs)}
              productId={form.id || undefined}
            />
          </div>

          {/* Specifications */}
          <div className="border-t border-brand-gray-200 pt-4">
            <SpecificationsEditor
              specifications={form.specifications}
              onChange={(specs) => handleChange('specifications', specs)}
            />
          </div>

        </form>

        {/* Sticky Footer */}
        <div className="bg-brand-gray-50 border-t border-brand-gray-200 px-6 py-3.5 flex items-center justify-between sticky bottom-0">
          <span className="text-[11px] text-brand-gray-500">
            {isEditMode ? `ID: ${form.id}` : form.id ? `Slug: ${form.id}` : 'Fill name to auto-generate slug'}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-brand-gray-300 hover:bg-white text-brand-gray-700 text-xs font-bold rounded transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2 bg-brand-red-600 hover:bg-brand-red-700 text-white text-xs font-bold rounded transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <FiLoader className="text-xs animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSave className="text-xs" />
                  <span>{isEditMode ? 'Update Product' : 'Create Product'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
