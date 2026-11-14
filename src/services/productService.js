// =============================================================================
// productService.js — Backward-compatible barrel re-export
// =============================================================================
// All functions have been modularized into focused domain services.
// This file re-exports everything so existing imports across the codebase
// continue working without changes.
//
// New code should import from the specific service module directly:
//   import { getProducts } from './catalogService';
//   import { createProduct } from './adminService';
//   import { submitInquiry } from './inquiryService';
// =============================================================================

// Public catalog queries
export {
  getCompanyInfo,
  getCategories,
  getProducts,
  getProductById,
  getCountries,
  CATALOG_PAGE_SIZE
} from './catalogService';

// FX rates
export { getFxRateMap } from './fxService';

// Admin CRUD & management
export {
  invalidateCatalogCache,
  getAdminProducts,
  getAllCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  hardDeleteProduct,
  toggleProductActive,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCompanySettings,
  mapSupabaseError,
  logAuditEvent,
  getAdminProductsPaginated
} from './adminService';

// B2B inquiry management
export {
  submitInquiry,
  getInquiries,
  updateInquiryStatus,
  getCountryInterestSummary
} from './inquiryService';

// Image storage
export {
  uploadProductImage,
  deleteProductImage
} from './storageService';
