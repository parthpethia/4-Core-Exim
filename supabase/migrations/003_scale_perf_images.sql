-- =============================================================================
-- 4Core Exim — Scale / Performance / Images
-- =============================================================================
-- Run AFTER 002_markets_search_scale.sql
-- Goals:
--   1. Denormalized thumbnail for list payloads (avoid shipping full image arrays)
--   2. Lean catalog RPC for fast first paint
--   3. Detail RPC for full product (lazy load on expand/detail)
--   4. Covering indexes for active catalog scans
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Thumbnail + image_count on products
-- ---------------------------------------------------------------------------
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS image_count integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN products.thumbnail_url IS 'First catalog image URL — used in list/grid to avoid transferring images[]';
COMMENT ON COLUMN products.image_count IS 'Number of images; UI can show gallery affordance without loading all URLs';

CREATE OR REPLACE FUNCTION products_sync_image_meta()
RETURNS TRIGGER AS $$
BEGIN
  NEW.image_count := COALESCE(cardinality(NEW.images), 0);
  NEW.thumbnail_url := CASE
    WHEN NEW.images IS NOT NULL AND cardinality(NEW.images) > 0 THEN NEW.images[1]
    ELSE NULL
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_image_meta ON products;
CREATE TRIGGER trg_products_image_meta
   BEFORE INSERT OR UPDATE OF images
  ON products
  FOR EACH ROW EXECUTE FUNCTION products_sync_image_meta();

-- Backfill existing rows
UPDATE products SET
  image_count = COALESCE(cardinality(images), 0),
  thumbnail_url = CASE
    WHEN images IS NOT NULL AND cardinality(images) > 0 THEN images[1]
    ELSE NULL
  END;

CREATE INDEX IF NOT EXISTS idx_products_list_cover
  ON products (is_active, category_id, name)
  INCLUDE (thumbnail_url, price, currency, brand, strength, salt_composition)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_products_updated_at
  ON products (updated_at DESC)
  WHERE is_active = true;

-- ---------------------------------------------------------------------------
-- 2. search_catalog_lite — small payload for catalog / home grids
-- ---------------------------------------------------------------------------
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
      END AS price_in_usd
    FROM products p
    CROSS JOIN params
    LEFT JOIN product_markets pm
      ON pm.product_id = p.id AND pm.country_code = params.market
    LEFT JOIN countries mkt ON mkt.code = params.market
    LEFT JOIN fx_rates src_fx ON src_fx.currency_code = p.currency
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
  counted AS (
    SELECT b.*, count(*) OVER() AS total_count FROM base b
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

COMMENT ON FUNCTION search_catalog_lite IS 'Lean catalog list — no description/specs/full images[] for fast payloads';

-- ---------------------------------------------------------------------------
-- 3. get_product_detail — full row when user opens a card / CoA
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_product_detail(
  p_id text,
  p_market_country text DEFAULT NULL
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
  thumbnail_url           text,
  image_count             integer,
  specifications          jsonb,
  is_active               boolean,
  created_at              timestamptz,
  updated_at              timestamptz,
  market_priority         integer,
  is_featured             boolean,
  preferred_currency      text,
  display_currency        text,
  price_in_usd            numeric,
  price_in_display        numeric
)
LANGUAGE sql
STABLE
AS $$
  WITH params AS (
    SELECT NULLIF(upper(trim(p_market_country)), '') AS market
  )
  SELECT
    p.id,
    p.category_id,
    p.name,
    p.brand,
    p.manufacturer,
    p.marketer,
    p.price,
    p.currency,
    p.strength,
    p.packaging_size,
    p.packaging_type,
    p.salt_composition,
    p.country_of_origin,
    p.origin_country_code,
    p.minimum_order_quantity,
    p.storage,
    p.treatment,
    p.description,
    p.images,
    p.thumbnail_url,
    p.image_count,
    p.specifications,
    p.is_active,
    p.created_at,
    p.updated_at,
    COALESCE(pm.priority, 0) AS market_priority,
    COALESCE(pm.is_featured, false) AS is_featured,
    pm.preferred_currency,
    COALESCE(pm.preferred_currency, mkt.currency_code, p.currency, 'USD') AS display_currency,
    round((p.price * COALESCE(src_fx.rate_to_usd, 1))::numeric, 4) AS price_in_usd,
    round(
      ((p.price * COALESCE(src_fx.rate_to_usd, 1)) / NULLIF(COALESCE(dst_fx.rate_to_usd, 1), 0))::numeric,
      2
    ) AS price_in_display
  FROM products p
  CROSS JOIN params
  LEFT JOIN product_markets pm
    ON pm.product_id = p.id AND pm.country_code = params.market
  LEFT JOIN countries mkt ON mkt.code = params.market
  LEFT JOIN fx_rates src_fx ON src_fx.currency_code = p.currency
  LEFT JOIN fx_rates dst_fx
    ON dst_fx.currency_code = COALESCE(pm.preferred_currency, mkt.currency_code, p.currency, 'USD')
  WHERE p.id = p_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION search_catalog_lite(text, text, text, text, text, integer, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_product_detail(text, text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Cap search_catalog page size (full payload) to reduce accidental huge pulls
-- ---------------------------------------------------------------------------
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
      END AS price_in_usd
    FROM products p
    CROSS JOIN params
    LEFT JOIN product_markets pm
      ON pm.product_id = p.id AND pm.country_code = params.market
    LEFT JOIN countries mkt ON mkt.code = params.market
    LEFT JOIN fx_rates src_fx ON src_fx.currency_code = p.currency
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
  counted AS (
    SELECT b.*, count(*) OVER() AS total_count FROM base b
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
    c.total_count
  FROM counted c
  LEFT JOIN fx_rates dst_fx ON dst_fx.currency_code = c.display_currency
  ORDER BY c.is_featured DESC, c.market_priority DESC, c.search_rank DESC, c.name ASC
  LIMIT (SELECT lim FROM params)
  OFFSET (SELECT off FROM params);
$$;

GRANT EXECUTE ON FUNCTION search_catalog(text, text, text, text, text, integer, integer) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- DONE
-- Frontend should call search_catalog_lite for lists and get_product_detail for cards.
-- =============================================================================
