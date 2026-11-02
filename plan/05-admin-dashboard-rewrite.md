# Chunk 5: Admin Dashboard Full Rewrite

> **Status:** 🔲 TODO
> **File to modify:** `src/pages/AdminDashboard.jsx` (complete rewrite)
> **Files to create:** `AdminCategoryManager.jsx`, `AdminCompanySettings.jsx`, `AdminInquiries.jsx`
> **Dependencies:** Chunks 2, 3, 4 (service layer + all admin components)

---

## Current State of AdminDashboard.jsx

The existing file (`src/pages/AdminDashboard.jsx`, 279 lines) is a **read-only** dashboard that:
- Shows product count, category count, pharmacopeia breakdown
- Displays a truncated product table (8 rows, no actions)
- Shows OAuth config status and admin email whitelist
- Has no CRUD capability

**It must be completely rewritten** to be a tabbed admin console.

---

## Target: Tabbed Admin Dashboard

### Tab Navigation

```
[ Overview ] [ Products ] [ Categories ] [ Company ] [ Inquiries ]
```

### Tab 1: Overview (default)
**Reuse** most of the existing dashboard content but enhanced:
- Product count, category count, inquiry count (new)
- Pharmacopeia breakdown (IP/BP/USP)
- Recent 5 inquiries feed (new)
- Quick-action buttons: "Add Product", "View Public Catalog"
- Supabase connection status

### Tab 2: Products
Renders `<AdminProductTable />` from Chunk 4, plus a floating "Add Product" button that opens `<AdminProductForm />`.

```jsx
<AdminProductTable
  onEditProduct={(p) => { setEditingProduct(p); setShowProductForm(true); }}
  refreshKey={refreshKey}
/>
<AdminProductForm
  isOpen={showProductForm}
  onClose={() => { setShowProductForm(false); setEditingProduct(null); }}
  onSave={() => { setRefreshKey(k => k+1); setShowProductForm(false); }}
  product={editingProduct}
  categories={categories}
/>
```

### Tab 3: Categories
Renders `<AdminCategoryManager />` (details below).

### Tab 4: Company
Renders `<AdminCompanySettings />` (details below).

### Tab 5: Inquiries
Renders `<AdminInquiries />` (details below).

---

## AdminCategoryManager.jsx

**Path:** `src/components/admin/AdminCategoryManager.jsx`

### Features:
- List all categories with product count per category
- Sort order display
- Add new category (name, slug auto-generated, image URL, sort_order)
- Edit category inline or via modal
- Delete category (only if product count = 0, otherwise show warning)
- Toggle active/inactive

### Service functions used:
```js
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../services/productService';
```

### Category form fields:
| Field | Type | Notes |
|-------|------|-------|
| `id` | Text (slug) | Auto-generated from name, readonly on edit |
| `name` | Text | Required |
| `image` | URL input | Category thumbnail |
| `sortOrder` | Number | Display order |

---

## AdminCompanySettings.jsx

**Path:** `src/components/admin/AdminCompanySettings.jsx`

### Features:
- Single form to edit all company info fields
- Preview of current values alongside edit inputs
- Save button with loading state
- Success/error feedback

### Fields:
| Field | Input Type |
|-------|-----------|
| `name` | Text |
| `subtitle` | Text |
| `email` | Email |
| `phone` | Tel |
| `whatsapp` | Tel |
| `address` | Textarea |
| `businessHours` | Text |
| `googleMapsEmbedUrl` | URL |
| `aboutShort` | Textarea |
| `aboutFull.intro` | Textarea |
| `aboutFull.sourcing` | Textarea |
| `aboutFull.supplyChain` | Textarea |
| `aboutFull.compliance` | Textarea |

### Service functions:
```js
import { getCompanyInfo, updateCompanySettings } from '../../services/productService';
```

---

## AdminInquiries.jsx

**Path:** `src/components/admin/AdminInquiries.jsx`

### Features:
- Table of all B2B inquiries sorted by most recent
- Columns: Date, Product, Business Name, Phone, Incoterm, Destination, Status
- Status filter tabs: All | New | Contacted | Quoted | Closed
- Click a row to update status (dropdown or inline select)
- Status color badges:
  - `new` = blue
  - `contacted` = amber
  - `quoted` = purple
  - `closed` = green
- Inquiry count badge in the tab header
- Notes field (editable per inquiry)

### Service functions:
```js
import { getInquiries, updateInquiryStatus } from '../../services/productService';
```

---

## AdminDashboard.jsx Rewrite Structure

```jsx
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [categories, setCategories] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Tab definitions
  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart2 },
    { id: 'products', label: 'Products', icon: FiPackage },
    { id: 'categories', label: 'Categories', icon: FiLayers },
    { id: 'company', label: 'Company', icon: FiSettings },
    { id: 'inquiries', label: 'Inquiries', icon: FiInbox },
  ];

  return (
    <div>
      {/* Header Banner (keep existing) */}
      {/* Tab Navigation */}
      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewContent />}
      {activeTab === 'products' && <ProductsTab />}
      {activeTab === 'categories' && <AdminCategoryManager />}
      {activeTab === 'company' && <AdminCompanySettings />}
      {activeTab === 'inquiries' && <AdminInquiries />}
    </div>
  );
}
```

---

## Styling Notes

- Tab nav: horizontal pill buttons with active state (brand-red-600 bg)
- Match the existing design language (brand-gray-*, brand-red-*, uppercase labels)
- All tables use the existing table styling from the current AdminDashboard
- Toast/notification for save success (simple div, not a library)
