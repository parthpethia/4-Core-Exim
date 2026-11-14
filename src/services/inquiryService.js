import { supabase, isSupabaseConfigured } from './supabaseClient';
import { summarizeCountryInterest } from '../utils/countryInterestRank';

// ===========================================================================
// B2B INQUIRY FUNCTIONS
// ===========================================================================

/**
 * Submit a B2B inquiry (public — anyone can insert).
 * Includes anti-spam honeypot and timing guards.
 * @param {Object} inquiryData
 * @param {Object} [options]
 * @param {string} [options.honeypotValue=''] - Hidden field value (bots fill this)
 * @param {number|null} [options.formMountedAt=null] - Timestamp when form was mounted
 * @returns {Promise<Object>}
 */
export const submitInquiry = async (inquiryData, { honeypotValue = '', formMountedAt = null } = {}) => {
  // Anti-spam: Honeypot check — if hidden field is filled, silently discard
  if (honeypotValue && honeypotValue.trim() !== '') {
    console.warn('[4Core Exim] Spam submission detected (honeypot triggered).');
    return { id: 'discarded', status: 'spam_blocked' };
  }

  // Anti-spam: Timing guard — reject forms submitted in under 2 seconds
  if (formMountedAt) {
    const elapsed = Date.now() - formMountedAt;
    if (elapsed < 2000) {
      console.warn('[4Core Exim] Spam submission detected (submitted too fast:', elapsed, 'ms).');
      return { id: 'discarded', status: 'spam_blocked' };
    }
  }

  const visitorTz = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
    } catch {
      return null;
    }
  })();
  const visitorLocale = typeof navigator !== 'undefined'
    ? (navigator.language || null)
    : null;

  const row = {
    product_id: inquiryData.productId || null,
    product_name: inquiryData.productName || null,
    category_name: inquiryData.categoryName || null,
    category_id: inquiryData.categoryId || null,
    phone: inquiryData.phone || null,
    country_code: inquiryData.countryCode || null,
    market_country: inquiryData.marketCountry
      ? String(inquiryData.marketCountry).toUpperCase()
      : null,
    timezone: inquiryData.timezone || visitorTz,
    locale: inquiryData.locale || visitorLocale,
    business_name: inquiryData.businessName || null,
    incoterm: inquiryData.incoterm || null,
    destination_port: inquiryData.destinationPort || null,
    status: 'new'
  };

  const { data, error } = await supabase
    .from('inquiries')
    .insert([row])
    .select()
    .single();

  // Migration / FK soft-fail: drop enrichment columns and retry core lead capture
  if (
    error &&
    /market_country|timezone|locale|category_id|foreign key|violates/i.test(error.message || '')
  ) {
    const legacy = {
      product_id: row.product_id,
      product_name: row.product_name,
      category_name: row.category_name,
      phone: row.phone,
      country_code: row.country_code,
      business_name: row.business_name,
      incoterm: row.incoterm,
      destination_port: row.destination_port,
      status: 'new'
    };
    const retry = await supabase.from('inquiries').insert([legacy]).select().single();
    if (retry.error) throw retry.error;
    return retry.data;
  }

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

/**
 * Country-interest summary for admin (what each market usually looks for).
 * Prefers DB RPC; falls back to aggregating inquiry rows client-side.
 */
export const getCountryInterestSummary = async (limit = 20) => {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase.rpc('get_country_interest_summary', {
      p_limit: limit
    });
    if (error) throw error;
    return (data || []).map((row) => ({
      country: row.country_code,
      countryName: row.country_name,
      inquiryWeight: Number(row.inquiry_weight) || 0,
      inquiryCount: Number(row.inquiry_count) || 0,
      topProductId: row.top_product_id,
      topProductName: row.top_product_name,
      topCategoryId: row.top_category_id,
      topCategoryName: row.top_category_name
    }));
  } catch (err) {
    console.warn('[4Core Exim] interest summary RPC unavailable, using inquiries:', err.message);
    const inquiries = await getInquiries({ status: 'all' });
    return summarizeCountryInterest(inquiries).slice(0, limit);
  }
};
