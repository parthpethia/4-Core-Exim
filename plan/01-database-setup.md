# Chunk 1: Database Schema & Seed Script

> **Status:** ✅ DONE
> **Files created:** `supabase/migrations/001_create_tables.sql`, `scripts/seed-database.js`

---

## What Was Done

### SQL Migration (`supabase/migrations/001_create_tables.sql`)

Created 4 tables in Supabase PostgreSQL:

| Table | Rows | Purpose |
|-------|------|---------|
| `categories` | 23 | Therapeutic classification (slug ID, name, image, sort_order, is_active) |
| `products` | 102 | Full catalog — 18+ columns including `images text[]` and `specifications jsonb` |
| `company_settings` | 1 | Singleton company config (constrained to id=1) |
| `inquiries` | 0 | B2B lead capture from website forms |

**Also includes:**
- `update_updated_at_column()` trigger function on categories, products, company_settings
- GIN indexes on `products.name`, `products.salt_composition`, `products.specifications`
- Foreign key: `products.category_id → categories.id` with ON DELETE RESTRICT
- RLS policies for all tables (public read, admin write, public inquiry insert)

### Seed Script (`scripts/seed-database.js`)

Node.js ES module script that:
1. Reads `src/data/categories.json`, `products.json`, `company.json`
2. Converts camelCase → snake_case for DB columns
3. Upserts categories first (FK dependency), then products in batches of 25, then company
4. Verifies data with counts and sample queries

---

## How To Run (Instructions for Next Session)

### Step 1: Run the SQL migration
1. Open Supabase Dashboard → SQL Editor → New Query
2. Paste entire contents of `supabase/migrations/001_create_tables.sql`
3. Click "Run" — should complete with no errors

### Step 2: Configure admin emails in Supabase
In Supabase Dashboard → Database → Extensions, or via SQL:
```sql
-- Set admin emails for RLS policies
ALTER DATABASE postgres SET app.admin_emails = 'admin@4coreexim.com,exports@4coreexim.com';
```

### Step 3: Run the seed script
```bash
# Get your service role key from: Supabase Dashboard → Settings → API → service_role (secret)
# WARNING: Never expose the service role key in frontend code!

SUPABASE_URL=https://sjohchyysmbtgrebnjze.supabase.co \
SUPABASE_SERVICE_KEY=your_service_role_key_here \
node scripts/seed-database.js
```

### Step 4: Verify in Supabase
- Table Editor → `categories` should show 23 rows
- Table Editor → `products` should show 102 rows
- Table Editor → `company_settings` should show 1 row

### Step 5: Create Storage Bucket (for future image uploads)
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
```

---

## Product Schema Reference (for other chunks)

Each product in the DB has these columns:
```
id (text PK)          | category_id (text FK)    | name (text)
brand (text)          | manufacturer (text)      | marketer (text)
price (numeric)       | currency (text)          | strength (text)
packaging_size (text) | packaging_type (text)    | salt_composition (text)
country_of_origin     | minimum_order_quantity   | storage (text)
treatment (text)      | description (text)       | images (text[])
specifications (jsonb)| is_active (boolean)      | created_at / updated_at
```

The service layer maps these to frontend camelCase:
`packaging_size` → `packagingSize`, `salt_composition` → `saltComposition`, etc.
