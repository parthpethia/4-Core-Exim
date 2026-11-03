import marketsConfig from '../data/markets.json';

const STORAGE_KEY = '4core_market_country';

/** Map common locale / timezone hints → ISO country */
const LOCALE_TO_COUNTRY = {
  'en-AE': 'AE', 'ar-AE': 'AE',
  'en-SA': 'SA', 'ar-SA': 'SA',
  'en-NG': 'NG',
  'en-KE': 'KE',
  'en-GH': 'GH',
  'ar-EG': 'EG', 'en-EG': 'EG',
  'bn-BD': 'BD', 'en-BD': 'BD',
  'ne-NP': 'NP',
  'si-LK': 'LK', 'en-LK': 'LK',
  'en-GB': 'GB',
  'en-US': 'US',
  'de-DE': 'DE',
  'vi-VN': 'VN',
  'en-PH': 'PH', 'fil-PH': 'PH',
  'ms-MY': 'MY', 'en-MY': 'MY',
  'id-ID': 'ID',
  'en-ZA': 'ZA',
  'pt-BR': 'BR',
  'hi-IN': 'IN', 'en-IN': 'IN',
  'en-MM': 'MM',
};

const TZ_TO_COUNTRY = {
  'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA',
  'Africa/Lagos': 'NG',
  'Africa/Nairobi': 'KE',
  'Africa/Accra': 'GH',
  'Africa/Cairo': 'EG',
  'Asia/Dhaka': 'BD',
  'Asia/Kathmandu': 'NP',
  'Asia/Colombo': 'LK',
  'Europe/London': 'GB',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Los_Angeles': 'US',
  'Europe/Berlin': 'DE',
  'Asia/Ho_Chi_Minh': 'VN',
  'Asia/Manila': 'PH',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Jakarta': 'ID',
  'Africa/Johannesburg': 'ZA',
  'America/Sao_Paulo': 'BR',
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Asia/Yangon': 'MM',
};

/**
 * Detect likely market country from browser locale / timezone.
 * Falls back to markets.json defaultMarket (AE — strong Gulf export focus).
 */
export function detectMarketCountry(allowedCodes = null) {
  if (typeof window === 'undefined') {
    return marketsConfig.defaultMarket || 'AE';
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (!allowedCodes || allowedCodes.includes(stored))) {
      return stored;
    }
  } catch {
    /* ignore */
  }

  const candidates = [];

  if (typeof Intl !== 'undefined') {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && TZ_TO_COUNTRY[tz]) candidates.push(TZ_TO_COUNTRY[tz]);
    } catch {
      /* ignore */
    }
  }

  const langs = typeof navigator !== 'undefined'
    ? [...(navigator.languages || []), navigator.language].filter(Boolean)
    : [];

  for (const lang of langs) {
    if (LOCALE_TO_COUNTRY[lang]) {
      candidates.push(LOCALE_TO_COUNTRY[lang]);
      continue;
    }
    const parts = lang.split('-');
    if (parts.length >= 2) {
      const code = parts[parts.length - 1].toUpperCase();
      if (code.length === 2) candidates.push(code);
    }
  }

  for (const code of candidates) {
    if (!allowedCodes || allowedCodes.includes(code)) return code;
  }

  const fallback = marketsConfig.defaultMarket || 'AE';
  if (!allowedCodes || allowedCodes.includes(fallback)) return fallback;
  return allowedCodes[0] || fallback;
}

export function persistMarketCountry(code) {
  try {
    if (code) localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* ignore */
  }
}

export function getMarketCategoryBoost(marketCode) {
  return marketsConfig.marketCategoryBoost?.[marketCode] || [];
}

export function normalizeCurrencyCode(currency) {
  if (!currency) return 'USD';
  const c = String(currency).trim();
  if (c === '₹' || c === 'Rs' || c === 'rs' || c.toUpperCase() === 'INR') return 'INR';
  if (c === '$' || c.toUpperCase() === 'USD') return 'USD';
  if (c === '€' || c.toUpperCase() === 'EUR') return 'EUR';
  if (c === '£' || c.toUpperCase() === 'GBP') return 'GBP';
  return c.toUpperCase();
}

/** Convert amount from source currency to display currency using rate_to_usd map */
export function convertPrice(amount, fromCurrency, toCurrency, fxMap) {
  if (amount == null || Number.isNaN(Number(amount))) return null;
  const from = normalizeCurrencyCode(fromCurrency);
  const to = normalizeCurrencyCode(toCurrency);
  if (from === to) return Number(Number(amount).toFixed(2));
  const fromRate = fxMap?.[from] ?? (from === 'USD' ? 1 : null);
  const toRate = fxMap?.[to] ?? (to === 'USD' ? 1 : null);
  if (fromRate == null || toRate == null || toRate === 0) return null;
  const usd = Number(amount) * fromRate;
  return Number((usd / toRate).toFixed(2));
}

export { marketsConfig };
