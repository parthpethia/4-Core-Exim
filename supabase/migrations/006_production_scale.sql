-- =============================================================================
-- 4Core Exim — Migration 006: Production Scale — Trigram Indexes & Audit Logs
-- =============================================================================
-- Enables fast fuzzy search on products and adds an admin audit trail.
-- Prerequisite: Migration 005 (admin hardening) must be active.
-- =============================================================================

-- 1. Trigram extension for fast prefix / fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Trigram GIN indexes on searchable product columns
--    These accelerate `ilike '%term%'` queries that previously caused full seq scans.
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON products USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_brand_trgm
  ON products USING gin (brand gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_salt_trgm
  ON products USING gin (salt_composition gin_trgm_ops);

-- 3. Composite B-Tree index for the admin product table
--    Covers: category filter + active/inactive toggle + default sort order
CREATE INDEX IF NOT EXISTS idx_products_admin_list
  ON products (category_id, is_active, created_at DESC);

-- 4. Admin Audit Logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email text        NOT NULL,
  action      text        NOT NULL CHECK (action IN (
    'create', 'update', 'delete', 'status_change', 'bulk_import', 'bulk_export'
  )),
  entity_type text        NOT NULL CHECK (entity_type IN (
    'product', 'category', 'company', 'inquiry'
  )),
  entity_id   text        NOT NULL,
  changes     jsonb       DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
DO $$ BEGIN
  CREATE POLICY "audit_logs_admin_read" ON public.admin_audit_logs
    FOR SELECT USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Only admins can insert audit logs
DO $$ BEGIN
  CREATE POLICY "audit_logs_admin_insert" ON public.admin_audit_logs
    FOR INSERT WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- DONE: Production scale migration complete.
-- - pg_trgm enabled for fuzzy search
-- - Trigram indexes on products.name, brand, salt_composition
-- - Composite admin list index on (category_id, is_active, created_at)
-- - admin_audit_logs table with RLS policies
-- =============================================================================
