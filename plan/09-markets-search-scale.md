# Chunk 9: Multi-country markets, FTS search & catalog targeting

> **Status:** ✅ CODE DONE — run SQL migration 002 + re-seed in Supabase

## What was added

### Schema (`supabase/migrations/002_markets_search_scale.sql`)
- `countries` — ISO markets/origins with dial code, currency, region
- `fx_rates` — `rate_to_usd` for display conversion
- `product_markets` — product ↔ market priority / featured / preferred currency
- `products.currency` normalized to ISO (`INR`/`USD`/…)
- `products.origin_country_code` FK
- `products.search_vector` + trigger (weighted FTS)
- RPC `search_catalog(...)` — FTS + market boost + FX + pagination
- RPC `get_market_categories(...)` — categories reordered per market

### Service / UI
- `getProducts` uses `search_catalog` (falls back to table + local boost)
- `getCategories({ marketCountry })` uses `get_market_categories`
- `getCountries`, `getFxRateMap`
- Catalog market selector + locale/timezone auto-detect
- Prices show market display currency with original as secondary

### Seed
- `scripts/seed-database.js` seeds `product_markets` from `src/data/markets.json`
- `npm run seed`

## Deploy steps
1. Run `001_create_tables.sql` if not already applied
2. Run `002_markets_search_scale.sql` in Supabase SQL Editor
3. `SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npm run seed`
4. Verify RPC: `select * from search_catalog('pregabalin', null, 'AE', null, null, 10, 0);`
