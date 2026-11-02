# Chunk 7: Supabase RLS, Storage & Deployment Config

> **Status:** 🔲 TODO
> **Dependencies:** Chunk 1 (migration must be run first)

---

## Task 7.1: Run SQL Migration on Supabase

1. Open **Supabase Dashboard** → SQL Editor → New Query
2. Paste full contents of `supabase/migrations/001_create_tables.sql`
3. Click **Run**
4. Verify: Table Editor should show 4 new empty tables

---

## Task 7.2: Configure Admin Emails for RLS

The RLS policies reference `current_setting('app.admin_emails')`. Set this:

```sql
ALTER DATABASE postgres SET app.admin_emails = 'admin@4coreexim.com,exports@4coreexim.com';
```

> **Alternative simpler RLS approach:** If the `current_setting` approach causes issues, we can switch to a simpler approach that checks `auth.jwt() ->> 'email'` directly against hardcoded values, or use a Supabase Edge Function for admin operations.

---

## Task 7.3: Run Seed Script

```bash
# Get service role key from: Supabase Dashboard → Settings → API → service_role (secret)
set SUPABASE_URL=https://sjohchyysmbtgrebnjze.supabase.co
set SUPABASE_SERVICE_KEY=<your_service_role_key>
node scripts/seed-database.js
```

Expected output:
```
📦 Seeding 23 categories... ✅
💊 Seeding 102 products... ✅ (5 batches)
🏢 Seeding company settings... ✅
🔍 Verifying... Categories: 23, Products: 102, Company: 1
```

---

## Task 7.4: Create Storage Bucket for Product Images

In Supabase SQL Editor:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to product images
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Allow authenticated admin users to upload
CREATE POLICY "Admin upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated admin users to delete
CREATE POLICY "Admin delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );
```

---

## Task 7.5: Verify RLS Policies Work

### Test public read (no auth):
```sql
-- Should return all active products
SELECT count(*) FROM products WHERE is_active = true;
```

### Test admin write (must be authenticated admin):
- Login as admin via the website
- Try creating a product from the admin dashboard
- Should succeed if email is in the admin whitelist

### Test public insert on inquiries:
- Submit an inquiry from the public catalog (no login required)
- Check `inquiries` table in Supabase — should have 1 new row

---

## Task 7.6: RLS Fallback (If current_setting approach fails)

If the `app.admin_emails` config approach doesn't work reliably, replace all admin RLS policies with this simpler pattern:

```sql
-- Drop existing admin policies and recreate with hardcoded emails
CREATE POLICY "products_admin_write" ON products
  FOR ALL
  USING (auth.jwt() ->> 'email' IN ('admin@4coreexim.com', 'exports@4coreexim.com'));
```

This is less flexible but 100% reliable. Admin emails would then be managed by updating the RLS policies directly.

---

## Environment Variables Reference

```env
# Already in .env (used by frontend)
VITE_SUPABASE_URL=https://sjohchyysmbtgrebnjze.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# NOT in .env (used only for seed script — never expose in frontend!)
# SUPABASE_SERVICE_KEY=eyJ... (get from Supabase Dashboard → Settings → API)

# Admin emails (used by frontend AuthContext for role detection)
VITE_ADMIN_EMAILS=admin@4coreexim.com,exports@4coreexim.com
```
