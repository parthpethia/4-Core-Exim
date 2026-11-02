import React, { useState, useRef } from 'react';
import { FiPlus, FiTrash2, FiUpload, FiImage, FiLink } from 'react-icons/fi';
import { uploadProductImage } from '../../services/productService';

/**
 * Image manager component for product images.
 * Supports both external URL input and file upload to Supabase Storage.
 * @param {Object} props
 * @param {string[]} props.images - Current array of image URLs
 * @param {Function} props.onChange - Callback with updated images array
 * @param {string} [props.productId] - Product ID for storage path organization
 */
export default function ImageManager({ images = [], onChange, productId }) {
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...images, urlInput.trim()]);
    setUrlInput('');
  };

  const handleRemoveImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const publicUrl = await uploadProductImage(file, productId);
      onChange([...images, publicUrl]);
    } catch (err) {
      console.error('Image upload failed:', err);
      setUploadError(err.message || 'Upload failed. Check Supabase Storage configuration.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-brand-gray-700 uppercase tracking-wider block">
        Product Images
      </label>

      {/* Current Images Preview */}
      {images.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {images.map((img, index) => (
            <div key={index} className="relative group w-20 h-20 border border-brand-gray-200 rounded bg-brand-gray-50 overflow-hidden">
              <img
                src={img}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-contain p-1"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=Error'; }}
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Remove image"
              >
                <FiTrash2 className="text-[10px]" />
              </button>
              <span className="absolute bottom-0 left-0 right-0 bg-brand-gray-900/60 text-white text-[8px] text-center py-0.5 font-mono">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 py-3 px-3 border border-dashed border-brand-gray-300 rounded bg-brand-gray-50 text-brand-gray-400 text-xs">
          <FiImage className="text-base" />
          <span>No images added yet</span>
        </div>
      )}

      {/* Add Image by URL */}
      <div className="flex gap-2">
        <div className="flex items-center gap-1.5 flex-1 border border-brand-gray-300 rounded overflow-hidden">
          <span className="px-2 text-brand-gray-400">
            <FiLink className="text-xs" />
          </span>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
            placeholder="Paste image URL (https://...)"
            className="flex-1 py-1.5 pr-2 text-xs text-brand-gray-900 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={!urlInput.trim()}
          className="px-3 py-1.5 bg-brand-gray-100 hover:bg-brand-gray-200 text-brand-gray-700 text-xs font-bold rounded transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1 shrink-0"
        >
          <FiPlus className="text-xs" />
          <span>Add URL</span>
        </button>
      </div>

      {/* Upload File */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="product-image-upload"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-brand-gray-300 hover:border-brand-red-400 bg-white text-brand-gray-600 hover:text-brand-red-600 text-xs font-bold rounded transition-colors cursor-pointer disabled:opacity-50"
        >
          <FiUpload className="text-xs" />
          <span>{isUploading ? 'Uploading...' : 'Upload from device'}</span>
        </button>
        <span className="text-[10px] text-brand-gray-400">JPG, PNG, WebP (max 5MB)</span>
      </div>

      {uploadError && (
        <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
          {uploadError}
        </p>
      )}
    </div>
  );
}
