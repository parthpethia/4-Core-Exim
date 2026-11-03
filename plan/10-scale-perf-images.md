# Chunk 10: Scale, lean payloads & fast images

> **Status:** ✅ CODE DONE — apply `003_scale_perf_images.sql` in Supabase

## Problems fixed
- Catalog pulled full rows (`description`, `specifications`, all `images[]`) for every product
- No pagination (default up to 200)
- Images loaded at original remote size with no CDN transform
- Categories/FX/countries refetched on every filter change

## What shipped

### DB (`supabase/migrations/003_scale_perf_images.sql`)
- `thumbnail_url` + `image_count` + sync trigger
- Covering index `idx_products_list_cover`
- RPC `search_catalog_lite` — list payload only (max 100/page)
- RPC `get_product_detail` — full row on demand
- Cap full `search_catalog` page size at 100

### App
- `getProducts({ lean: true })` default → lite RPC
- Catalog pages of **24** with **Load more**
- Cards hydrate full detail when scrolled into view
- `OptimizedImage` + Unsplash/Supabase resize helpers
- TTL cache for categories / countries / FX

## Deploy
1. Run `003_scale_perf_images.sql` in Supabase SQL Editor
2. Smoke test:
```sql
select id, name, thumbnail_url, image_count from search_catalog_lite(null, null, 'AE', null, null, 5, 0);
select name, cardinality(images) from get_product_detail('pregabalin-300', 'AE');
```
