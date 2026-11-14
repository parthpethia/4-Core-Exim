import { supabase, isSupabaseConfigured } from './supabaseClient';
import companyDataFallback from '../data/company.json';
import categoriesDataFallback from '../data/categories.json';
import productsDataFallback from '../data/products.json';
import {
  convertPrice,
  getMarketCategoryBoost,
  normalizeCurrencyCode
} from '../utils/marketLocation';
import {
  diversifyRankProducts,
  rememberSeenProductIds,
} from '../utils/countryInterestRank';
import { cacheGetOrSet } from '../utils/queryCache';
import { getFxRateMap } from './fxService';
import { FX_FALLBACK, MARKET_CURRENCY } from './fxService';

/** Default page size for public catalog lists */
export const CATALOG_PAGE_SIZE = 24;

// ---------------------------------------------------------------------------
// Internal Helpers
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
    interestScore: row.interest_score != null ? Number(row.interest_score) : undefined,
    totalCount: row.total_count != null ? Number(row.total_count) : undefined,
    isLite: !!(row.thumbnail_url != null && row.images == null && row.specifications == null && row.description == null)
      || row.__lite === true
  };
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

  const ranked = diversifyRankProducts(filtered, {
    marketCountry: filters.marketCountry || null
  });

  const totalCount = ranked.length;
  const offset = Math.max(filters.offset || 0, 0);
  const limit = filters.limit != null ? filters.limit : ranked.length;
  const page = ranked.slice(offset, offset + limit).map(p => ({ ...p, totalCount }));
  if (offset === 0) {
    rememberSeenProductIds(page.slice(0, 12).map((p) => p.id).filter(Boolean));
  }
  return page;
}

// Prefer denormalized thumbs when migration 003 is applied; images kept as fallback
const LIST_SELECT =
  'id, category_id, name, brand, manufacturer, price, currency, strength, packaging_size, packaging_type, salt_composition, country_of_origin, origin_country_code, minimum_order_quantity, treatment, thumbnail_url, image_count';
const LIST_SELECT_LEGACY =
  'id, category_id, name, brand, manufacturer, price, currency, strength, packaging_size, packaging_type, salt_composition, country_of_origin, origin_country_code, minimum_order_quantity, treatment, images';

// ===========================================================================
// PUBLIC READ FUNCTIONS
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
 * When marketCountry is set, categories are reordered for that export market.
 * @param {Object} [options]
 * @param {string} [options.marketCountry]
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
 * Get products with market-aware ranking, FTS search, FX display, pagination.
 * Uses lean RPC by default (thumbnail only) for fast catalog loads.
 *
 * @param {Object} [filters]
 * @param {string} [filters.category]
 * @param {string} [filters.search]
 * @param {string} [filters.marketCountry]
 * @param {string} [filters.originCountry]
 * @param {string} [filters.pharmacopeia]
 * @param {number} [filters.limit]
 * @param {number} [filters.offset]
 * @param {boolean} [filters.lean=true]
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

  const noteSeen = (rows) => {
    if (!rpcArgs.p_offset) {
      rememberSeenProductIds(rows.slice(0, 12).map((p) => p.id).filter(Boolean));
    }
    return rows;
  };

  // Prefer lean RPC for scale; fall back to full search_catalog, then table select
  if (lean) {
    try {
      const { data, error } = await supabase.rpc('search_catalog_lite', rpcArgs);
      if (error) throw error;
      return noteSeen(
        (data || []).map((row) => productRowToFrontend({ ...row, __lite: true }))
      );
    } catch (err) {
      console.warn('[4Core Exim] search_catalog_lite unavailable, trying full RPC:', err.message);
    }
  }

  try {
    const { data, error } = await supabase.rpc('search_catalog', rpcArgs);
    if (error) throw error;
    return noteSeen((data || []).map(productRowToFrontend));
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
