import { supabase, isSupabaseConfigured } from './supabaseClient';
import { cacheGetOrSet } from '../utils/queryCache';

// ---------------------------------------------------------------------------
// Static FX fallbacks (rate_to_usd) used when DB FX table is unavailable
// ---------------------------------------------------------------------------
export const FX_FALLBACK = {
  USD: 1, INR: 0.012, AED: 0.2723, SAR: 0.2667, NGN: 0.00065, KES: 0.0077,
  GHS: 0.064, EGP: 0.0205, BDT: 0.0083, NPR: 0.0075, LKR: 0.0033, MMK: 0.00048,
  VND: 0.00004, PHP: 0.0175, IDR: 0.000063, MYR: 0.225, GBP: 1.27, EUR: 1.08,
  DKK: 0.145, BRL: 0.18, ZAR: 0.055
};

export const MARKET_CURRENCY = {
  IN: 'INR', AE: 'AED', SA: 'SAR', NG: 'NGN', KE: 'KES', GH: 'GHS', EG: 'EGP',
  BD: 'BDT', NP: 'NPR', LK: 'LKR', MM: 'MMK', VN: 'VND', PH: 'PHP', ID: 'IDR',
  MY: 'MYR', GB: 'GBP', DE: 'EUR', DK: 'DKK', US: 'USD', BR: 'BRL', ZA: 'ZAR'
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
