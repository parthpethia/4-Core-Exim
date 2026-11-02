# 4Core Exim — Migration Master Index

> **What:** Migrate hardcoded JSON data → Supabase database + build Admin CRUD dashboard
> **Stack:** React 19 + Vite 8 + TailwindCSS 4 + Supabase (already connected for auth)

---

## Progress Tracker

| # | Chunk | Status | Plan File |
|---|-------|--------|-----------|
| 1 | Database Schema & Seed Script | ✅ DONE | [01-database-setup.md](./01-database-setup.md) |
| 2 | Service Layer Rewrite (JSON → Supabase) | ✅ DONE | [02-service-layer.md](./02-service-layer.md) |
| 3 | Admin Reusable Components | ✅ DONE | [03-admin-shared-components.md](./03-admin-shared-components.md) |
| 4 | Admin Product Form & Table | ✅ DONE | [04-admin-product-management.md](./04-admin-product-management.md) |
| 5 | Admin Dashboard Full Rewrite | ✅ DONE | [05-admin-dashboard-rewrite.md](./05-admin-dashboard-rewrite.md) |
| 6 | Frontend Component Updates | ✅ DONE | [06-frontend-updates.md](./06-frontend-updates.md) |
| 7 | Supabase RLS, Storage & Deployment | 🔲 TODO (manual) | [07-supabase-setup.md](./07-supabase-setup.md) |
| 8 | Cleanup & Testing | 🔲 TODO (after DB live) | [08-cleanup-testing.md](./08-cleanup-testing.md) |

---

## File Inventory (Created So Far)

### New Files Created
```
supabase/migrations/001_create_tables.sql    ← DB schema (4 tables, RLS, triggers)
scripts/seed-database.js                      ← One-time data migration (102 products)
src/services/productService.js                ← REWRITTEN — Supabase queries + CRUD
src/components/admin/ConfirmDialog.jsx        ← Reusable confirm modal
src/components/admin/SpecificationsEditor.jsx ← Dynamic key-value spec editor
src/components/admin/ImageManager.jsx         ← Image URL + upload manager
```

### Files Still To Create
```
src/components/admin/AdminProductForm.jsx     ← Add/Edit product (18 fields + specs)
src/components/admin/AdminProductTable.jsx    ← Searchable product table with actions
src/components/admin/AdminCategoryManager.jsx ← Category CRUD panel
src/components/admin/AdminCompanySettings.jsx ← Company info edit form
src/components/admin/AdminInquiries.jsx       ← Inquiry/lead management
```

### Files To Modify
```
src/pages/AdminDashboard.jsx                  ← Full rewrite: read-only → tabbed CRUD
src/components/ProductCard.jsx                ← Wire inquiry to DB, remove JSON import
src/components/Footer.jsx                     ← Remove direct JSON import
src/components/Header.jsx                     ← Remove direct JSON import
src/pages/Dashboard.jsx                       ← Remove direct JSON import
```

### Files To Delete (after migration confirmed)
```
src/data/products.json                        ← 102 products → now in Supabase
src/data/categories.json                      ← 23 categories → now in Supabase
src/data/company.json                         ← Company data → now in Supabase
```

---

## Key Architecture Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Specs storage | `jsonb` column | 28+ unique varying keys per product |
| Images | `text[]` + Supabase Storage | Simple array, upload support |
| Product IDs | Keep slug-style `text` | URL-compatible, human-readable |
| Soft delete | `is_active` boolean | Pharma data recovery |
| Column naming | snake_case DB ↔ camelCase JS | Service layer handles mapping |
| Admin auth | Email whitelist (existing) | Works well for small team |
| Fallback | JSON imports if Supabase down | Graceful degradation |

---

## Data Summary

- **102 products** across 14 active categories (23 total categories)
- **18 data fields** per product + flexible `specifications` JSONB
- **28+ unique specification keys** across products
- Product images: 1–3 per product (external URLs, some from imimg.com)
- Company: 1 singleton record with nested `aboutFull` object
