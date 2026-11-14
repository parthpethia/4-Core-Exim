import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Upload a product image to Supabase Storage.
 * @param {File} file - Image file
 * @param {string} [productId] - Optional product ID for path organization
 * @returns {Promise<string>} Public URL of the uploaded image
 */
export const uploadProductImage = async (file, productId) => {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = productId
    ? `${productId}/${timestamp}_${safeName}`
    : `uploads/${timestamp}_${safeName}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

/**
 * Delete a product image from Supabase Storage.
 * @param {string} imageUrl - Full public URL of the image
 */
export const deleteProductImage = async (imageUrl) => {
  // Extract the path from the full URL
  const bucketUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/`;
  if (!imageUrl.startsWith(bucketUrl)) {
    // External URL, not in our storage — nothing to delete
    return;
  }
  const filePath = imageUrl.replace(bucketUrl, '');

  const { error } = await supabase.storage
    .from('product-images')
    .remove([filePath]);

  if (error) throw error;
};
