import { supabase, isSupabaseConfigured } from './supabaseClient';
import { cacheInvalidate } from '../utils/queryCache';
import { normalizeCurrencyCode } from '../utils/marketLocation';

// ---------------------------------------------------------------------------
// Internal Helpers: snake_case DB ↔ camelCase Frontend
// ---------------------------------------------------------------------------

function productRowToFrontend(row) {
  if (!row) return null;
  const currency = normalizeCurrencyCode(row.currency || 'USD');
  return {
    id: row.id,
    category: row.category_id,
    name: row.name,
    brand: row.brand,
    manufacturer: row.manufacturer,
    marketer: row.marketer,
    price: row.price != null ? String(row.price) : null,
    currency,
    strength: row.strength,
    packagingSize: row.packaging_size,
    packagingType: row.packaging_type,
    saltComposition: row.salt_composition,
    countryOfOrigin: row.country_of_origin,
    originCountryCode: row.origin_country_code || null,
    minimumOrderQuantity: row.minimum_order_quantity,
    storage: row.storage,
    treatment: row.treatment,
    description: row.description,
    images: row.images || (row.thumbnail_url ? [row.thumbnail_url] : []),
    thumbnailUrl: row.thumbnail_url || (row.images && row.images[0]) || null,
    imageCount: row.image_count != null
      ? Number(row.image_count)
      : (row.images ? row.images.length : (row.thumbnail_url ? 1 : 0)),
    specifications: row.specifications || {},
    isActive: row.is_active !== false,
    createdAt: row.created_at
  };
}

function productFrontendToRow(product) {
  const row = {};
  if (product.id !== undefined) row.id = product.id;
  if (product.category !== undefined) row.category_id = product.category;
  if (product.name !== undefined) row.name = product.name;
  if (product.brand !== undefined) row.brand = product.brand;
  if (product.manufacturer !== undefined) row.manufacturer = product.manufacturer;
  if (product.marketer !== undefined) row.marketer = product.marketer;
  if (product.price !== undefined) row.price = product.price ? parseFloat(product.price) : null;
  if (product.currency !== undefined) row.currency = normalizeCurrencyCode(product.currency);
  if (product.strength !== undefined) row.strength = product.strength;
  if (product.packagingSize !== undefined) row.packaging_size = product.packagingSize;
  if (product.packagingType !== undefined) row.packaging_type = product.packagingType;
  if (product.saltComposition !== undefined) row.salt_composition = product.saltComposition;
  if (product.countryOfOrigin !== undefined) row.country_of_origin = product.countryOfOrigin;
  if (product.originCountryCode !== undefined) row.origin_country_code = product.originCountryCode;
  if (product.minimumOrderQuantity !== undefined) row.minimum_order_quantity = product.minimumOrderQuantity;
  if (product.storage !== undefined) row.storage = product.storage;
  if (product.treatment !== undefined) row.treatment = product.treatment;
  if (product.description !== undefined) row.description = product.description;
  if (product.images !== undefined) row.images = product.images;
  if (product.specifications !== undefined) row.specifications = product.specifications;
  if (product.isActive !== undefined) row.is_active = product.isActive;
  return row;
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

function companyRowToFrontend(row) {
  if (!row) return null;
  return {
    name: row.name || '',
    subtitle: row.subtitle || '',
    email: row.email || '',
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    address: row.address || '',
    businessHours: row.business_hours || '',
    googleMapsEmbedUrl: row.google_maps_embed_url || '',
    aboutShort: row.about_short || '',
    aboutFull: row.about_full && Object.keys(row.about_full).length > 0
      ? row.about_full
      : {}
  };
}

// ===========================================================================
// AUDIT LOGGING
// ===========================================================================

/**
 * Log an admin action to the audit trail.
 * Fire-and-forget — never throws.
 * @param {Object} params
 * @param {string} params.action - 'create' | 'update' | 'delete' | 'status_change' | 'bulk_import' | 'bulk_export'
 * @param {string} params.entityType - 'product' | 'category' | 'company' | 'inquiry'
 * @param {string} params.entityId
 * @param {Object} [params.changes={}]
 */
export async function logAuditEvent({ action, entityType, entityId, changes = {} }) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email || 'unknown';
    await supabase.from('admin_audit_logs').insert([{
      actor_email: email,
      action,
      entity_type: entityType,
      entity_id: String(entityId),
      changes
    }]);
  } catch (err) {
    // Audit logging should never block the main operation
    console.warn('[4Core Exim] Audit log failed:', err.message);
  }
}

// ===========================================================================
// ERROR MAPPING
// ===========================================================================

/**
 * Maps Supabase/Postgres error codes to user-friendly messages.
 * @param {Object} error - Supabase error object with .code and .message
 * @returns {string} User-friendly error message
 */
export function mapSupabaseError(error) {
  if (!error) return 'An unknown error occurred.';
  const code = error.code || '';
  const msg = error.message || '';

  if (code === '23505' || msg.includes('duplicate key')) {
    if (msg.includes('products_pkey')) {
      return 'A product with this ID (slug) already exists. Please use a different name or customize the slug.';
    }
    return 'A record with this identifier already exists.';
  }
  if (code === '23503' || msg.includes('foreign key')) {
    if (msg.includes('category_id')) {
      return 'The selected category does not exist in the database. Please choose a valid category.';
    }
    return 'A referenced record does not exist. Please check your selections.';
  }
  if (code === '42501' || msg.includes('permission denied') || msg.includes('new row violates row-level security')) {
    return 'Permission denied. Your Trade Desk session may have expired — please sign in again.';
  }
  if (code === '42P01') {
    return 'A required database table is missing. Please contact the system administrator.';
  }
  return msg || 'An unexpected database error occurred. Please try again.';
}

// ===========================================================================
// CACHE INVALIDATION
// ===========================================================================

/** Call after admin mutates catalog data so clients refresh soon */
export const invalidateCatalogCache = () => {
  cacheInvalidate('categories:');
  cacheInvalidate('countries:');
  cacheInvalidate('fx_rates');
};

// ===========================================================================
// PAGINATED ADMIN PRODUCTS (Server-Side)
// ===========================================================================

/**
 * Paginated admin product list with server-side filtering, sorting, and search.
 * Uses Supabase { count: 'exact' } and .range() for true SQL pagination.
 *
 * @param {Object} options
 * @param {number} [options.page=1]
 * @param {number} [options.pageSize=20]
 * @param {string} [options.category='all']
 * @param {string} [options.search='']
 * @param {string} [options.status='all'] - 'all' | 'active' | 'inactive'
 * @param {string} [options.sortBy='created_at']
 * @param {string} [options.sortOrder='desc']
 * @returns {Promise<{products: Array, totalCount: number, page: number, pageSize: number, totalPages: number}>}
 */
export const getAdminProductsPaginated = async ({
  page = 1,
  pageSize = 20,
  category = 'all',
  search = '',
  status = 'all',
  sortBy = 'created_at',
  sortOrder = 'desc'
} = {}) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('products')
    .select(
      'id, name, brand, category_id, price, currency, strength, packaging_size, salt_composition, is_active, created_at, thumbnail_url, image_count',
      { count: 'exact' }
    );

  if (category !== 'all') {
    query = query.eq('category_id', category);
  }
  if (status === 'active') {
    query = query.eq('is_active', true);
  } else if (status === 'inactive') {
    query = query.eq('is_active', false);
  }
  if (search.trim()) {
    const term = search.trim();
    query = query.or(
      `name.ilike.%${term}%,brand.ilike.%${term}%,salt_composition.ilike.%${term}%`
    );
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    products: (data || []).map(productRowToFrontend),
    totalCount: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
};

// ===========================================================================
// BACKWARD-COMPATIBLE ADMIN PRODUCTS (non-paginated)
// ===========================================================================

/**
 * Get all products including inactive (for admin table — legacy non-paginated).
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

// ===========================================================================
// CATEGORIES (Admin — all including inactive)
// ===========================================================================

/**
 * Get all categories including inactive ones (for admin management).
 * @returns {Promise<Array>}
 */
export const getAllCategories = async () => {
  if (!isSupabaseConfigured) {
    return [];
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

// ===========================================================================
// PRODUCTS CRUD (Admin)
// ===========================================================================

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
  invalidateCatalogCache();
  logAuditEvent({ action: 'create', entityType: 'product', entityId: data.id, changes: row });
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
  invalidateCatalogCache();
  logAuditEvent({ action: 'update', entityType: 'product', entityId: id, changes: row });
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
  invalidateCatalogCache();
  logAuditEvent({ action: 'delete', entityType: 'product', entityId: id });
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
  logAuditEvent({ action: 'delete', entityType: 'product', entityId: id, changes: { permanent: true } });
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
  logAuditEvent({ action: 'status_change', entityType: 'product', entityId: id, changes: { is_active: isActive } });
  return productRowToFrontend(data);
};

// ===========================================================================
// CATEGORIES CRUD (Admin)
// ===========================================================================

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
  logAuditEvent({ action: 'create', entityType: 'category', entityId: data.id });
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
  logAuditEvent({ action: 'update', entityType: 'category', entityId: id, changes: updates });
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
  logAuditEvent({ action: 'delete', entityType: 'category', entityId: id });
};

// ===========================================================================
// COMPANY SETTINGS (Admin)
// ===========================================================================

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
  logAuditEvent({ action: 'update', entityType: 'company', entityId: '1', changes: row });
  return companyRowToFrontend(data);
};
