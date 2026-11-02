import React, { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ConfirmDialog from './ConfirmDialog';
import { getAdminProducts, getAllCategories, toggleProductActive, deleteProduct } from '../../services/productService';

const PAGE_SIZE = 15;

/**
 * AdminProductTable — Searchable, paginated product management table.
 * @param {Object} props
 * @param {Function} props.onEditProduct - Called with product object to open edit form
 * @param {Function} props.onAddProduct - Called to open create form
 * @param {number} props.refreshKey - Increment to trigger data refetch
 */
export default function AdminProductTable({ onEditProduct, onAddProduct, refreshKey = 0 }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // product ID being toggled

  // Fetch data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          getAdminProducts({ category: categoryFilter, search }),
          getAllCategories()
        ]);
        setProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load admin products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [refreshKey, categoryFilter, search]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  // Pagination
  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return products.slice(start, start + PAGE_SIZE);
  }, [products, currentPage]);

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

  return (
    <div className="space-y-4">

      {/* Toolbar: Search + Filter + Add */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="flex items-center gap-1.5 border border-brand-gray-300 rounded px-2.5 py-1.5 bg-white flex-1 max-w-xs">
            <FiSearch className="text-brand-gray-400 text-xs shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
        </div>

        {/* Add Product */}
        <button
          onClick={onAddProduct}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-red-600 hover:bg-brand-red-700 text-white text-xs font-bold rounded transition-colors cursor-pointer shrink-0"
        >
          <FiPlus className="text-xs" />
          <span>Add Product</span>
        </button>
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
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-3 text-center text-brand-gray-400 text-xs">
                    No products found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
                  <tr key={p.id} className={`hover:bg-brand-gray-50 transition-colors ${!p.isActive ? 'opacity-50' : ''}`}>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-brand-gray-900 line-clamp-1">{p.name}</div>
                      <div className="text-[10px] text-brand-gray-400 font-mono mt-0.5">{p.id}</div>
                    </td>
                    <td className="py-2.5 px-3 text-brand-gray-700 hidden md:table-cell">
                      {p.brand || '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold text-brand-red-700 bg-brand-red-50 px-1.5 py-0.5 rounded uppercase">
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
            Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, products.length)} of <strong className="text-brand-gray-900">{products.length}</strong> products
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
                        ? 'bg-brand-red-600 text-white'
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
    </div>
  );
}
