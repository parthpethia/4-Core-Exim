# Chunk 4: Admin Product Management (Form + Table)

> **Status:** 🔲 TODO
> **Files to create:** `AdminProductForm.jsx`, `AdminProductTable.jsx`
> **Dependencies:** Chunk 2 (service layer), Chunk 3 (shared components)

---

## Task: AdminProductForm.jsx

**Path:** `src/components/admin/AdminProductForm.jsx`

A modal form for creating and editing products with ALL 18 data fields.

### Fields to include (matching the DB schema):

| Field | Input Type | Required | Notes |
|-------|-----------|----------|-------|
| `id` | Text (slug) | Yes (create only) | Auto-generate from name, disabled on edit |
| `name` | Text | Yes | Full product name |
| `category` | Select dropdown | Yes | Populated from `getAllCategories()` |
| `brand` | Text | No | Brand name |
| `manufacturer` | Text | No | Manufacturing company |
| `marketer` | Text | No | Default: "Thakkar Medico Traders" |
| `price` | Number | No | Indicative export unit price |
| `currency` | Select | No | USD, EUR, GBP — default USD |
| `strength` | Text | No | e.g., "300mg", "5% w/v" |
| `packagingSize` | Text | No | e.g., "10x10 Capsules" |
| `packagingType` | Text | No | e.g., "Blister Box" |
| `saltComposition` | Textarea | No | Active ingredient / API |
| `countryOfOrigin` | Text | No | Default: "India" |
| `minimumOrderQuantity` | Text | No | e.g., "50 Boxes" |
| `storage` | Text | No | Storage instructions |
| `treatment` | Text | No | Therapeutic use / indication |
| `description` | Textarea | No | Product description paragraph |
| `images` | **ImageManager** component | No | Array of URLs |
| `specifications` | **SpecificationsEditor** component | No | Dynamic key-value pairs |

### Props:
```js
{
  isOpen: boolean,
  onClose: () => void,
  onSave: (product) => void,    // Called after successful create/update
  product: Object | null,        // null = create mode, object = edit mode
  categories: Array              // For the category dropdown
}
```

### Behavior:
- **Create mode** (`product` is null): Empty form, auto-generates slug ID from name
- **Edit mode** (`product` is object): Pre-populated, ID field disabled
- Calls `createProduct()` or `updateProduct()` from service layer
- Shows loading state during save
- Shows error message on failure
- Calls `onSave` callback on success so parent refreshes the list

### Auto-slug generation:
```js
const generateSlug = (name) => {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};
```

### Form layout:
- Use 2-column grid for short fields (strength + packagingSize, price + currency)
- Full-width for name, description, saltComposition
- ImageManager and SpecificationsEditor at the bottom
- Sticky footer with Save/Cancel buttons

---

## Task: AdminProductTable.jsx

**Path:** `src/components/admin/AdminProductTable.jsx`

Searchable, paginated product management table for the admin dashboard.

### Props:
```js
{
  onEditProduct: (product) => void,    // Opens edit form
  refreshKey: number                    // Increment to trigger data refetch
}
```

### Features:
1. **Search bar** — filters by name, brand, salt composition
2. **Category filter** — dropdown to filter by category
3. **Table columns:** Name, Brand, Category, Price, Status (active/inactive), Actions
4. **Actions per row:**
   - Edit (opens AdminProductForm in edit mode)
   - Toggle Active/Inactive
   - Delete (opens ConfirmDialog)
5. **Pagination** — show 15 products per page (client-side for now)
6. **Product count** — "Showing X of Y products"
7. **Add Product button** — triggers parent to open create form

### Service functions used:
```js
import {
  getAdminProducts,
  getAllCategories,
  toggleProductActive,
  deleteProduct
} from '../../services/productService';
```

### State:
```js
const [products, setProducts] = useState([]);
const [categories, setCategories] = useState([]);
const [search, setSearch] = useState('');
const [categoryFilter, setCategoryFilter] = useState('all');
const [currentPage, setCurrentPage] = useState(1);
const [loading, setLoading] = useState(true);
const [deleteTarget, setDeleteTarget] = useState(null);  // for ConfirmDialog
```

---

## Implementation Notes

- Both components use the existing TailwindCSS design system (brand-gray-*, brand-red-*)
- Form inputs match the style used in `ProductCard.jsx` inquiry modal
- The table matches the style of the existing product table in `AdminDashboard.jsx`
- Import from `../../services/productService` (relative path from admin/ folder)
