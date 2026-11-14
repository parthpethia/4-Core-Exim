-- =============================================================================
-- 4Core Exim — Migration 005: Admin Hardening & RLS Improvement
-- =============================================================================
-- Creates admin_users table, is_admin() function, and updates RLS policies
-- to use the admin_users table instead of the app.admin_emails GUC variable.
-- =============================================================================

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text        NOT NULL UNIQUE,
  role        text        DEFAULT 'admin',
  created_at  timestamptz DEFAULT now()
);

COMMENT ON TABLE admin_users IS 'Whitelist of administrator emails for Trade Desk access';

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admins can only see their own row (prevents enumeration)
DO $$ BEGIN
  CREATE POLICY "admin_users_self_read" ON admin_users
    FOR SELECT USING (auth.jwt() ->> 'email' = email);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. is_admin() RPC Function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

-- 3. Helper for RLS policies
CREATE OR REPLACE FUNCTION is_admin_email(check_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE lower(email) = lower(check_email)
  );
$$;

-- 4. Add updated_at to inquiries (was missing)
DO $$ BEGIN
  ALTER TABLE inquiries ADD COLUMN updated_at timestamptz DEFAULT now();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_inquiries_updated_at
    BEFORE UPDATE ON inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. Replace RLS policies to use admin_users table
-- (Drop old policies that used app.admin_emails GUC, recreate with is_admin())

-- Categories
DROP POLICY IF EXISTS "categories_admin_insert" ON categories;
DROP POLICY IF EXISTS "categories_admin_update" ON categories;
DROP POLICY IF EXISTS "categories_admin_delete" ON categories;

CREATE POLICY "categories_admin_insert" ON categories
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "categories_admin_update" ON categories
  FOR UPDATE USING (is_admin());

CREATE POLICY "categories_admin_delete" ON categories
  FOR DELETE USING (is_admin());

-- Products
DROP POLICY IF EXISTS "products_admin_insert" ON products;
DROP POLICY IF EXISTS "products_admin_update" ON products;
DROP POLICY IF EXISTS "products_admin_delete" ON products;

CREATE POLICY "products_admin_insert" ON products
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "products_admin_update" ON products
  FOR UPDATE USING (is_admin());

CREATE POLICY "products_admin_delete" ON products
  FOR DELETE USING (is_admin());

-- Company Settings
DROP POLICY IF EXISTS "company_admin_update" ON company_settings;

CREATE POLICY "company_admin_update" ON company_settings
  FOR UPDATE USING (is_admin());

-- Inquiries
DROP POLICY IF EXISTS "inquiries_admin_read" ON inquiries;
DROP POLICY IF EXISTS "inquiries_admin_update" ON inquiries;

CREATE POLICY "inquiries_admin_read" ON inquiries
  FOR SELECT USING (is_admin());

CREATE POLICY "inquiries_admin_update" ON inquiries
  FOR UPDATE USING (is_admin());

-- =============================================================================
-- DONE: Admin hardening migration complete.
-- Next: Insert admin emails into admin_users table:
--   INSERT INTO admin_users (email) VALUES ('your@email.com');
-- =============================================================================
