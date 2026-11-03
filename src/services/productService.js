import { supabase, isSupabaseConfigured } from './supabaseClient';

// ---------------------------------------------------------------------------
// Fallback: Import static JSON data for when Supabase is not configured
// This allows the site to work in development without a database connection.
// Once Supabase is configured and seeded, these fallbacks are unused.
// ---------------------------------------------------------------------------
import companyDataFallback from '../data/company.json';
import categoriesDataFallback from '../data/categories.json';
import productsDataFallback from '../data/products.json';
import {
  convertPrice,
  getMarketCategoryBoost,
  normalizeCurrencyCode
} from '../utils/marketLocation';
import { cacheGetOrSet, cacheInvalidate } from '../utils/queryCache';

/** Default page size for public catalog lists */
export const CATALOG_PAGE_SIZE = 24;

/** Static FX fallbacks (rate_to_usd) used when DB FX table is unavailable */
const FX_FALLBACK = {
  USD: 1, INR: 0.012, AED: 0.2723, SAR: 0.2667, NGN: 0.00065, KES: 0.0077,
  GHS: 0.064, EGP: 0.0205, BDT: 0.0083, NPR: 0.0075, LKR: 0.0033, MMK: 0.00048,
  VND: 0.00004, PHP: 0.0175, IDR: 0.000063, MYR: 0.225, GBP: 1.27, EUR: 1.08,
  DKK: 0.145, BRL: 0.18, ZAR: 0.055
};

const MARKET_CURRENCY = {
  IN: 'INR', AE: 'AED', SA: 'SAR', NG: 'NGN', KE: 'KES', GH: 'GHS', EG: 'EGP',
  BD: 'BDT', NP: 'NPR', LK: 'LKR', MM: 'MMK', VN: 'VND', PH: 'PHP', ID: 'IDR',
  MY: 'MYR', GB: 'GBP', DE: 'EUR', DK: 'DKK', US: 'USD', BR: 'BRL', ZA: 'ZAR'
};

// ---------------------------------------------------------------------------
// Helper: Convert snake_case DB row to camelCase for frontend components
// ---------------------------------------------------------------------------
function productRowToFrontend(row) {
  if (!row) return null;
  const currency = normalizeCurrencyCode(row.currency || 'USD');
  const displayCurrency = normalizeCurrencyCode(
    row.display_currency || row.preferred_currency || currency
  );
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
    marketPriority: row.market_priority ?? 0,
    isFeatured: !!row.is_featured,
    preferredCurrency: row.preferred_currency || null,
    displayCurrency,
    priceInUsd: row.price_in_usd != null ? Number(row.price_in_usd) : null,
    priceInDisplay: row.price_in_display != null ? Number(row.price_in_display) : null,
    searchRank: row.search_rank != null ? Number(row.search_rank) : 0,
    totalCount: row.total_count != null ? Number(row.total_count) : undefined,
    /** true when row came from lite RPC (full images/specs/description may be missing) */
    isLite: !!(row.thumbnail_url != null && row.images == null && row.specifications == null && row.description == null)
      || row.__lite === true
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

function mapCategoriesFallback(marketCountry) {
  const counts = {};
  productsDataFallback.forEach(product => {
    counts[product.category] = (counts[product.category] || 0) + 1;
  });
  const boostOrder = getMarketCategoryBoost(marketCountry);
  return [...categoriesDataFallback]
    .map(cat => ({
      ...cat,
      productCount: counts[cat.id] || 0,
      marketBoost: boostOrder.includes(cat.id)
        ? (boostOrder.length - boostOrder.indexOf(cat.id)) * 100
        : 0
    }))
    .sort((a, b) => {
      if (b.marketBoost !== a.marketBoost) return b.marketBoost - a.marketBoost;
      return (b.productCount || 0) - (a.productCount || 0);
    });
}

/**
 * Get categories, including the active product count for each.
 * When marketCountry is set, categories are reordered for that export market.
 * @param {Object} [options]
 * @param {string} [options.marketCountry] - ISO country code for market targeting
 * @returns {Promise<Array>}
 */
export const getCategories = async (options = {}) => {
  const marketCountry = options.marketCountry || null;
  const cacheKey = `categories:${marketCountry || 'default'}`;

  return cacheGetOrSet(cacheKey, async () => {
    if (!isSupabaseConfigured) {
      return mapCategoriesFallback(marketCountry);
    }

    try {
      if (marketCountry) {
        const { data, error } = await supabase.rpc('get_market_categories', {
          p_market_country: marketCountry
        });
        if (error) throw error;
        return (data || []).map(cat => ({
          id: cat.id,
          name: cat.name,
          image: cat.image,
          sortOrder: cat.sort_order,
          productCount: Number(cat.product_count) || 0,
          marketBoost: Number(cat.market_boost) || 0
        }));
      }

      const { data, error } = await supabase
        .from('categories')
        .select('id, name, image, sort_order, products(count)')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      return data.map(cat => ({
        id: cat.id,
        name: cat.name,
        image: cat.image,
        sortOrder: cat.sort_order,
        productCount: cat.products?.[0]?.count || 0,
        marketBoost: 0
      }));
    } catch (err) {
      console.warn('[4Core Exim] Failed to fetch categories from DB, using fallback:', err.message);
      return mapCategoriesFallback(marketCountry);
    }
  }, 90_000);
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

function enrichFallbackProduct(product, marketCountry, fxMap) {
  const currency = normalizeCurrencyCode(product.currency);
  const displayCurrency = MARKET_CURRENCY[marketCountry] || 'USD';
  const boostCats = getMarketCategoryBoost(marketCountry);
  const catBoost = boostCats.includes(product.category)
    ? (boostCats.length - boostCats.indexOf(product.category)) * 20
    : 0;
  const priceInDisplay = convertPrice(product.price, currency, displayCurrency, fxMap);
  const priceInUsd = convertPrice(product.price, currency, 'USD', fxMap);
  const thumbnailUrl = Array.isArray(product.images) && product.images[0]
    ? product.images[0]
    : null;
  return {
    ...product,
    currency,
    originCountryCode: product.countryOfOrigin === 'Germany' ? 'DE'
      : product.countryOfOrigin === 'Denmark' ? 'DK' : 'IN',
    marketPriority: catBoost,
    isFeatured: catBoost >= 40,
    displayCurrency,
    priceInUsd,
    priceInDisplay,
    searchRank: 0,
    thumbnailUrl,
    imageCount: Array.isArray(product.images) ? product.images.length : 0,
    isLite: false
  };
}

function filterProductsFallback(filters = {}) {
  const fxMap = FX_FALLBACK;
  const marketCountry = filters.marketCountry || null;
  let filtered = productsDataFallback.map(p =>
    enrichFallbackProduct(p, marketCountry, fxMap)
  );

  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(p => p.category === filters.category);
  }
  if (filters.originCountry) {
    filtered = filtered.filter(p => p.originCountryCode === filters.originCountry);
  }
  if (filters.search) {
    const query = filters.search.toLowerCase().trim();
    filtered = filtered
      .map(p => {
        const hay = [
          p.name, p.brand, p.saltComposition, p.manufacturer,
          p.strength, p.treatment, p.description
        ].filter(Boolean).join(' ').toLowerCase();
        const hit = hay.includes(query);
        return hit ? { ...p, searchRank: hit ? 1 : 0 } : null;
      })
      .filter(Boolean);
  }
  if (filters.pharmacopeia && filters.pharmacopeia !== 'all') {
    const mono = filters.pharmacopeia.toUpperCase();
    filtered = filtered.filter(p =>
      `${p.name} ${p.saltComposition || ''}`.toUpperCase().includes(mono)
    );
  }

  filtered.sort((a, b) => {
    if (b.isFeatured !== a.isFeatured) return Number(b.isFeatured) - Number(a.isFeatured);
    if (b.marketPriority !== a.marketPriority) return b.marketPriority - a.marketPriority;
    if (b.searchRank !== a.searchRank) return b.searchRank - a.searchRank;
    return (a.name || '').localeCompare(b.name || '');
  });

  const totalCount = filtered.length;
  const offset = Math.max(filters.offset || 0, 0);
  const limit = filters.limit != null ? filters.limit : filtered.length;
  const page = filtered.slice(offset, offset + limit).map(p => ({ ...p, totalCount }));
  return page;
}

// Prefer denormalized thumbs when migration 003 is applied; images kept as fallback
const LIST_SELECT =
  'id, category_id, name, brand, manufacturer, price, currency, strength, packaging_size, packaging_type, salt_composition, country_of_origin, origin_country_code, minimum_order_quantity, treatment, thumbnail_url, image_count';
const LIST_SELECT_LEGACY =
  'id, category_id, name, brand, manufacturer, price, currency, strength, packaging_size, packaging_type, salt_composition, country_of_origin, origin_country_code, minimum_order_quantity, treatment, images';

/**
 * Get products with market-aware ranking, FTS search, FX display, pagination.
 * Uses lean RPC by default (thumbnail only) for fast catalog loads.
 *
 * @param {Object} [filters]
 * @param {string} [filters.category]
 * @param {string} [filters.search]
 * @param {string} [filters.marketCountry]
 * @param {string} [filters.originCountry]
 * @param {string} [filters.pharmacopeia]
 * @param {number} [filters.limit] - default CATALOG_PAGE_SIZE (24)
 * @param {number} [filters.offset]
 * @param {boolean} [filters.lean=true] - omit heavy fields (description/specs/full images)
 * @returns {Promise<Array>}
 */
export const getProducts = async (filters = {}) => {
  const lean = filters.lean !== false;
  const limit = filters.limit != null ? filters.limit : CATALOG_PAGE_SIZE;
  const offset = filters.offset || 0;
  const rpcArgs = {
    p_search: filters.search || null,
    p_category_id: filters.category && filters.category !== 'all' ? filters.category : null,
    p_market_country: filters.marketCountry || null,
    p_origin_country: filters.originCountry || null,
    p_pharmacopeia: filters.pharmacopeia && filters.pharmacopeia !== 'all'
      ? filters.pharmacopeia
      : null,
    p_limit: limit,
    p_offset: offset
  };

  if (!isSupabaseConfigured) {
    return filterProductsFallback({ ...filters, limit, offset });
  }

  // Prefer lean RPC for scale; fall back to full search_catalog, then table select
  if (lean) {
    try {
      const { data, error } = await supabase.rpc('search_catalog_lite', rpcArgs);
      if (error) throw error;
      return (data || []).map((row) => productRowToFrontend({ ...row, __lite: true }));
    } catch (err) {
      console.warn('[4Core Exim] search_catalog_lite unavailable, trying full RPC:', err.message);
    }
  }

  try {
    const { data, error } = await supabase.rpc('search_catalog', rpcArgs);
    if (error) throw error;
    return (data || []).map(productRowToFrontend);
  } catch (err) {
    console.warn('[4Core Exim] search_catalog RPC failed, using table query:', err.message);
    try {
      const runListQuery = async (columns) => {
        let query = supabase
          .from('products')
          .select(lean ? columns : '*')
          .eq('is_active', true);

        if (filters.category && filters.category !== 'all') {
          query = query.eq('category_id', filters.category);
        }
        if (filters.originCountry) {
          query = query.eq('origin_country_code', filters.originCountry);
        }
        if (filters.search) {
          const searchTerm = `%${filters.search.trim()}%`;
          query = query.or(
            `name.ilike.${searchTerm},` +
            `brand.ilike.${searchTerm},` +
            `salt_composition.ilike.${searchTerm},` +
            `manufacturer.ilike.${searchTerm}`
          );
        }

        query = query.order('name', { ascending: true });
        const from = offset;
        query = query.range(from, from + limit - 1);
        return query;
      };

      let { data, error } = await runListQuery(LIST_SELECT);
      // Pre-003 schema: thumbnail_url / image_count missing
      if (error && /thumbnail_url|image_count/i.test(error.message || '')) {
        ({ data, error } = await runListQuery(LIST_SELECT_LEGACY));
      }
      if (error) throw error;

      const displayCurrency = MARKET_CURRENCY[filters.marketCountry] || 'USD';
      const fxMap = await getFxRateMap().catch(() => FX_FALLBACK);
      let rows = (data || []).map(row => {
        const mapped = productRowToFrontend(row);
        mapped.displayCurrency = displayCurrency;
        mapped.priceInDisplay = convertPrice(mapped.price, mapped.currency, displayCurrency, fxMap);
        mapped.priceInUsd = convertPrice(mapped.price, mapped.currency, 'USD', fxMap);
        mapped.isLite = lean;
        return mapped;
      });

      if (filters.pharmacopeia && filters.pharmacopeia !== 'all') {
        const mono = filters.pharmacopeia.toUpperCase();
        rows = rows.filter(p =>
          `${p.name} ${p.saltComposition || ''}`.toUpperCase().includes(mono)
        );
      }

      const boostCats = getMarketCategoryBoost(filters.marketCountry);
      rows.sort((a, b) => {
        const aBoost = boostCats.includes(a.category)
          ? boostCats.length - boostCats.indexOf(a.category) : 0;
        const bBoost = boostCats.includes(b.category)
          ? boostCats.length - boostCats.indexOf(b.category) : 0;
        if (bBoost !== aBoost) return bBoost - aBoost;
        return (a.name || '').localeCompare(b.name || '');
      });

      return rows;
    } catch (innerErr) {
      console.warn('[4Core Exim] Failed to fetch products from DB, using fallback:', innerErr.message);
      return filterProductsFallback({ ...filters, limit, offset });
    }
  }
};

/**
 * Active export markets for the market selector.
 * @returns {Promise<Array<{code,name,dialCode,currencyCode,region}>>}
 */
export const getCountries = async ({ targetOnly = true } = {}) => {
  const cacheKey = `countries:${targetOnly ? 'target' : 'all'}`;
  return cacheGetOrSet(cacheKey, async () => {
    if (!isSupabaseConfigured) {
      return Object.entries(MARKET_CURRENCY).map(([code, currencyCode]) => ({
        code,
        name: code,
        dialCode: null,
        currencyCode,
        region: null,
        isOrigin: ['IN', 'DE', 'DK'].includes(code),
        isTargetMarket: true
      }));
    }

    try {
      let query = supabase
        .from('countries')
        .select('code, name, dial_code, currency_code, region, is_origin, is_target_market')
        .eq('is_active', true)
        .order('sort_priority', { ascending: true });

      if (targetOnly) query = query.eq('is_target_market', true);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(c => ({
        code: c.code,
        name: c.name,
        dialCode: c.dial_code,
        currencyCode: c.currency_code,
        region: c.region,
        isOrigin: c.is_origin,
        isTargetMarket: c.is_target_market
      }));
    } catch (err) {
      console.warn('[4Core Exim] Failed to fetch countries:', err.message);
      return Object.entries(MARKET_CURRENCY).map(([code, currencyCode]) => ({
        code,
        name: code,
        currencyCode,
        isTargetMarket: true
      }));
    }
  }, 5 * 60_000);
};

/**
 * @returns {Promise<Record<string, number>>} currency → rate_to_usd
 */
export const getFxRateMap = async () => {
  return cacheGetOrSet('fx_rates', async () => {
    if (!isSupabaseConfigured) return { ...FX_FALLBACK };

    try {
      const { data, error } = await supabase.from('fx_rates').select('currency_code, rate_to_usd');
      if (error) throw error;
      const map = { ...FX_FALLBACK };
      (data || []).forEach(r => {
        map[r.currency_code] = Number(r.rate_to_usd);
      });
      return map;
    } catch {
      return { ...FX_FALLBACK };
    }
  }, 10 * 60_000);
};

/** Call after admin mutates catalog data so clients refresh soon */
export const invalidateCatalogCache = () => {
  cacheInvalidate('categories:');
  cacheInvalidate('countries:');
  cacheInvalidate('fx_rates');
};

/**
 * Get a single product by ID (full detail — images, specs, description).
 * @param {string} id
 * @param {Object} [options]
 * @param {string} [options.marketCountry]
 * @returns {Promise<Object|null>}
 */
export const getProductById = async (id, options = {}) => {
  if (!isSupabaseConfigured) {
    const product = productsDataFallback.find(p => p.id === id);
    return product ? enrichFallbackProduct(product, options.marketCountry || null, FX_FALLBACK) : null;
  }

  try {
    const { data, error } = await supabase.rpc('get_product_detail', {
      p_id: id,
      p_market_country: options.marketCountry || null
    });
    if (error) throw error;
    if (data && data.length) return productRowToFrontend(data[0]);
  } catch (err) {
    console.warn('[4Core Exim] get_product_detail unavailable, using table:', err.message);
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
    return product ? enrichFallbackProduct(product, options.marketCountry || null, FX_FALLBACK) : null;
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
  invalidateCatalogCache();
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
