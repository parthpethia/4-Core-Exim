-- =============================================================================
-- 4Core Exim — Database Schema Migration
-- =============================================================================
-- This migration creates the core tables for the pharmaceutical export catalog:
--   1. categories       — Product classification segments
--   2. products          — Full product catalog with specifications
--   3. company_settings  — Singleton company configuration record
--   4. inquiries         — B2B lead capture from the website
--
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. CATEGORIES TABLE
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id            text        PRIMARY KEY,
  name          text        NOT NULL,
  image         text,
  sort_order    integer     DEFAULT 0,
  is_active     boolean     DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

COMMENT ON TABLE categories IS 'Therapeutic classification segments for pharmaceutical products';
COMMENT ON COLUMN categories.id IS 'Slug-style identifier, e.g. pharmaceutical-tablets';
COMMENT ON COLUMN categories.sort_order IS 'Custom display order in sidebar and grids (lower = first)';

CREATE INDEX IF NOT EXISTS idx_categories_active ON categories (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories (sort_order);

-- ---------------------------------------------------------------------------
-- 2. PRODUCTS TABLE
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id                      text        PRIMARY KEY,
  category_id             text        NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name                    text        NOT NULL,
  brand                   text,
  manufacturer            text,
  marketer                text,
  price                   numeric(10,2),
  currency                text        DEFAULT 'USD',
  strength                text,
  packaging_size          text,
  packaging_type          text,
  salt_composition        text,
  country_of_origin       text        DEFAULT 'India',
  minimum_order_quantity  text,
  storage                 text,
  treatment               text,
  description             text,
  images                  text[]      DEFAULT '{}',
  specifications          jsonb       DEFAULT '{}',
  is_active               boolean     DEFAULT true,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

COMMENT ON TABLE products IS 'Full pharmaceutical product catalog with export specifications';
COMMENT ON COLUMN products.salt_composition IS 'Active Pharmaceutical Ingredient (API) composition';
COMMENT ON COLUMN products.specifications IS 'Flexible key-value pairs: Form, Shelf Life, Side Effects, Warnings, etc.';
COMMENT ON COLUMN products.images IS 'Array of image URLs (external or Supabase Storage)';

CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_salt_search ON products USING gin (to_tsvector('english', coalesce(salt_composition, '')));
CREATE INDEX IF NOT EXISTS idx_products_specs ON products USING gin (specifications);

-- ---------------------------------------------------------------------------
-- 3. COMPANY SETTINGS TABLE (Singleton)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS company_settings (
  id                    integer     PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name                  text        NOT NULL,
  subtitle              text,
  email                 text,
  phone                 text,
  whatsapp              text,
  address               text,
  business_hours        text,
  google_maps_embed_url text,
  about_short           text,
  about_full            jsonb       DEFAULT '{}',
  updated_at            timestamptz DEFAULT now()
);

COMMENT ON TABLE company_settings IS 'Singleton row for company configuration — constrained to id=1';

-- ---------------------------------------------------------------------------
-- 4. INQUIRIES TABLE (B2B Lead Capture)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inquiries (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        text        REFERENCES products(id) ON DELETE SET NULL,
  product_name      text,
  category_name     text,
  phone             text,
  country_code      text,
  business_name     text,
  incoterm          text,
  destination_port  text,
  status            text        DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'closed')),
  notes             text,
  created_at        timestamptz DEFAULT now()
);

COMMENT ON TABLE inquiries IS 'B2B wholesale export inquiry leads captured from the website';

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_product ON inquiries (product_id);

-- ---------------------------------------------------------------------------
-- 5. AUTO-UPDATE TRIGGER FOR updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------------

-- ---- Categories ----
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "categories_admin_insert"
  ON categories FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );

CREATE POLICY "categories_admin_update"
  ON categories FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );

CREATE POLICY "categories_admin_delete"
  ON categories FOR DELETE
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );

-- ---- Products ----
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_read"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "products_admin_insert"
  ON products FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );

CREATE POLICY "products_admin_update"
  ON products FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );

CREATE POLICY "products_admin_delete"
  ON products FOR DELETE
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );

-- ---- Company Settings ----
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_public_read"
  ON company_settings FOR SELECT
  USING (true);

CREATE POLICY "company_admin_update"
  ON company_settings FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );

-- ---- Inquiries ----
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inquiries_public_insert"
  ON inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "inquiries_admin_read"
  ON inquiries FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );

CREATE POLICY "inquiries_admin_update"
  ON inquiries FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );

-- ---------------------------------------------------------------------------
-- 7. SUPABASE STORAGE BUCKET (product images)
-- ---------------------------------------------------------------------------
-- Run this separately in Supabase SQL Editor if needed:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
-- 
-- CREATE POLICY "Public read product images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'product-images');
-- 
-- CREATE POLICY "Admin upload product images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'product-images' AND
--     auth.jwt() ->> 'email' IN (
--       SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
--     )
--   );

-- ---------------------------------------------------------------------------
-- DONE: Schema creation complete.
-- Next step: Run the seed script (scripts/seed-database.js) to populate data.
-- ---------------------------------------------------------------------------
