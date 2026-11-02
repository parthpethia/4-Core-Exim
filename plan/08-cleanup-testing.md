# Chunk 8: Cleanup & Testing

> **Status:** 🔲 TODO
> **Dependencies:** ALL previous chunks must be complete and verified

---

## Pre-Cleanup Verification Checklist

Before deleting any files, verify everything works end-to-end:

### Public Pages
- [ ] **Home page** loads — categories grid shows, products render, company info displays
- [ ] **Catalog page** loads — all 102 products appear
- [ ] **Search** works — search by name, brand, salt composition
- [ ] **Category filter** works — sidebar categories show correct product counts
- [ ] **Pharmacopeia filter** works — IP/BP/USP toggle
- [ ] **Product cards** render correctly — all 18 fields display
- [ ] **CoA Modal** opens and shows product data
- [ ] **Inquiry form** submits — data appears in Supabase `inquiries` table
- [ ] **Footer** shows company info (phone, email, address)
- [ ] **Header** shows company contact info

### Admin Dashboard
- [ ] **Login** as admin email → redirected to `/admin`
- [ ] **Overview tab** shows correct product/category/inquiry counts
- [ ] **Products tab** — table loads, search works, pagination works
- [ ] **Add Product** — form opens, all fields present, save creates product in DB
- [ ] **Edit Product** — form pre-populates, save updates product
- [ ] **Delete Product** — confirm dialog, product becomes inactive
- [ ] **Toggle Active** — works per product row
- [ ] **Categories tab** — list loads, add/edit/delete work
- [ ] **Company tab** — form loads current values, save updates
- [ ] **Inquiries tab** — shows submitted inquiries, status filter works
- [ ] **Status update** — changing inquiry status saves to DB

### Auth Flow
- [ ] **Non-admin login** → redirected to `/dashboard` (not `/admin`)
- [ ] **Admin login** → redirected to `/admin`
- [ ] **Protected route** blocks non-admin from `/admin`
- [ ] **Sign out** works from both dashboards

---

## Cleanup Tasks

### Task 8.1: Delete Static JSON Files

Once all verification passes:

```bash
# These files are now fully replaced by Supabase data
del src\data\products.json
del src\data\categories.json
del src\data\company.json
rmdir src\data
```

> ⚠️ The service layer (`productService.js`) still imports these as fallbacks. After deletion, the fallback imports will cause build errors. You have two options:
>
> **Option A (recommended):** Keep the JSON files but empty them — `[]` for arrays, `{}` for objects
> **Option B:** Remove the fallback code from `productService.js` entirely (only works if Supabase is always available)

### Task 8.2: Remove Fallback Imports (Option B)

In `src/services/productService.js`, remove:
```js
import companyDataFallback from '../data/company.json';
import categoriesDataFallback from '../data/categories.json';
import productsDataFallback from '../data/products.json';
```

And remove all `if (!isSupabaseConfigured)` fallback branches — just let the Supabase queries handle everything.

### Task 8.3: Clean Up Unused Files

```bash
# The scraped raw data files (if no longer needed)
del tablets.txt
del search_results.html
```

### Task 8.4: Update .gitignore

Add to `.gitignore`:
```
# Supabase service role key (never commit)
.env.local
```

### Task 8.5: Build Test

```bash
npm run build
```

Verify no import errors or build warnings related to deleted files.

---

## Regression Test Commands

```bash
# Start dev server
npm run dev

# Test pages manually:
# http://localhost:5173/           ← Home
# http://localhost:5173/catalog    ← Catalog (should show 102 products)
# http://localhost:5173/about      ← About
# http://localhost:5173/login      ← Login
# http://localhost:5173/admin      ← Admin (after login)
```

---

## Post-Migration Improvements (Future)

These are not part of the current migration but would be good next steps:

1. **Server-side pagination** — `getProducts()` with `range()` for large catalogs
2. **Full-text search** — Use Postgres `tsvector` indexes instead of `ilike`
3. **Image optimization** — Resize/compress images on upload via Edge Function
4. **CSV export** — Export inquiries table as CSV from admin dashboard
5. **Audit log** — Track who added/edited/deleted products
6. **Bulk import** — CSV upload to add multiple products at once
7. **Product ordering** — Custom sort order within categories
8. **Real-time updates** — Supabase realtime subscription for inquiry notifications
