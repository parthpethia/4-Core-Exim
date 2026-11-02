import { supabase, isSupabaseConfigured } from './supabaseClient';

// ---------------------------------------------------------------------------
// Fallback: Import static JSON data for when Supabase is not configured
// This allows the site to work in development without a database connection.
// Once Supabase is configured and seeded, these fallbacks are unused.
// ---------------------------------------------------------------------------
import companyDataFallback from '../data/company.json';
import categoriesDataFallback from '../data/categories.json';
import productsDataFallback from '../data/products.json';

// ---------------------------------------------------------------------------
// Helper: Convert snake_case DB row to camelCase for frontend components
// ---------------------------------------------------------------------------
function productRowToFrontend(row) {
  if (!row) return null;
  return {
    id: row.id,
    category: row.category_id,
    name: row.name,
    brand: row.brand,
    manufacturer: row.manufacturer,
    marketer: row.marketer,
    price: row.price != null ? String(row.price) : null,
    currency: row.currency || 'USD',
    strength: row.strength,
    packagingSize: row.packaging_size,
    packagingType: row.packaging_type,
    saltComposition: row.salt_composition,
    countryOfOrigin: row.country_of_origin,
    minimumOrderQuantity: row.minimum_order_quantity,
    storage: row.storage,
    treatment: row.treatment,
    description: row.description,
    images: row.images || [],
    specifications: row.specifications || {},
    isActive: row.is_active
  };
}

/**
 * Convert camelCase frontend form data to snake_case DB row for insert/update.
 */
function productFrontendToRow(product) {
  const row = {};
  if (product.id !== undefined) row.id = product.id;
  if (product.category !== undefined) row.category_id = product.category;
  if (product.name !== undefined) row.name = product.name;
  if (product.brand !== undefined) row.brand = product.brand;
  if (product.manufacturer !== undefined) row.manufacturer = product.manufacturer;
  if (product.marketer !== undefined) row.marketer = product.marketer;
  if (product.price !== undefined) row.price = product.price ? parseFloat(product.price) : null;
  if (product.currency !== undefined) row.currency = product.currency;
  if (product.strength !== undefined) row.strength = product.strength;
  if (product.packagingSize !== undefined) row.packaging_size = product.packagingSize;
  if (product.packagingType !== undefined) row.packaging_type = product.packagingType;
  if (product.saltComposition !== undefined) row.salt_composition = product.saltComposition;
  if (product.countryOfOrigin !== undefined) row.country_of_origin = product.countryOfOrigin;
  if (product.minimumOrderQuantity !== undefined) row.minimum_order_quantity = product.minimumOrderQuantity;
  if (product.storage !== undefined) row.storage = product.storage;
  if (product.treatment !== undefined) row.treatment = product.treatment;
  if (product.description !== undefined) row.description = product.description;
  if (product.images !== undefined) row.images = product.images;
  if (product.specifications !== undefined) row.specifications = product.specifications;
  if (product.isActive !== undefined) row.is_active = product.isActive;
  return row;
}

function companyRowToFrontend(row) {
  if (!row) return null;
  return {
    name: row.name || companyDataFallback.name,
    subtitle: row.subtitle || companyDataFallback.subtitle,
    email: row.email || companyDataFallback.email,
    phone: row.phone || companyDataFallback.phone,
    whatsapp: row.whatsapp || companyDataFallback.whatsapp,
    address: row.address || companyDataFallback.address,
    businessHours: row.business_hours || companyDataFallback.businessHours,
    googleMapsEmbedUrl: row.google_maps_embed_url || companyDataFallback.googleMapsEmbedUrl,
    aboutShort: row.about_short || companyDataFallback.aboutShort,
    aboutFull: row.about_full && Object.keys(row.about_full).length > 0 
      ? row.about_full 
      : companyDataFallback.aboutFull
  };
}

function companyFrontendToRow(company) {
  const row = { id: 1 };
  if (company.name !== undefined) row.name = company.name;
  if (company.subtitle !== undefined) row.subtitle = company.subtitle;
  if (company.email !== undefined) row.email = company.email;
  if (company.phone !== undefined) row.phone = company.phone;
  if (company.whatsapp !== undefined) row.whatsapp = company.whatsapp;
  if (company.address !== undefined) row.address = company.address;
  if (company.businessHours !== undefined) row.business_hours = company.businessHours;
  if (company.googleMapsEmbedUrl !== undefined) row.google_maps_embed_url = company.googleMapsEmbedUrl;
  if (company.aboutShort !== undefined) row.about_short = company.aboutShort;
  if (company.aboutFull !== undefined) row.about_full = company.aboutFull;
  return row;
}

// ===========================================================================
// PUBLIC READ FUNCTIONS (used by Catalog, Home, ProductCard, etc.)
// ===========================================================================

/**
 * Get company info.
 * @returns {Promise<Object>}
 */
export const getCompanyInfo = async () => {
  if (!isSupabaseConfigured) {
    return { ...companyDataFallback };
  }

  try {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { ...companyDataFallback };
    return companyRowToFrontend(data) || { ...companyDataFallback };
  } catch (err) {
    console.warn('[4Core Exim] Failed to fetch company from DB, using fallback:', err.message);
    return { ...companyDataFallback };
  }
};

/**
 * Get categories, including the active product count for each.
 * @returns {Promise<Array>}
 */
export const getCategories = async () => {
  if (!isSupabaseConfigured) {
    // Fallback to static data with in-memory counts
    const counts = {};
    productsDataFallback.forEach(product => {
      const catId = product.category;
      counts[catId] = (counts[catId] || 0) + 1;
    });
    return categoriesDataFallback.map(cat => ({
      ...cat,
      productCount: counts[cat.id] || 0
    }));
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*, products(count)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return data.map(cat => ({
      id: cat.id,
      name: cat.name,
      image: cat.image,
      sortOrder: cat.sort_order,
      productCount: cat.products?.[0]?.count || 0
    }));
  } catch (err) {
    console.warn('[4Core Exim] Failed to fetch categories from DB, using fallback:', err.message);
    const counts = {};
    productsDataFallback.forEach(product => {
      counts[product.category] = (counts[product.category] || 0) + 1;
    });
    return categoriesDataFallback.map(cat => ({
      ...cat,
      productCount: counts[cat.id] || 0
    }));
  }
};

/**
 * Get all categories including inactive ones (for admin management).
 * @returns {Promise<Array>}
 */
export const getAllCategories = async () => {
  if (!isSupabaseConfigured) {
    return categoriesDataFallback.map((cat, i) => ({
      ...cat,
      sortOrder: i,
      isActive: true,
      productCount: 0
    }));
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*, products(count)')
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return data.map(cat => ({
    id: cat.id,
    name: cat.name,
    image: cat.image,
    sortOrder: cat.sort_order,
    isActive: cat.is_active,
    productCount: cat.products?.[0]?.count || 0
  }));
};

/**
 * Get products based on optional filters.
 * @param {Object} [filters]
 * @param {string} [filters.category] - Category ID filter
 * @param {string} [filters.search] - Search text query
 * @returns {Promise<Array>}
 */
export const getProducts = async (filters = {}) => {
  if (!isSupabaseConfigured) {
    // Fallback to static in-memory filtering
    let filtered = [...productsDataFallback];
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    if (filters.search) {
      const query = filters.search.toLowerCase().trim();
      filtered = filtered.filter(p =>
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.brand && p.brand.toLowerCase().includes(query)) ||
        (p.saltComposition && p.saltComposition.toLowerCase().includes(query)) ||
        (p.manufacturer && p.manufacturer.toLowerCase().includes(query)) ||
        (p.strength && p.strength.toLowerCase().includes(query)) ||
        (p.treatment && p.treatment.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }
    return filtered;
  }

  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category_id', filters.category);
    }

    // Filter by search text — use ilike for multi-field search
    if (filters.search) {
      const searchTerm = `%${filters.search.trim()}%`;
      query = query.or(
        `name.ilike.${searchTerm},` +
        `brand.ilike.${searchTerm},` +
        `salt_composition.ilike.${searchTerm},` +
        `manufacturer.ilike.${searchTerm},` +
        `strength.ilike.${searchTerm},` +
        `treatment.ilike.${searchTerm},` +
        `description.ilike.${searchTerm}`
      );
    }

    query = query.order('name', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    return data.map(productRowToFrontend);
  } catch (err) {
    console.warn('[4Core Exim] Failed to fetch products from DB, using fallback:', err.message);
    return [...productsDataFallback];
  }
};

/**
 * Get a single product by ID.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export const getProductById = async (id) => {
  if (!isSupabaseConfigured) {
    const product = productsDataFallback.find(p => p.id === id);
    return product ? { ...product } : null;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return productRowToFrontend(data);
  } catch (err) {
    console.warn('[4Core Exim] Failed to fetch product by ID:', err.message);
    const product = productsDataFallback.find(p => p.id === id);
    return product ? { ...product } : null;
  }
};

// ===========================================================================
// ADMIN CRUD FUNCTIONS (used by Admin Dashboard)
// ===========================================================================

// ---- Products CRUD ----

/**
 * Get all products including inactive (for admin table).
 * @param {Object} [filters]
 * @returns {Promise<Array>}
 */
export const getAdminProducts = async (filters = {}) => {
  let query = supabase
    .from('products')
    .select('*');

  if (filters.category && filters.category !== 'all') {
    query = query.eq('category_id', filters.category);
  }

  if (filters.search) {
    const searchTerm = `%${filters.search.trim()}%`;
    query = query.or(
      `name.ilike.${searchTerm},` +
      `brand.ilike.${searchTerm},` +
      `salt_composition.ilike.${searchTerm}`
    );
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data.map(productRowToFrontend);
};

/**
 * Create a new product.
 * @param {Object} productData - Product data in camelCase (frontend format)
 * @returns {Promise<Object>} Created product
 */
export const createProduct = async (productData) => {
  const row = productFrontendToRow(productData);

  const { data, error } = await supabase
    .from('products')
    .insert([row])
    .select()
    .single();

  if (error) throw error;
  return productRowToFrontend(data);
};

/**
 * Update an existing product.
 * @param {string} id - Product ID
 * @param {Object} productData - Fields to update (camelCase)
 * @returns {Promise<Object>} Updated product
 */
export const updateProduct = async (id, productData) => {
  const row = productFrontendToRow(productData);

  const { data, error } = await supabase
    .from('products')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return productRowToFrontend(data);
};

/**
 * Soft-delete a product (set is_active = false).
 * @param {string} id
 */
export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
};

/**
 * Hard-delete a product permanently.
 * @param {string} id
 */
export const hardDeleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Toggle product active status.
 * @param {string} id
 * @param {boolean} isActive
 */
export const toggleProductActive = async (id, isActive) => {
  const { data, error } = await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return productRowToFrontend(data);
};

// ---- Categories CRUD ----

/**
 * Create a new category.
 * @param {Object} categoryData - { id, name, image }
 * @returns {Promise<Object>}
 */
export const createCategory = async (categoryData) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([{
      id: categoryData.id,
      name: categoryData.name,
      image: categoryData.image || null,
      sort_order: categoryData.sortOrder || 0,
      is_active: true
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update a category.
 * @param {string} id
 * @param {Object} categoryData
 * @returns {Promise<Object>}
 */
export const updateCategory = async (id, categoryData) => {
  const updates = {};
  if (categoryData.name !== undefined) updates.name = categoryData.name;
  if (categoryData.image !== undefined) updates.image = categoryData.image;
  if (categoryData.sortOrder !== undefined) updates.sort_order = categoryData.sortOrder;
  if (categoryData.isActive !== undefined) updates.is_active = categoryData.isActive;

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a category (soft-delete).
 * @param {string} id
 */
export const deleteCategory = async (id) => {
  const { error } = await supabase
    .from('categories')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
};

// ---- Company Settings ----

/**
 * Update company settings.
 * @param {Object} companyData - Company data in camelCase
 * @returns {Promise<Object>}
 */
export const updateCompanySettings = async (companyData) => {
  const row = companyFrontendToRow(companyData);

  const { data, error } = await supabase
    .from('company_settings')
    .update(row)
    .eq('id', 1)
    .select()
    .single();

  if (error) throw error;
  return companyRowToFrontend(data);
};

// ---- Inquiries ----

/**
 * Submit a B2B inquiry (public — anyone can insert).
 * @param {Object} inquiryData
 * @returns {Promise<Object>}
 */
export const submitInquiry = async (inquiryData) => {
  const { data, error } = await supabase
    .from('inquiries')
    .insert([{
      product_id: inquiryData.productId || null,
      product_name: inquiryData.productName || null,
      category_name: inquiryData.categoryName || null,
      phone: inquiryData.phone || null,
      country_code: inquiryData.countryCode || null,
      business_name: inquiryData.businessName || null,
      incoterm: inquiryData.incoterm || null,
      destination_port: inquiryData.destinationPort || null,
      status: 'new'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get all inquiries (admin only).
 * @param {Object} [filters]
 * @returns {Promise<Array>}
 */
export const getInquiries = async (filters = {}) => {
  let query = supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

/**
 * Update inquiry status (admin only).
 * @param {string} id - Inquiry UUID
 * @param {Object} updates - { status, notes }
 * @returns {Promise<Object>}
 */
export const updateInquiryStatus = async (id, updates) => {
  const row = {};
  if (updates.status) row.status = updates.status;
  if (updates.notes !== undefined) row.notes = updates.notes;

  const { data, error } = await supabase
    .from('inquiries')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ===========================================================================
// STORAGE (Image Upload)
// ===========================================================================

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
