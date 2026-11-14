# Chunk 11: Production Scaling & Quality Architecture Roadmap

> **Status:** 📋 ARCHITECTURE & IMPLEMENTATION ROADMAP  
> **Context:** Upgrades the 4Core Exim Trade Desk Admin from "hardened & secure" to "enterprise-grade pharma export trade desk".

---

## Executive Summary

Following the initial security hardening (purging dev admin bypasses, fixing GUC RLS policies with `is_admin()`, and eliminating false-positive pharmacopeia regexes), this document outlines the **Phase 2 Architecture Upgrades** required to scale 4Core Exim to 5,000+ pharmaceutical SKUs and high-volume overseas buyer traffic.

---

## 1. Server-Side SQL Pagination & Indexed Search (`AdminProductTable`)

### The Problem
- Currently, `getAdminProducts()` in `src/services/productService.js` executes `SELECT * FROM products` without limits.
- `AdminProductTable.jsx` downloads all rows into browser memory and paginates with JavaScript `Array.slice()`.
- At 2,000+ pharmaceutical formulations with specifications, descriptions, and image arrays, every page load transfers 15–25 MB of redundant JSON.
- `ilike '%term%'` causes full sequential table scans in Postgres on every search keystroke, ignoring standard B-Tree indexes.

### Implementation Blueprint
1. **Service Layer (`src/services/productService.js` or `adminService.js`)**:
   ```javascript
   export const getAdminProductsPaginated = async ({
     page = 1,
     pageSize = 20,
     category = 'all',
     search = '',
     status = 'all',
     sortBy = 'created_at',
     sortOrder = 'desc'
   } = {}) => {
     const from = (page - 1) * pageSize;
     const to = from + pageSize - 1;

     let query = supabase
       .from('products')
       .select(
         'id, name, brand, category_id, price, currency, strength, packaging_size, salt_composition, is_active, created_at, thumbnail_url',
         { count: 'exact' }
       );

     if (category !== 'all') {
       query = query.eq('category_id', category);
     }
     if (status === 'active') {
       query = query.eq('is_active', true);
     } else if (status === 'inactive') {
       query = query.eq('is_active', false);
     }
     if (search.trim()) {
       const term = search.trim();
       // Use textSearch or ilike with count
       query = query.or(`name.ilike.%${term}%,brand.ilike.%${term}%,salt_composition.ilike.%${term}%`);
     }

     query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(from, to);

     const { data, count, error } = await query;
     if (error) throw error;

     return {
       products: (data || []).map(productRowToFrontend),
       totalCount: count || 0,
       page,
       pageSize,
       totalPages: Math.ceil((count || 0) / pageSize)
     };
   };
   ```

2. **Database Performance Index (SQL)**:
   ```sql
   -- Trigram search index for fast prefix and fuzzy searches on products
   CREATE EXTENSION IF NOT EXISTS pg_trgm;

   CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
   CREATE INDEX IF NOT EXISTS idx_products_brand_trgm ON products USING gin (brand gin_trgm_ops);
   CREATE INDEX IF NOT EXISTS idx_products_salt_trgm ON products USING gin (salt_composition gin_trgm_ops);
   ```

3. **UI Component (`AdminProductTable.jsx`)**:
   - Replace `const [products, setProducts]` with server-pagination state: `page`, `pageSize`, `totalCount`, `loading`.
   - Update pagination controls to request the specific page index from Supabase directly.

---

## 2. B2B Bulk Catalog Operations (CSV / Excel Import & Export)

### The Problem
- Real pharmaceutical export operations manage pricing updates, MOQs, packaging changes, and newly registered therapeutic molecules in bulk spreadsheets.
- Currently, admins can only add or update products 1-by-1 through a modal form.

### Implementation Blueprint
1. **Catalog Export to CSV**:
   - Add "Export Catalog CSV" button in the `AdminProductTable` toolbar.
   - Generates and downloads a standardized CSV containing all export fields (`id`, `name`, `category`, `brand`, `strength`, `saltComposition`, `price`, `currency`, `minimumOrderQuantity`, `packagingType`, `countryOfOrigin`, `isActive`).

2. **Bulk CSV Import with Dry-Run Validation**:
   - Modal component: `src/components/admin/BulkProductImportModal.jsx`.
   - Steps:
     1. **Upload**: Accepts `.csv` file.
     2. **Parser & Schema Validator**: Validates required columns, validates category IDs against existing categories, parses numeric prices, flags syntax errors.
     3. **Diff Preview**: Displays summary to admin before commit:
        - 🟢 `X` New products to insert
        - 🟡 `Y` Existing products to update (matched by `id`)
        - 🔴 `Z` Invalid rows with row numbers and specific errors
     4. **Execute**: Batched Supabase upsert:
        ```javascript
        const { data, error } = await supabase
          .from('products')
          .upsert(rows, { onConflict: 'id', ignoreDuplicates: false });
        ```

---

## 3. Graceful Error Handling & Slug Conflict Resolution

### The Problem
- If an admin creates a product with an ID/slug that already exists, Supabase throws an unformatted PostgreSQL error:
  `duplicate key value violates unique constraint "products_pkey"`
- The error is shown directly in the UI without actionable guidance.

### Implementation Blueprint
1. **Frontend Pre-flight / Error Translation (`AdminProductForm.jsx`)**:
   ```javascript
   // Check if slug exists before inserting (create mode)
   if (!isEditMode) {
     const { data: existing } = await supabase
       .from('products')
       .select('id')
       .eq('id', form.id)
       .maybeSingle();

     if (existing) {
       throw new Error(`A product with the slug ID "${form.id}" already exists. Please customize the slug or product name.`);
     }
   }
   ```
2. **Postgres Error Code Mapping**:
   - Wrap Supabase mutation errors with user-friendly messages:
     - `23505` (Unique Violation) → "Product ID already in use."
     - `23503` (Foreign Key Violation) → "Selected category does not exist in the database."
     - `42501` (Permission Denied) → "Your Trade Desk session has expired. Please sign in again."

---

## 4. Inbound B2B Inquiry Defense & Anti-Spam Pipeline

### The Problem
- `submitInquiry` is an unauthenticated public mutation (`WITH CHECK (true)`).
- Without rate limiting or anti-spam mechanisms, scrapers or spambots can script thousands of fake inquiries, polluting the database.

### Implementation Blueprint
1. **Client-Side Honeypot Field**:
   - Add an invisible input field (`website_address` or `company_fax`) hidden via CSS (`opacity: 0; position: absolute; pointer-events: none`).
   - If the field is populated upon submit, silently discard the submission (as only bots fill hidden inputs).

2. **Submission Timing Guard**:
   - Reject inquiries submitted in under 1.5 seconds from form mount (human users take at least 5–10 seconds to fill phone, business name, and port).

3. **Database Throttling Policy or Edge Function**:
   - Store visitor IP hash in `inquiries` and block more than 5 submissions per hour from the same IP origin.

---

## 5. Instant Trade Desk Alerts (WhatsApp / Email Webhook)

### The Problem
- Inquiries currently sit silently in PostgreSQL until an admin logs in.
- In pharmaceutical exports, response time to international RFQs (e.g., from UAE, Kenya, Saudi Arabia, Philippines) directly determines conversion rates.

### Implementation Blueprint
1. **Supabase Database Webhook**:
   - Event: `INSERT` on `public.inquiries`.
   - Target: Supabase Edge Function (`send-inquiry-alert`) or Next/Vercel webhook.

2. **Notification Dispatch Channels**:
   - **Email Dispatch**: Send transaction alert to `exports@4coreexim.com` via Resend / SendGrid with:
     - Buyer Business Name
     - Country & Dial Code
     - Requested Formulation & MOQ
     - Incoterm (FOB / CIF) & Destination Port
   - **Optional WhatsApp Alert**: Twilio WhatsApp API sending instant ping to designated trade desk officer mobile.

---

## 6. Service Layer Modularization (`src/services/`)

### The Problem
- `src/services/productService.js` is currently 1,015 lines long.
- It contains public catalog queries, admin mutations, FX conversion fallbacks, mock data fallbacks, country interest diversity algorithms, and storage upload logic.

### Implementation Blueprint
Refactor into focused domain modules:

```
src/services/
├── supabaseClient.js       # Client singleton + fallback stubs
├── catalogService.js       # Public search, RPCs, category boosting
├── adminService.js         # Admin CRUD, paginated tables, bulk CSV
├── inquiryService.js       # B2B inquiry capture, status management
├── storageService.js       # Image upload, MIME verification, CDN URLs
└── fxService.js            # Currency conversion & exchange rate caching
```

---

## 7. Audit Trail & Activity Logging

### The Problem
- Multiple officers have administrative clearance.
- Currently, there is no audit log recording who modified product pricing, deactivated categories, or edited company compliance details.

### Implementation Blueprint
1. **Audit Logs Table Migration (`006_audit_logs.sql`)**:
   ```sql
   CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
     id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
     actor_email text        NOT NULL,
     action      text        NOT NULL CHECK (action IN ('create', 'update', 'delete', 'status_change')),
     entity_type text        NOT NULL CHECK (entity_type IN ('product', 'category', 'company', 'inquiry')),
     entity_id   text        NOT NULL,
     changes     jsonb       DEFAULT '{}',
     created_at  timestamptz DEFAULT now()
   );

   ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "audit_logs_admin_read" ON public.admin_audit_logs
     FOR SELECT USING (public.is_admin());
   ```

2. **Trigger or Service-Level Logger**:
   - Log mutations automatically whenever `createProduct`, `updateProduct`, `deleteProduct`, or `updateCompanySettings` are executed.

---

## Implementation Roadmap & Priority Matrix

| Phase | Milestone | Focus Areas | Complexity | Estimated Effort |
| :---: | :--- | :--- | :---: | :---: |
| **Phase 2.1** | **Query & DB Scale** | Server-side pagination in `AdminProductTable` + Trigram search index | Medium | 1.5 - 2 hrs |
| **Phase 2.2** | **B2B Bulk Ops** | CSV Export & Import with pre-flight validation modal | Medium | 2 - 3 hrs |
| **Phase 2.3** | **Anti-Spam & Alerts** | Honeypot defense + Webhook notification dispatch on lead capture | Low-Med | 1.5 - 2 hrs |
| **Phase 2.4** | **Architecture Cleanup** | Split `productService.js` into domain modules + Audit logs | Medium | 2 hrs |

---

## Context Verification Checklist for Future Sprints

When picking up any milestone from this document:
- [ ] Ensure Supabase migration `005_admin_hardening.sql` is active in the database.
- [ ] Keep `is_admin()` as the primary RLS security anchor for all administrative queries.
- [ ] Confirm all image uploads pass through `ImageManager.jsx`'s 5MB and MIME validation.
- [ ] Verify that public catalog queries continue using `search_catalog_lite` for mobile payload optimization.
