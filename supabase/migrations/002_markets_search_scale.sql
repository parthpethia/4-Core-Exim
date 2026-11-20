-- =============================================================================
-- 4Core Exim — Markets, FX, Search & Scale
-- =============================================================================
.0
z-- Extends the catalog for multi-country export targeting:
--   1. countries          — ISO markets (origin + destination)
--   2. product_markets    — product ↔ market boost / preferred currency
--   3. fx_rates           — convert catalog prices for display
--   4. products enhancements (ISO currency, origin FK, search_vector)
--   5. search_catalog()   — FTS + market-priority ranking + pagination
--   6. get_market_categories() — categories reordered for a visitor market
--
-- Run AFTER 001_create_tables.sql in the Supabase SQL Editor.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. COUNTRIES (export markets + origins)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS countries (
  code            text        PRIMARY KEY,          -- ISO 3166-1 alpha-2 (IN, AE, NG)
  name            text        NOT NULL,
  dial_code       text,                             -- e.g. +971
  currency_code   text        NOT NULL DEFAULT 'USD',-- ISO 4217
  region          text,                             -- MENA, Africa, Asia, Europe, Americas
  is_origin       boolean     DEFAULT false,        -- can be country of manufacture
  is_target_market boolean    DEFAULT true,         -- shown in market selector
  sort_priority   integer     DEFAULT 100,          -- lower = higher in default lists
  is_active       boolean     DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

COMMENT ON TABLE countries IS 'ISO countries used as product origins and export destination markets';

CREATE INDEX IF NOT EXISTS idx_countries_active_market
  ON countries (is_active, is_target_market, sort_priority)
  WHERE is_active = true;

-- Seed core origin + typical Indian pharma export markets
INSERT INTO countries (code, name, dial_code, currency_code, region, is_origin, is_target_market, sort_priority) VALUES
  ('IN', 'India',          '+91',  'INR', 'Asia',      true,  true,  1),
  ('AE', 'United Arab Emirates', '+971', 'AED', 'MENA', false, true,  2),
  ('SA', 'Saudi Arabia',   '+966', 'SAR', 'MENA',      false, true,  3),
  ('NG', 'Nigeria',        '+234', 'NGN', 'Africa',    false, true,  4),
  ('KE', 'Kenya',          '+254', 'KES', 'Africa',    false, true,  5),
  ('GH', 'Ghana',          '+233', 'GHS', 'Africa',    false, true,  6),
  ('EG', 'Egypt',          '+20',  'EGP', 'MENA',      false, true,  7),
  ('BD', 'Bangladesh',     '+880', 'BDT', 'Asia',      false, true,  8),
  ('NP', 'Nepal',          '+977', 'NPR', 'Asia',      false, true,  9),
  ('LK', 'Sri Lanka',      '+94',  'LKR', 'Asia',      false, true, 10),
  ('MM', 'Myanmar',        '+95',  'MMK', 'Asia',      false, true, 11),
  ('VN', 'Vietnam',        '+84',  'VND', 'Asia',      false, true, 12),
  ('PH', 'Philippines',    '+63',  'PHP', 'Asia',      false, true, 13),
  ('ID', 'Indonesia',      '+62',  'IDR', 'Asia',      false, true, 14),
  ('MY', 'Malaysia',       '+60',  'MYR', 'Asia',      false, true, 15),
  ('GB', 'United Kingdom', '+44',  'GBP', 'Europe',    false, true, 16),
  ('DE', 'Germany',        '+49',  'EUR', 'Europe',    true,  true, 17),
  ('DK', 'Denmark',        '+45',  'DKK', 'Europe',    true,  false, 90),
  ('US', 'United States',  '+1',   'USD', 'Americas',  false, true, 18),
  ('BR', 'Brazil',         '+55',  'BRL', 'Americas',  false, true, 19),
  ('ZA', 'South Africa',   '+27',  'ZAR', 'Africa',    false, true, 20)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  dial_code = EXCLUDED.dial_code,
  currency_code = EXCLUDED.currency_code,
  region = EXCLUDED.region,
  is_origin = EXCLUDED.is_origin,
  is_target_market = EXCLUDED.is_target_market,
  sort_priority = EXCLUDED.sort_priority,
  is_active = true;

-- ---------------------------------------------------------------------------
-- 2. FX RATES (base = USD)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fx_rates (
  currency_code   text        PRIMARY KEY,          -- ISO 4217
  rate_to_usd     numeric(18,8) NOT NULL,           -- 1 unit of currency = rate_to_usd USD
  updated_at      timestamptz DEFAULT now()
);

COMMENT ON TABLE fx_rates IS 'FX table: multiply amount by rate_to_usd to get USD; divide USD by rate to get local';

-- Approximate reference rates (admin can refresh later)
INSERT INTO fx_rates (currency_code, rate_to_usd) VALUES
  ('USD', 1),
  ('INR', 0.01200000),
  ('AED', 0.27230000),
  ('SAR', 0.26670000),
  ('NGN', 0.00065000),
  ('KES', 0.00770000),
  ('GHS', 0.06400000),
  ('EGP', 0.02050000),
  ('BDT', 0.00830000),
  ('NPR', 0.00750000),
  ('LKR', 0.00330000),
  ('MMK', 0.00048000),
  ('VND', 0.00004000),
  ('PHP', 0.01750000),
  ('IDR', 0.00006300),
  ('MYR', 0.22500000),
  ('GBP', 1.27000000),
  ('EUR', 1.08000000),
  ('DKK', 0.14500000),
  ('BRL', 0.18000000),
  ('ZAR', 0.05500000)
ON CONFLICT (currency_code) DO UPDATE SET
  rate_to_usd = EXCLUDED.rate_to_usd,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 3. PRODUCT ↔ MARKET LINK (catalog targeting)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_markets (
  product_id          text        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  country_code        text        NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
  priority            integer     NOT NULL DEFAULT 50,  -- higher = ranks first for that market
  is_featured         boolean     DEFAULT false,
  preferred_currency  text,                             -- override display currency for market
  notes               text,
  created_at          timestamptz DEFAULT now(),
  PRIMARY KEY (product_id, country_code)
);

COMMENT ON TABLE product_markets IS 'Links products to destination markets with ranking boost for location-aware catalogs';

CREATE INDEX IF NOT EXISTS idx_product_markets_country_priority
  ON product_markets (country_code, priority DESC);

CREATE INDEX IF NOT EXISTS idx_product_markets_featured
  ON product_markets (country_code, is_featured)
  WHERE is_featured = true;

-- ---------------------------------------------------------------------------
-- 4. PRODUCTS — currency normalize + origin FK + FTS vector
-- ---------------------------------------------------------------------------

-- Normalize ₹ / Rs → INR; keep USD/EUR/GBP as-is
UPDATE products
SET currency = CASE
  WHEN currency IN ('₹', 'Rs', 'rs', 'INR', 'inr') THEN 'INR'
  WHEN currency IN ('$', 'usd', 'USD') THEN 'USD'
  WHEN currency IN ('€', 'eur', 'EUR') THEN 'EUR'
  WHEN currency IN ('£', 'gbp', 'GBP') THEN 'GBP'
  ELSE COALESCE(NULLIF(trim(currency), ''), 'USD')
END;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS origin_country_code text REFERENCES countries(code);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Backfill origin from free-text country_of_origin when possible
UPDATE products p
SET origin_country_code = c.code
FROM countries c
WHERE p.origin_country_code IS NULL
  AND lower(p.country_of_origin) = lower(c.name);

CREATE INDEX IF NOT EXISTS idx_products_origin ON products (origin_country_code);
CREATE INDEX IF NOT EXISTS idx_products_currency ON products (currency);
CREATE INDEX IF NOT EXISTS idx_products_active_category_name
  ON products (is_active, category_id, name)
  WHERE is_active = true;

-- Combined FTS document (name, brand, salt, manufacturer, treatment, description, strength)
CREATE OR REPLACE FUNCTION products_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.brand, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.salt_composition, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.manufacturer, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.strength, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.treatment, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_search_vector ON products;
CREATE TRIGGER trg_products_search_vector
  BEFORE INSERT OR UPDATE OF name, brand, salt_composition, manufacturer, strength, treatment, description
  ON products
  FOR EACH ROW EXECUTE FUNCTION products_search_vector_update();

-- Backfill search_vector for existing rows
UPDATE products SET
  search_vector =
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(brand, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(salt_composition, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(manufacturer, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(strength, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(treatment, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'D');

CREATE INDEX IF NOT EXISTS idx_products_search_vector ON products USING gin (search_vector);

-- ---------------------------------------------------------------------------
-- 5. search_catalog — FTS + market boost + pagination
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION search_catalog(
  p_search          text DEFAULT NULL,
  p_category_id     text DEFAULT NULL,
  p_market_country  text DEFAULT NULL,
  p_origin_country  text DEFAULT NULL,
  p_pharmacopeia    text DEFAULT NULL,   -- IP | BP | USP | NULL
  p_limit           integer DEFAULT 50,
  p_offset          integer DEFAULT 0
)
RETURNS TABLE (
  id                      text,
  category_id             text,
  name                    text,
  brand                   text,
  manufacturer            text,
  marketer                text,
  price                   numeric,
  currency                text,
  strength                text,
  packaging_size          text,
  packaging_type          text,
  salt_composition        text,
  country_of_origin       text,
  origin_country_code     text,
  minimum_order_quantity  text,
  storage                 text,
  treatment               text,
  description             text,
  images                  text[],
  specifications          jsonb,
  is_active               boolean,
  created_at              timestamptz,
  updated_at              timestamptz,
  market_priority         integer,
  is_featured             boolean,
  preferred_currency      text,
  display_currency        text,
  price_in_usd            numeric,
  price_in_display        numeric,
  search_rank             real,
  total_count             bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH params AS (
    SELECT
      NULLIF(trim(p_search), '') AS q,
      NULLIF(trim(p_category_id), '') AS cat,
      NULLIF(upper(trim(p_market_country)), '') AS market,
      NULLIF(upper(trim(p_origin_country)), '') AS origin,
      NULLIF(upper(trim(p_pharmacopeia)), '') AS mono,
      GREATEST(COALESCE(p_limit, 50), 1) AS lim,
      GREATEST(COALESCE(p_offset, 0), 0) AS off
  ),
  ts AS (
    SELECT
      CASE
        WHEN q IS NULL THEN NULL
        ELSE plainto_tsquery('english', q)
      END AS tsq
    FROM params
  ),
  base AS (
    SELECT
      p.*,
      COALESCE(pm.priority, 0) AS market_priority,
      COALESCE(pm.is_featured, false) AS is_featured,
      pm.preferred_currency,
      COALESCE(pm.preferred_currency, mkt.currency_code, 'USD') AS display_currency,
      CASE
        WHEN (SELECT tsq FROM ts) IS NULL THEN 0::real
        ELSE ts_rank_cd(p.search_vector, (SELECT tsq FROM ts))
      END AS search_rank,
      -- price → USD via fx_rates
      CASE
        WHEN p.price IS NULL THEN NULL
        ELSE p.price * COALESCE(src_fx.rate_to_usd, 1)
      END AS price_in_usd
    FROM products p
    CROSS JOIN params
    LEFT JOIN product_markets pm
      ON pm.product_id = p.id AND pm.country_code = params.market
    LEFT JOIN countries mkt
      ON mkt.code = params.market
    LEFT JOIN fx_rates src_fx
      ON src_fx.currency_code = p.currency
    WHERE p.is_active = true
      AND (params.cat IS NULL OR params.cat = 'all' OR p.category_id = params.cat)
      AND (params.origin IS NULL OR p.origin_country_code = params.origin
           OR (p.origin_country_code IS NULL AND lower(p.country_of_origin) = lower(
                (SELECT name FROM countries WHERE code = params.origin)
              )))
      AND (
        (SELECT tsq FROM ts) IS NULL
        OR p.search_vector @@ (SELECT tsq FROM ts)
        OR p.name ILIKE '%' || params.q || '%'
        OR p.salt_composition ILIKE '%' || params.q || '%'
        OR p.brand ILIKE '%' || params.q || '%'
      )
      AND (
        params.mono IS NULL OR params.mono = 'ALL'
        OR upper(coalesce(p.name, '') || ' ' || coalesce(p.salt_composition, '')) LIKE '%' || params.mono || '%'
      )
  ),
  counted AS (
    SELECT b.*, count(*) OVER() AS total_count
    FROM base b
  )
  SELECT
    c.id,
    c.category_id,
    c.name,
    c.brand,
    c.manufacturer,
    c.marketer,
    c.price,
    c.currency,
    c.strength,
    c.packaging_size,
    c.packaging_type,
    c.salt_composition,
    c.country_of_origin,
    c.origin_country_code,
    c.minimum_order_quantity,
    c.storage,
    c.treatment,
    c.description,
    c.images,
    c.specifications,
    c.is_active,
    c.created_at,
    c.updated_at,
    c.market_priority,
    c.is_featured,
    c.preferred_currency,
    c.display_currency,
    round(c.price_in_usd::numeric, 4) AS price_in_usd,
    round(
      CASE
        WHEN c.price_in_usd IS NULL THEN NULL
        ELSE c.price_in_usd / NULLIF(COALESCE(dst_fx.rate_to_usd, 1), 0)
      END::numeric,
      2
    ) AS price_in_display,
    c.search_rank,
    c.total_count
  FROM counted c
  LEFT JOIN fx_rates dst_fx ON dst_fx.currency_code = c.display_currency
  ORDER BY
    c.is_featured DESC,
    c.market_priority DESC,
    c.search_rank DESC,
    c.name ASC
  LIMIT (SELECT lim FROM params)
  OFFSET (SELECT off FROM params);
$$;

COMMENT ON FUNCTION search_catalog IS 'Market-aware FTS catalog search with FX conversion and pagination';

-- ---------------------------------------------------------------------------
-- 6. get_market_categories — reorder categories by market product demand
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_market_categories(
  p_market_country text DEFAULT NULL
)
RETURNS TABLE (
  id            text,
  name          text,
  image         text,
  sort_order    integer,
  product_count bigint,
  market_boost  bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH params AS (
    SELECT NULLIF(upper(trim(p_market_country)), '') AS market
  )
  SELECT
    cat.id,
    cat.name,
    cat.image,
    cat.sort_order,
    count(p.id) FILTER (WHERE p.is_active) AS product_count,
    COALESCE(sum(COALESCE(pm.priority, 0)) FILTER (WHERE p.is_active), 0) AS market_boost
  FROM categories cat
  CROSS JOIN params
  LEFT JOIN products p ON p.category_id = cat.id AND p.is_active = true
  LEFT JOIN product_markets pm
    ON pm.product_id = p.id AND pm.country_code = params.market
  WHERE cat.is_active = true
  GROUP BY cat.id, cat.name, cat.image, cat.sort_order
  ORDER BY
    market_boost DESC,
    product_count DESC,
    cat.sort_order ASC;
$$;

-- ---------------------------------------------------------------------------
-- 7. RLS for new tables
-- ---------------------------------------------------------------------------
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE fx_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_markets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "countries_public_read" ON countries;
CREATE POLICY "countries_public_read"
  ON countries FOR SELECT USING (true);

DROP POLICY IF EXISTS "countries_admin_write" ON countries;
CREATE POLICY "countries_admin_write"
  ON countries FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  )
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );

DROP POLICY IF EXISTS "fx_rates_public_read" ON fx_rates;
CREATE POLICY "fx_rates_public_read"
  ON fx_rates FOR SELECT USING (true);

DROP POLICY IF EXISTS "fx_rates_admin_write" ON fx_rates;
CREATE POLICY "fx_rates_admin_write"
  ON fx_rates FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  )
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );

DROP POLICY IF EXISTS "product_markets_public_read" ON product_markets;
CREATE POLICY "product_markets_public_read"
  ON product_markets FOR SELECT USING (true);

DROP POLICY IF EXISTS "product_markets_admin_write" ON product_markets;
CREATE POLICY "product_markets_admin_write"
  ON product_markets FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  )
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );

-- RPCs are SECURITY INVOKER by default; grant execute to anon/authenticated
GRANT EXECUTE ON FUNCTION search_catalog(text, text, text, text, text, integer, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_market_categories(text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- DONE
-- Next: run node scripts/seed-database.js (updated to seed markets + FX + links)
-- =============================================================================
