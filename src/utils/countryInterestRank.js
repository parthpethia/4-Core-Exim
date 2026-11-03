/**
 * Country-interest ranking with diversity.
 *
 * Learns what each market usually asks for (inquiries + category priors),
 * then reorders so the same brand/salt/category does not dominate the list.
 *
 * Score ≈ interest − monopoly − similarity_to_already_picked − session_seen
 */

import { getMarketCategoryBoost } from './marketLocation';

const SEEN_KEY = '4core_seen_products';
const SEEN_MAX = 48;
const SEEN_TTL_MS = 1000 * 60 * 60 * 12; // 12h rotation

/** Dial code → ISO (for inquiry rows that only stored phone country_code) */
export const DIAL_TO_ISO = {
  '+91': 'IN', '+971': 'AE', '+966': 'SA', '+234': 'NG', '+254': 'KE',
  '+233': 'GH', '+20': 'EG', '+880': 'BD', '+977': 'NP', '+94': 'LK',
  '+44': 'GB', '+1': 'US', '+49': 'DE', '+84': 'VN', '+63': 'PH',
  '+60': 'MY', '+62': 'ID', '+27': 'ZA', '+55': 'BR', '+95': 'MM'
};

export function dialToMarket(dialOrIso) {
  if (!dialOrIso) return null;
  const raw = String(dialOrIso).trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(raw)) return raw;
  const withPlus = raw.startsWith('+') ? raw : `+${raw.replace(/^\+/, '')}`;
  return DIAL_TO_ISO[withPlus] || DIAL_TO_ISO[raw] || null;
}

function saltKey(salt) {
  if (!salt) return '';
  return String(salt).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 48);
}

function brandKey(brand) {
  if (!brand) return '';
  return String(brand).toLowerCase().trim();
}

/**
 * Build interest maps from inquiry rows (admin/client analytics + ranking prior).
 * @param {Array} inquiries
 * @returns {{ byCountryProduct: Record<string, Record<string, number>>, byCountryCategory: Record<string, Record<string, number>>, byCountry: Record<string, number> }}
 */
export function buildInterestMapsFromInquiries(inquiries = []) {
  const byCountryProduct = {};
  const byCountryCategory = {};
  const byCountry = {};
  const now = Date.now();

  for (const inq of inquiries) {
    const market =
      (inq.market_country || inq.marketCountry || '').toUpperCase() ||
      dialToMarket(inq.country_code || inq.countryCode);
    if (!market) continue;

    const created = inq.created_at || inq.createdAt;
    const ageDays = created ? Math.max(0, (now - new Date(created).getTime()) / 86400000) : 30;
    // 90-day half-life style decay (~0.5 at 90d)
    const weight = Math.exp(-ageDays / 130);

    byCountry[market] = (byCountry[market] || 0) + weight;

    const productId = inq.product_id || inq.productId;
    if (productId) {
      byCountryProduct[market] ||= {};
      byCountryProduct[market][productId] =
        (byCountryProduct[market][productId] || 0) + weight;
    }

    const cat = inq.categoryId || inq.category_id || null;
    if (cat) {
      byCountryCategory[market] ||= {};
      byCountryCategory[market][cat] =
        (byCountryCategory[market][cat] || 0) + weight;
    }
  }

  return { byCountryProduct, byCountryCategory, byCountry };
}

/**
 * Aggregate admin-facing “what this country looks for”.
 */
export function summarizeCountryInterest(inquiries = []) {
  const { byCountry, byCountryProduct, byCountryCategory } = buildInterestMapsFromInquiries(inquiries);
  const countries = Object.keys(byCountry).sort((a, b) => byCountry[b] - byCountry[a]);

  return countries.map((code) => {
    const products = Object.entries(byCountryProduct[code] || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id, score]) => ({ id, score: Number(score.toFixed(3)) }));
    const categories = Object.entries(byCountryCategory[code] || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id, score]) => ({ id, score: Number(score.toFixed(3)) }));
    return {
      country: code,
      inquiryWeight: Number(byCountry[code].toFixed(3)),
      topProducts: products,
      topCategories: categories
    };
  });
}

export function readSeenProductIds() {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!parsed?.at || Date.now() - parsed.at > SEEN_TTL_MS) {
      localStorage.removeItem(SEEN_KEY);
      return new Set();
    }
    return new Set(parsed.ids || []);
  } catch {
    return new Set();
  }
}

export function rememberSeenProductIds(ids = []) {
  if (typeof window === 'undefined' || !ids.length) return;
  try {
    const prev = readSeenProductIds();
    ids.forEach((id) => prev.add(id));
    const trimmed = [...prev].slice(-SEEN_MAX);
    localStorage.setItem(SEEN_KEY, JSON.stringify({ at: Date.now(), ids: trimmed }));
  } catch {
    /* ignore */
  }
}

/**
 * Soft interest score for one product in a market.
 */
export function scoreProductForMarket(product, marketCountry, interestMaps = null) {
  const market = (marketCountry || '').toUpperCase();
  const boostList = getMarketCategoryBoost(market);
  const cat = product.category || product.categoryId || product.category_id;
  const catBoost = cat && boostList.includes(cat)
    ? (boostList.length - boostList.indexOf(cat)) * 12
    : 0;

  const marketPriority = Number(product.marketPriority ?? product.market_priority ?? 0);
  const featured = product.isFeatured || product.is_featured ? 28 : 0;
  const searchRank = Number(product.searchRank ?? product.search_rank ?? 0) * 40;

  let inquiryScore = 0;
  if (interestMaps && market) {
    const pMap = interestMaps.byCountryProduct?.[market] || {};
    const cMap = interestMaps.byCountryCategory?.[market] || {};
    const rawP = pMap[product.id] || 0;
    const rawC = cat ? (cMap[cat] || 0) : 0;
    // log dampens monopoly (“same product again and again”)
    inquiryScore = Math.log1p(rawP) * 18 + Math.log1p(rawC) * 8;
  }

  // Exploration: slight hash jitter so ties don’t freeze the same order forever
  const jitter = product.id
    ? (([...String(product.id)].reduce((a, c) => a + c.charCodeAt(0), 0) % 7) * 0.15)
    : 0;

  return featured + marketPriority * 0.45 + catBoost + searchRank + inquiryScore + jitter;
}

function similarityPenalty(candidate, picked) {
  let penalty = 0;
  const cCat = candidate.category || candidate.category_id;
  const cBrand = brandKey(candidate.brand);
  const cSalt = saltKey(candidate.saltComposition || candidate.salt_composition);

  let sameCatStreak = 0;
  for (let i = picked.length - 1; i >= 0; i -= 1) {
    const p = picked[i];
    const pCat = p.category || p.category_id;
    if (cCat && pCat && cCat === pCat) sameCatStreak += 1;
    else break;
  }
  if (sameCatStreak > 0) penalty += 14 * sameCatStreak;

  const recent = picked.slice(-6);
  for (const p of recent) {
    const pBrand = brandKey(p.brand);
    const pSalt = saltKey(p.saltComposition || p.salt_composition);
    const pCat = p.category || p.category_id;
    if (cBrand && pBrand && cBrand === pBrand) penalty += 22;
    if (cSalt && pSalt && cSalt === pSalt) penalty += 26;
    if (cCat && pCat && cCat === pCat) penalty += 6;
  }
  return penalty;
}

/**
 * Diversifying re-rank (greedy MMR-style).
 * @param {Array} products
 * @param {Object} options
 * @param {string} [options.marketCountry]
 * @param {ReturnType<typeof buildInterestMapsFromInquiries>} [options.interestMaps]
 * @param {Set<string>|string[]} [options.seenIds]
 * @param {number} [options.lambda] diversity strength (default 1)
 */
export function diversifyRankProducts(products, options = {}) {
  if (!Array.isArray(products) || products.length <= 1) return products || [];

  const {
    marketCountry = null,
    interestMaps = null,
    seenIds = null,
    lambda = 1
  } = options;

  const seen = seenIds instanceof Set
    ? seenIds
    : new Set(Array.isArray(seenIds) ? seenIds : [...readSeenProductIds()]);

  const remaining = products.map((p, index) => ({
    product: p,
    index,
    base: scoreProductForMarket(p, marketCountry, interestMaps)
  }));

  const picked = [];
  const result = [];

  while (remaining.length) {
    let bestIdx = 0;
    let bestScore = -Infinity;

    for (let i = 0; i < remaining.length; i += 1) {
      const { product, base } = remaining[i];
      const sim = similarityPenalty(product, picked);
      const seenPen = seen.has(product.id) ? 16 : 0;
      // Keep absolute top interest competitive, but punish clones / recently shown
      const final = base - lambda * sim - seenPen;
      if (final > bestScore) {
        bestScore = final;
        bestIdx = i;
      }
    }

    const [chosen] = remaining.splice(bestIdx, 1);
    picked.push(chosen.product);
    result.push({
      ...chosen.product,
      interestScore: Number(chosen.base.toFixed(2)),
      diversityRank: result.length
    });
  }

  return result;
}

/**
 * Rank + remember page for next visit rotation.
 */
export function rankCatalogForMarket(products, marketCountry, interestMaps = null) {
  const ranked = diversifyRankProducts(products, {
    marketCountry,
    interestMaps,
    seenIds: readSeenProductIds()
  });
  rememberSeenProductIds(ranked.slice(0, 12).map((p) => p.id).filter(Boolean));
  return ranked;
}
