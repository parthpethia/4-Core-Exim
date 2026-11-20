import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiPlus, FiChevronLeft, FiChevronRight, FiDownload, FiUpload } from 'react-icons/fi';
import ConfirmDialog from './ConfirmDialog';
import BulkProductImportModal, { exportProductsToCsv } from './BulkProductImportModal';
import { getAdminProductsPaginated, getAllCategories, toggleProductActive, deleteProduct } from '../../services/adminService';

const PAGE_SIZE = 20;

/**
 * AdminProductTable — Server-side paginated, searchable product management table.
 * @param {Object} props
 * @param {Function} props.onEditProduct - Called with product object to open edit form
 * @param {Function} props.onAddProduct - Called to open create form
 * @param {number} props.refreshKey - Increment to trigger data refetch
 */
export default function AdminProductTable({ onEditProduct, onAddProduct, refreshKey = 0 }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch data — server-side paginated
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [result, cats] = await Promise.all([
          getAdminProductsPaginated({
            page: currentPage,
            pageSize: PAGE_SIZE,
            category: categoryFilter,
            search,
            status: statusFilter
          }),
          getAllCategories()
        ]);
        setProducts(result.products);
        setTotalCount(result.totalCount);
        setTotalPages(result.totalPages);
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load admin products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [refreshKey, categoryFilter, search, statusFilter, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, statusFilter]);

  // Category name lookup
  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : catId;
  };

  // Toggle active/inactive
  const handleToggleActive = async (product) => {
    setActionLoading(product.id);
    try {
      const updated = await toggleProductActive(product.id, !product.isActive);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: updated.isActive } : p));
    } catch (err) {
      console.error('Toggle failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      setProducts(prev => prev.map(p => p.id === deleteTarget.id ? { ...p, isActive: false } : p));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Import complete handler
  const handleImportComplete = () => {
    setShowImportModal(false);
    setCurrentPage(1);
    // Force a re-fetch by toggling a filter or just let refreshKey handle it
    setProducts([]);
    setLoading(true);
  };

  return (
    <div className="space-y-4">

      {/* Toolbar: Search + Filters + Bulk Ops + Add */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 w-full sm:w-auto flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-1.5 border border-brand-gray-300 rounded px-2.5 py-1.5 bg-white flex-1 max-w-xs">
            <FiSearch className="text-brand-gray-400 text-xs shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, brand, salt..."
              className="flex-1 text-xs text-brand-gray-900 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs text-brand-gray-700 bg-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs text-brand-gray-700 bg-white focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Export CSV */}
          <button
            onClick={() => exportProductsToCsv(products, categories)}
            className="flex items-center gap-1.5 px-3 py-2 border border-brand-gray-300 hover:bg-brand-gray-50 text-brand-gray-700 text-xs font-bold rounded transition-colors cursor-pointer"
            title="Export current page as CSV"
          >
            <FiDownload className="text-xs" />
            <span>Export</span>
          </button>

          {/* Import CSV */}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-brand-gray-300 hover:bg-brand-gray-50 text-brand-gray-700 text-xs font-bold rounded transition-colors cursor-pointer"
            title="Bulk import products from CSV"
          >
            <FiUpload className="text-xs" />
            <span>Import</span>
          </button>

          {/* Add Product */}
          <button
            onClick={onAddProduct}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-green-600 hover:bg-brand-green-700 text-white text-xs font-bold rounded transition-colors cursor-pointer shadow-sm"
          >
            <FiPlus className="text-xs" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white border border-brand-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-gray-200 bg-brand-gray-50 text-brand-gray-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3 hidden md:table-cell">Brand</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 hidden sm:table-cell">Price</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-3 px-3">
                      <div className="h-4 bg-brand-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-3 text-center text-brand-gray-400 text-xs">
                    No products found matching your filters.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className={`hover:bg-brand-gray-50 transition-colors ${!p.isActive ? 'opacity-50' : ''}`}>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-brand-gray-900 line-clamp-1">{p.name}</div>
                      <div className="text-[10px] text-brand-gray-400 font-mono mt-0.5">{p.id}</div>
                    </td>
                    <td className="py-2.5 px-3 text-brand-gray-700 hidden md:table-cell">
                      {p.brand || '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold text-brand-green-700 bg-brand-green-50 border border-brand-green-200 px-1.5 py-0.5 rounded uppercase">
                        {getCategoryName(p.category)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-brand-gray-800 hidden sm:table-cell">
                      {p.currency} {p.price || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleToggleActive(p)}
                        disabled={actionLoading === p.id}
                        className="cursor-pointer disabled:opacity-50"
                        title={p.isActive ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {p.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <FiToggleRight className="text-sm" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-gray-500 bg-brand-gray-100 px-2 py-0.5 rounded">
                            <FiToggleLeft className="text-sm" /> Inactive
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditProduct(p)}
                          className="p-1.5 text-brand-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <FiEdit2 className="text-xs" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 text-brand-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-brand-gray-200 bg-brand-gray-50 px-4 py-2.5 flex items-center justify-between text-xs text-brand-gray-500">
          <span>
            {totalCount > 0 ? (
              <>
                Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, totalCount)} of <strong className="text-brand-gray-900">{totalCount}</strong> products
              </>
            ) : (
              'No products'
            )}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded hover:bg-brand-gray-200 disabled:opacity-30 cursor-pointer disabled:cursor-default transition-colors"
              >
                <FiChevronLeft className="text-xs" />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let page;
                if (totalPages <= 7) {
                  page = i + 1;
                } else if (currentPage <= 4) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  page = totalPages - 6 + i;
                } else {
                  page = currentPage - 3 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                      currentPage === page
                        ? 'bg-brand-green-600 text-white shadow-xs'
                        : 'hover:bg-brand-gray-200 text-brand-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded hover:bg-brand-gray-200 disabled:opacity-30 cursor-pointer disabled:cursor-default transition-colors"
              >
                <FiChevronRight className="text-xs" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Deactivate Product"
        message={`This will deactivate "${deleteTarget?.name}" from the public catalog. The product data is preserved and can be reactivated later.`}
        confirmLabel="Deactivate"
        confirmStyle="danger"
        loading={isDeleting}
      />

      {/* Bulk Import Modal */}
      <BulkProductImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onComplete={handleImportComplete}
        categories={categories}
      />
    </div>
  );
}
