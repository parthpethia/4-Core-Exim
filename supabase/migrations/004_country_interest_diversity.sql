-- =============================================================================
-- 004_country_interest_diversity.sql
-- Learns what each destination market usually inquires for, then ranks the
-- catalog with diversity so the same brand/salt/category does not monopolize.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Enrich inquiries with market / device context
-- ---------------------------------------------------------------------------
ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS market_country text REFERENCES countries(code),
  ADD COLUMN IF NOT EXISTS timezone text,
  ADD COLUMN IF NOT EXISTS locale text,
  ADD COLUMN IF NOT EXISTS category_id text REFERENCES categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inquiries_market_created
  ON inquiries (market_country, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inquiries_category
  ON inquiries (category_id);

COMMENT ON COLUMN inquiries.market_country IS 'Detected/selected export market ISO code (AE, NG, …) — used for country-interest learning';
COMMENT ON COLUMN inquiries.timezone IS 'Visitor IANA timezone at inquiry time';
COMMENT ON COLUMN inquiries.locale IS 'Visitor browser locale at inquiry time';

-- Backfill market from phone dial code when possible
UPDATE inquiries i
SET market_country = m.code
FROM (
  VALUES
    ('+91', 'IN'), ('+971', 'AE'), ('+966', 'SA'), ('+234', 'NG'), ('+254', 'KE'),
    ('+233', 'GH'), ('+20', 'EG'), ('+880', 'BD'), ('+977', 'NP'), ('+94', 'LK'),
    ('+44', 'GB'), ('+1', 'US'), ('+49', 'DE'), ('+84', 'VN'), ('+63', 'PH'),
    ('+60', 'MY'), ('+62', 'ID'), ('+27', 'ZA'), ('+55', 'BR'), ('+95', 'MM')
) AS m(dial, code)
WHERE i.market_country IS NULL
  AND i.country_code IS NOT NULL
  AND replace(i.country_code, ' ', '') = m.dial;

-- Backfill category_id from product when missing
UPDATE inquiries i
SET category_id = p.category_id
FROM products p
WHERE i.category_id IS NULL
  AND i.product_id = p.id;

-- ---------------------------------------------------------------------------
-- 2. Aggregated interest tables (refreshed from inquiries)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS country_product_interest (
  country_code    text NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
  product_id      text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  inquiry_weight  double precision NOT NULL DEFAULT 0,
  inquiry_count   integer NOT NULL DEFAULT 0,
  last_inquiry_at timestamptz,
  updated_at      timestamptz DEFAULT now(),
  PRIMARY KEY (country_code, product_id)
);

CREATE TABLE IF NOT EXISTS country_category_interest (
  country_code    text NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
  category_id     text NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  inquiry_weight  double precision NOT NULL DEFAULT 0,
  inquiry_count   integer NOT NULL DEFAULT 0,
  last_inquiry_at timestamptz,
  updated_at      timestamptz DEFAULT now(),
  PRIMARY KEY (country_code, category_id)
);

CREATE INDEX IF NOT EXISTS idx_cpi_country_weight
  ON country_product_interest (country_code, inquiry_weight DESC);

CREATE INDEX IF NOT EXISTS idx_cci_country_weight
  ON country_category_interest (country_code, inquiry_weight DESC);

COMMENT ON TABLE country_product_interest IS 'Learned product demand per destination market (time-decayed inquiry weight)';
COMMENT ON TABLE country_category_interest IS 'Learned category demand per destination market';

-- ---------------------------------------------------------------------------
-- 3. Refresh algorithm — exponential time decay (~90d half-life-ish)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION refresh_country_interest()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM country_product_interest;
  DELETE FROM country_category_interest;

  INSERT INTO country_product_interest (
    country_code, product_id, inquiry_weight, inquiry_count, last_inquiry_at, updated_at
  )
  SELECT
    i.market_country,
    i.product_id,
    sum(exp(-EXTRACT(EPOCH FROM (now() - i.created_at)) / 86400.0 / 130.0))::double precision,
    count(*)::integer,
    max(i.created_at),
    now()
  FROM inquiries i
  WHERE i.market_country IS NOT NULL
    AND i.product_id IS NOT NULL
    AND i.created_at > now() - interval '365 days'
  GROUP BY i.market_country, i.product_id;

  INSERT INTO country_category_interest (
    country_code, category_id, inquiry_weight, inquiry_count, last_inquiry_at, updated_at
  )
  SELECT
    i.market_country,
    coalesce(i.category_id, p.category_id),
    sum(exp(-EXTRACT(EPOCH FROM (now() - i.created_at)) / 86400.0 / 130.0))::double precision,
    count(*)::integer,
    max(i.created_at),
    now()
  FROM inquiries i
  LEFT JOIN products p ON p.id = i.product_id
  WHERE i.market_country IS NOT NULL
    AND coalesce(i.category_id, p.category_id) IS NOT NULL
    AND i.created_at > now() - interval '365 days'
  GROUP BY i.market_country, coalesce(i.category_id, p.category_id);
END;
$$;

CREATE OR REPLACE FUNCTION trg_inquiries_refresh_interest()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Cheap incremental upsert for the new row; full rebuild stays available
  IF NEW.market_country IS NOT NULL AND NEW.product_id IS NOT NULL THEN
    INSERT INTO country_product_interest AS cpi (
      country_code, product_id, inquiry_weight, inquiry_count, last_inquiry_at, updated_at
    ) VALUES (
      NEW.market_country, NEW.product_id, 1.0, 1, NEW.created_at, now()
    )
    ON CONFLICT (country_code, product_id) DO UPDATE SET
      inquiry_weight = cpi.inquiry_weight + 1.0,
      inquiry_count = cpi.inquiry_count + 1,
      last_inquiry_at = GREATEST(cpi.last_inquiry_at, EXCLUDED.last_inquiry_at),
      updated_at = now();
  END IF;

  IF NEW.market_country IS NOT NULL AND NEW.category_id IS NOT NULL THEN
    INSERT INTO country_category_interest AS cci (
      country_code, category_id, inquiry_weight, inquiry_count, last_inquiry_at, updated_at
    ) VALUES (
      NEW.market_country, NEW.category_id, 1.0, 1, NEW.created_at, now()
    )
    ON CONFLICT (country_code, category_id) DO UPDATE SET
      inquiry_weight = cci.inquiry_weight + 1.0,
      inquiry_count = cci.inquiry_count + 1,
      last_inquiry_at = GREATEST(cci.last_inquiry_at, EXCLUDED.last_inquiry_at),
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_inquiries_refresh_interest ON inquiries;
CREATE TRIGGER trg_inquiries_refresh_interest
  AFTER INSERT ON inquiries
  FOR EACH ROW EXECUTE FUNCTION trg_inquiries_refresh_interest();

-- Initial build
SELECT refresh_country_interest();

-- ---------------------------------------------------------------------------
-- 4. Admin / analytics: interest by country
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_country_interest_summary(p_limit integer DEFAULT 20)
RETURNS TABLE (
  country_code      text,
  country_name      text,
  inquiry_weight    double precision,
  inquiry_count     bigint,
  top_product_id    text,
  top_product_name  text,
  top_category_id   text,
  top_category_name text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  WITH country_totals AS (
    SELECT
      i.market_country AS country_code,
      count(*)::bigint AS inquiry_count,
      sum(exp(-EXTRACT(EPOCH FROM (now() - i.created_at)) / 86400.0 / 130.0))::double precision AS inquiry_weight
    FROM inquiries i
    WHERE i.market_country IS NOT NULL
      AND i.created_at > now() - interval '365 days'
    GROUP BY i.market_country
  ),
  top_prod AS (
    SELECT DISTINCT ON (cpi.country_code)
      cpi.country_code,
      cpi.product_id,
      p.name AS product_name
    FROM country_product_interest cpi
    JOIN products p ON p.id = cpi.product_id
    ORDER BY cpi.country_code, cpi.inquiry_weight DESC
  ),
  top_cat AS (
    SELECT DISTINCT ON (cci.country_code)
      cci.country_code,
      cci.category_id,
      cat.name AS category_name
    FROM country_category_interest cci
    JOIN categories cat ON cat.id = cci.category_id
    ORDER BY cci.country_code, cci.inquiry_weight DESC
  )
  SELECT
    ct.country_code,
    c.name AS country_name,
    ct.inquiry_weight,
    ct.inquiry_count,
    tp.product_id AS top_product_id,
    tp.product_name AS top_product_name,
    tc.category_id AS top_category_id,
    tc.category_name AS top_category_name
  FROM country_totals ct
  JOIN countries c ON c.code = ct.country_code
  LEFT JOIN top_prod tp ON tp.country_code = ct.country_code
  LEFT JOIN top_cat tc ON tc.country_code = ct.country_code
  ORDER BY ct.inquiry_weight DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 20), 1), 100);
$$;

GRANT EXECUTE ON FUNCTION get_country_interest_summary(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_country_interest() TO authenticated;

-- ---------------------------------------------------------------------------
-- 5. search_catalog_lite — interest + diversity penalties
--    diversity: penalize 2nd/3rd hit in same category or brand so lists mix
--    Must DROP first: return row type adds interest_score (CREATE OR REPLACE
--    cannot change OUT/RETURNS TABLE shape — error 42P13).
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS search_catalog_lite(text, text, text, text, text, integer, integer);

CREATE OR REPLACE FUNCTION search_catalog_lite(
  p_search          text DEFAULT NULL,
  p_category_id     text DEFAULT NULL,
  p_market_country  text DEFAULT NULL,
  p_origin_country  text DEFAULT NULL,
  p_pharmacopeia    text DEFAULT NULL,
  p_limit           integer DEFAULT 24,
  p_offset          integer DEFAULT 0
)
RETURNS TABLE (
  id                      text,
  category_id             text,
  name                    text,
  brand                   text,
  manufacturer            text,
  price                   numeric,
  currency                text,
  strength                text,
  packaging_size          text,
  packaging_type          text,
  salt_composition        text,
  country_of_origin       text,
  origin_country_code     text,
  minimum_order_quantity  text,
  treatment               text,
  thumbnail_url           text,
  image_count             integer,
  market_priority         integer,
  is_featured             boolean,
  display_currency        text,
  price_in_usd            numeric,
  price_in_display        numeric,
  search_rank             real,
  interest_score          real,
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
      LEAST(GREATEST(COALESCE(p_limit, 24), 1), 100) AS lim,
      GREATEST(COALESCE(p_offset, 0), 0) AS off
  ),
  ts AS (
    SELECT
      CASE WHEN q IS NULL THEN NULL ELSE plainto_tsquery('english', q) END AS tsq
    FROM params
  ),
  base AS (
    SELECT
      p.id,
      p.category_id,
      p.name,
      p.brand,
      p.manufacturer,
      p.price,
      p.currency,
      p.strength,
      p.packaging_size,
      p.packaging_type,
      p.salt_composition,
      p.country_of_origin,
      p.origin_country_code,
      p.minimum_order_quantity,
      p.treatment,
      p.thumbnail_url,
      p.image_count,
      COALESCE(pm.priority, 0) AS market_priority,
      COALESCE(pm.is_featured, false) AS is_featured,
      COALESCE(pm.preferred_currency, mkt.currency_code, 'USD') AS display_currency,
      CASE
        WHEN (SELECT tsq FROM ts) IS NULL THEN 0::real
        ELSE ts_rank_cd(p.search_vector, (SELECT tsq FROM ts))
      END AS search_rank,
      CASE
        WHEN p.price IS NULL THEN NULL
        ELSE p.price * COALESCE(src_fx.rate_to_usd, 1)
      END AS price_in_usd,
      -- Interest: log dampens monopoly; category interest + editorial priority
      (
        CASE WHEN COALESCE(pm.is_featured, false) THEN 28.0 ELSE 0.0 END
        + COALESCE(pm.priority, 0) * 0.45
        + ln(1.0 + COALESCE(cpi.inquiry_weight, 0)) * 18.0
        + ln(1.0 + COALESCE(cci.inquiry_weight, 0)) * 8.0
        + CASE
            WHEN (SELECT tsq FROM ts) IS NULL THEN 0.0
            ELSE ts_rank_cd(p.search_vector, (SELECT tsq FROM ts)) * 40.0
          END
      )::real AS raw_interest
    FROM products p
    CROSS JOIN params
    LEFT JOIN product_markets pm
      ON pm.product_id = p.id AND pm.country_code = params.market
    LEFT JOIN countries mkt ON mkt.code = params.market
    LEFT JOIN fx_rates src_fx ON src_fx.currency_code = p.currency
    LEFT JOIN country_product_interest cpi
      ON cpi.product_id = p.id AND cpi.country_code = params.market
    LEFT JOIN country_category_interest cci
      ON cci.category_id = p.category_id AND cci.country_code = params.market
    WHERE p.is_active = true
      AND (params.cat IS NULL OR params.cat = 'all' OR p.category_id = params.cat)
      AND (
        params.origin IS NULL
        OR p.origin_country_code = params.origin
      )
      AND (
        (SELECT tsq FROM ts) IS NULL
        OR p.search_vector @@ (SELECT tsq FROM ts)
        OR p.name ILIKE '%' || params.q || '%'
        OR coalesce(p.salt_composition, '') ILIKE '%' || params.q || '%'
        OR coalesce(p.brand, '') ILIKE '%' || params.q || '%'
      )
      AND (
        params.mono IS NULL OR params.mono = 'ALL'
        OR upper(coalesce(p.name, '') || ' ' || coalesce(p.salt_composition, ''))
            LIKE '%' || params.mono || '%'
      )
  ),
  diversified AS (
    SELECT
      b.*,
      row_number() OVER (
        PARTITION BY b.category_id
        ORDER BY b.raw_interest DESC, b.name ASC
      ) AS cat_rn,
      row_number() OVER (
        PARTITION BY lower(coalesce(nullif(b.brand, ''), b.id))
        ORDER BY b.raw_interest DESC, b.name ASC
      ) AS brand_rn,
      row_number() OVER (
        PARTITION BY lower(left(regexp_replace(coalesce(b.salt_composition, ''), '[^a-zA-Z0-9]+', ' ', 'g'), 40))
        ORDER BY b.raw_interest DESC, b.name ASC
      ) AS salt_rn
    FROM base b
  ),
  scored AS (
    SELECT
      d.*,
      (
        d.raw_interest
        - (d.cat_rn - 1) * 12.0
        - (d.brand_rn - 1) * 18.0
        - (d.salt_rn - 1) * 20.0
      )::real AS interest_score
    FROM diversified d
  ),
  counted AS (
    SELECT s.*, count(*) OVER() AS total_count FROM scored s
  )
  SELECT
    c.id,
    c.category_id,
    c.name,
    c.brand,
    c.manufacturer,
    c.price,
    c.currency,
    c.strength,
    c.packaging_size,
    c.packaging_type,
    c.salt_composition,
    c.country_of_origin,
    c.origin_country_code,
    c.minimum_order_quantity,
    c.treatment,
    c.thumbnail_url,
    c.image_count,
    c.market_priority,
    c.is_featured,
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
    c.interest_score,
    c.total_count
  FROM counted c
  LEFT JOIN fx_rates dst_fx ON dst_fx.currency_code = c.display_currency
  ORDER BY
    c.interest_score DESC,
    c.search_rank DESC,
    c.name ASC
  LIMIT (SELECT lim FROM params)
  OFFSET (SELECT off FROM params);
$$;

COMMENT ON FUNCTION search_catalog_lite IS 'Lean catalog with country-interest learning + category/brand/salt diversity';

-- ---------------------------------------------------------------------------
-- 6. Full search_catalog — same interest + diversity ordering
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS search_catalog(text, text, text, text, text, integer, integer);

CREATE OR REPLACE FUNCTION search_catalog(
  p_search          text DEFAULT NULL,
  p_category_id     text DEFAULT NULL,
  p_market_country  text DEFAULT NULL,
  p_origin_country  text DEFAULT NULL,
  p_pharmacopeia    text DEFAULT NULL,
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
  interest_score          real,
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
      LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100) AS lim,
      GREATEST(COALESCE(p_offset, 0), 0) AS off
  ),
  ts AS (
    SELECT
      CASE WHEN q IS NULL THEN NULL ELSE plainto_tsquery('english', q) END AS tsq
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
      CASE
        WHEN p.price IS NULL THEN NULL
        ELSE p.price * COALESCE(src_fx.rate_to_usd, 1)
      END AS price_in_usd,
      (
        CASE WHEN COALESCE(pm.is_featured, false) THEN 28.0 ELSE 0.0 END
        + COALESCE(pm.priority, 0) * 0.45
        + ln(1.0 + COALESCE(cpi.inquiry_weight, 0)) * 18.0
        + ln(1.0 + COALESCE(cci.inquiry_weight, 0)) * 8.0
        + CASE
            WHEN (SELECT tsq FROM ts) IS NULL THEN 0.0
            ELSE ts_rank_cd(p.search_vector, (SELECT tsq FROM ts)) * 40.0
          END
      )::real AS raw_interest
    FROM products p
    CROSS JOIN params
    LEFT JOIN product_markets pm
      ON pm.product_id = p.id AND pm.country_code = params.market
    LEFT JOIN countries mkt ON mkt.code = params.market
    LEFT JOIN fx_rates src_fx ON src_fx.currency_code = p.currency
    LEFT JOIN country_product_interest cpi
      ON cpi.product_id = p.id AND cpi.country_code = params.market
    LEFT JOIN country_category_interest cci
      ON cci.category_id = p.category_id AND cci.country_code = params.market
    WHERE p.is_active = true
      AND (params.cat IS NULL OR params.cat = 'all' OR p.category_id = params.cat)
      AND (params.origin IS NULL OR p.origin_country_code = params.origin)
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
  diversified AS (
    SELECT
      b.*,
      row_number() OVER (
        PARTITION BY b.category_id
        ORDER BY b.raw_interest DESC, b.name ASC
      ) AS cat_rn,
      row_number() OVER (
        PARTITION BY lower(coalesce(nullif(b.brand, ''), b.id))
        ORDER BY b.raw_interest DESC, b.name ASC
      ) AS brand_rn,
      row_number() OVER (
        PARTITION BY lower(left(regexp_replace(coalesce(b.salt_composition, ''), '[^a-zA-Z0-9]+', ' ', 'g'), 40))
        ORDER BY b.raw_interest DESC, b.name ASC
      ) AS salt_rn
    FROM base b
  ),
  scored AS (
    SELECT
      d.*,
      (
        d.raw_interest
        - (d.cat_rn - 1) * 12.0
        - (d.brand_rn - 1) * 18.0
        - (d.salt_rn - 1) * 20.0
      )::real AS interest_score
    FROM diversified d
  ),
  counted AS (
    SELECT s.*, count(*) OVER() AS total_count FROM scored s
  )
  SELECT
    c.id, c.category_id, c.name, c.brand, c.manufacturer, c.marketer,
    c.price, c.currency, c.strength, c.packaging_size, c.packaging_type,
    c.salt_composition, c.country_of_origin, c.origin_country_code,
    c.minimum_order_quantity, c.storage, c.treatment, c.description,
    c.images, c.specifications, c.is_active, c.created_at, c.updated_at,
    c.market_priority, c.is_featured, c.preferred_currency, c.display_currency,
    round(c.price_in_usd::numeric, 4) AS price_in_usd,
    round(
      CASE
        WHEN c.price_in_usd IS NULL THEN NULL
        ELSE c.price_in_usd / NULLIF(COALESCE(dst_fx.rate_to_usd, 1), 0)
      END::numeric, 2
    ) AS price_in_display,
    c.search_rank,
    c.interest_score,
    c.total_count
  FROM counted c
  LEFT JOIN fx_rates dst_fx ON dst_fx.currency_code = c.display_currency
  ORDER BY c.interest_score DESC, c.search_rank DESC, c.name ASC
  LIMIT (SELECT lim FROM params)
  OFFSET (SELECT off FROM params);
$$;

GRANT EXECUTE ON FUNCTION search_catalog_lite(text, text, text, text, text, integer, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_catalog(text, text, text, text, text, integer, integer) TO anon, authenticated;

-- Categories: blend editorial product_markets boost with learned category interest
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
    (
      COALESCE(sum(COALESCE(pm.priority, 0)) FILTER (WHERE p.is_active), 0)
      + COALESCE(max(cci.inquiry_weight) * 40, 0)
    )::bigint AS market_boost
  FROM categories cat
  CROSS JOIN params
  LEFT JOIN products p ON p.category_id = cat.id AND p.is_active = true
  LEFT JOIN product_markets pm
    ON pm.product_id = p.id AND pm.country_code = params.market
  LEFT JOIN country_category_interest cci
    ON cci.category_id = cat.id AND cci.country_code = params.market
  WHERE cat.is_active = true
  GROUP BY cat.id, cat.name, cat.image, cat.sort_order
  ORDER BY
    market_boost DESC,
    product_count DESC,
    cat.sort_order ASC;
$$;

GRANT EXECUTE ON FUNCTION get_market_categories(text) TO anon, authenticated;

-- RLS for interest tables (public read — powers anonymous catalog ranking)
ALTER TABLE country_product_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE country_category_interest ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cpi_public_read" ON country_product_interest;
CREATE POLICY "cpi_public_read"
  ON country_product_interest FOR SELECT USING (true);

DROP POLICY IF EXISTS "cci_public_read" ON country_category_interest;
CREATE POLICY "cci_public_read"
  ON country_category_interest FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- DONE
-- Apply in Supabase SQL editor or: supabase db push
-- =============================================================================
