# Chunk 2: Service Layer Rewrite

> **Status:** ✅ DONE
> **File modified:** `src/services/productService.js` (complete rewrite)

---

## What Was Done

Rewrote `src/services/productService.js` from importing static JSON files to making real Supabase queries. The rewrite preserves the **same function signatures** so existing component calls don't break.

### Key Design: Graceful Fallback

Every public read function has this pattern:
```js
export const getProducts = async (filters = {}) => {
  if (!isSupabaseConfigured) {
    // Use static JSON import as fallback
    return [...productsDataFallback];
  }
  try {
    const { data, error } = await supabase.from('products')...
    return data.map(productRowToFrontend);
  } catch (err) {
    console.warn('Failed, using fallback:', err.message);
    return [...productsDataFallback];
  }
};
```

This means the site **works without any database** in dev mode — it just uses the JSON files.

### Functions Available

#### Public Read (unchanged API — called by Catalog, Home, etc.)
| Function | What it does |
|----------|-------------|
| `getCompanyInfo()` | Returns company object (camelCase) |
| `getCategories()` | Returns categories with `productCount` |
| `getProducts(filters)` | Returns filtered products (by category, search text) |
| `getProductById(id)` | Returns single product or null |

#### Admin Read (new)
| Function | What it does |
|----------|-------------|
| `getAllCategories()` | Includes inactive categories |
| `getAdminProducts(filters)` | Includes inactive products, ordered by created_at DESC |

#### Admin Write (new — all throw on error)
| Function | What it does |
|----------|-------------|
| `createProduct(data)` | INSERT, returns created product |
| `updateProduct(id, data)` | UPDATE, returns updated product |
| `deleteProduct(id)` | Soft-delete (is_active = false) |
| `hardDeleteProduct(id)` | Permanent DELETE |
| `toggleProductActive(id, bool)` | Toggle is_active |
| `createCategory(data)` | INSERT category |
| `updateCategory(id, data)` | UPDATE category |
| `deleteCategory(id)` | Soft-delete category |
| `updateCompanySettings(data)` | UPDATE singleton company row |

#### Inquiries (new)
| Function | What it does |
|----------|-------------|
| `submitInquiry(data)` | Public INSERT (anyone can submit) |
| `getInquiries(filters)` | Admin SELECT (filter by status) |
| `updateInquiryStatus(id, updates)` | Admin UPDATE status/notes |

#### Storage (new)
| Function | What it does |
|----------|-------------|
| `uploadProductImage(file, productId)` | Upload to Supabase Storage, returns public URL |
| `deleteProductImage(imageUrl)` | Delete from Storage (only if it's our bucket URL) |

### Column Mapping (snake_case ↔ camelCase)

Two helper functions handle conversion so components always work with camelCase:
- `productRowToFrontend(row)` — DB row → component props
- `productFrontendToRow(product)` — form data → DB row

Key mappings:
```
DB (snake_case)          → Frontend (camelCase)
category_id              → category
packaging_size           → packagingSize
packaging_type           → packagingType
salt_composition         → saltComposition
country_of_origin        → countryOfOrigin
minimum_order_quantity   → minimumOrderQuantity
is_active                → isActive
```

### Impact on Existing Components

**Zero changes needed** for these (they already call async service functions):
- `Catalog.jsx` — calls `getProducts()`, `getCategories()`, `getCompanyInfo()` ✅
- `Home.jsx` — calls `getCategories()`, `getCompanyInfo()`, `getProducts()` ✅
- `AdminDashboard.jsx` — calls `getProducts()`, `getCategories()` ✅

**Changes still needed** (these import JSON directly — see Chunk 6):
- `Footer.jsx` — `import companyData from '../data/company.json'`
- `Header.jsx` — `import companyData from '../data/company.json'`
- `Dashboard.jsx` — `import companyData from '../data/company.json'`
- `ProductCard.jsx` — `import companyData from '../data/company.json'`
