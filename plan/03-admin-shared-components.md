# Chunk 3: Admin Shared Components

> **Status:** ✅ DONE
> **Files created:** 3 reusable components in `src/components/admin/`

---

## Components Created

### 1. `ConfirmDialog.jsx`
**Path:** `src/components/admin/ConfirmDialog.jsx`

Reusable modal for delete confirmations and destructive actions.

**Props:**
```js
{
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void,
  title: string,
  message: string,
  confirmLabel: string,    // default 'Confirm'
  confirmStyle: string,    // 'danger' | 'primary'
  loading: boolean         // disables buttons during async ops
}
```

**Usage:**
```jsx
<ConfirmDialog
  isOpen={showDeleteConfirm}
  onClose={() => setShowDeleteConfirm(false)}
  onConfirm={handleDelete}
  title="Delete Product"
  message="This will deactivate the product from the catalog."
  confirmLabel="Delete Product"
  confirmStyle="danger"
  loading={isDeleting}
/>
```

---

### 2. `SpecificationsEditor.jsx`
**Path:** `src/components/admin/SpecificationsEditor.jsx`

Dynamic key-value pair editor for the JSONB `specifications` field.

**Props:**
```js
{
  specifications: Object,    // { "Form": "Tablet", "Shelf Life": "36 Months" }
  onChange: (newSpecs) => void
}
```

**Features:**
- Add/remove specification rows
- Edit keys and values inline
- `<datalist>` with 19 common pharma spec key suggestions (Form, Shelf Life, Side Effects, etc.)
- Handles key renaming (creates new key, deletes old)

---

### 3. `ImageManager.jsx`
**Path:** `src/components/admin/ImageManager.jsx`

Image management for products — supports both URL input and file upload.

**Props:**
```js
{
  images: string[],         // Current image URLs array
  onChange: (newImages) => void,
  productId: string         // Optional, for storage path organization
}
```

**Features:**
- Grid preview of current images with hover-to-delete
- Add image by pasting external URL
- Upload image file to Supabase Storage (`product-images` bucket)
- Upload error handling with user-visible error messages
- Calls `uploadProductImage()` from `productService.js`

---

## Remaining Admin Components (Chunk 4 & 5)

These components will USE the shared components above:

| Component | Uses | Status |
|-----------|------|--------|
| `AdminProductForm.jsx` | SpecificationsEditor, ImageManager | 🔲 TODO (Chunk 4) |
| `AdminProductTable.jsx` | ConfirmDialog | 🔲 TODO (Chunk 4) |
| `AdminCategoryManager.jsx` | ConfirmDialog | 🔲 TODO (Chunk 5) |
| `AdminCompanySettings.jsx` | — | 🔲 TODO (Chunk 5) |
| `AdminInquiries.jsx` | — | 🔲 TODO (Chunk 5) |
