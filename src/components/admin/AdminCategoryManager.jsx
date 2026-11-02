import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiSave, FiX } from 'react-icons/fi';
import ConfirmDialog from './ConfirmDialog';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../services/productService';

/**
 * Generate slug from category name.
 */
function generateCategorySlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * AdminCategoryManager — CRUD panel for product categories.
 */
export default function AdminCategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Add form state
  const [newCat, setNewCat] = useState({ id: '', name: '', image: '', sortOrder: 0 });
  // Edit form state
  const [editCat, setEditCat] = useState({ name: '', image: '', sortOrder: 0 });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Auto-generate slug from name
  const handleNewNameChange = (name) => {
    setNewCat(prev => ({ ...prev, name, id: generateCategorySlug(name) }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (!newCat.name.trim()) throw new Error('Category name is required.');
      if (!newCat.id.trim()) throw new Error('Category slug is required.');
      await createCategory(newCat);
      setShowAddForm(false);
      setNewCat({ id: '', name: '', image: '', sortOrder: 0 });
      await loadCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditCat({ name: cat.name, image: cat.image || '', sortOrder: cat.sortOrder || 0 });
    setError(null);
  };

  const handleUpdate = async () => {
    setError(null);
    setSaving(true);
    try {
      if (!editCat.name.trim()) throw new Error('Category name is required.');
      await updateCategory(editingId, editCat);
      setEditingId(null);
      await loadCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      await updateCategory(cat.id, { isActive: !cat.isActive });
      await loadCategories();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      await loadCategories();
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Cannot delete category: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wider">
            Category Management
          </h3>
          <p className="text-xs text-brand-gray-500">
            {categories.length} categories ({categories.filter(c => c.isActive).length} active)
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-red-600 hover:bg-brand-red-700 text-white text-xs font-bold rounded transition-colors cursor-pointer"
        >
          <FiPlus className="text-xs" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-800 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-4 space-y-3">
          <div className="text-xs font-bold text-brand-gray-900 uppercase tracking-wider">New Category</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-brand-gray-600 mb-1">Name *</label>
              <input
                type="text"
                value={newCat.name}
                onChange={(e) => handleNewNameChange(e.target.value)}
                placeholder="e.g. Anti Viral Medicines"
                className="w-full border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-brand-red-400"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-brand-gray-600 mb-1">Slug ID</label>
              <input
                type="text"
                value={newCat.id}
                onChange={(e) => setNewCat(prev => ({ ...prev, id: e.target.value }))}
                placeholder="auto-generated"
                className="w-full border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-brand-red-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-brand-gray-600 mb-1">Image URL</label>
              <input
                type="url"
                value={newCat.image}
                onChange={(e) => setNewCat(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://..."
                className="w-full border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-brand-red-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-brand-gray-600 mb-1">Sort Order</label>
              <input
                type="number"
                value={newCat.sortOrder}
                onChange={(e) => setNewCat(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                className="w-full border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-brand-red-400"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 border border-brand-gray-300 text-brand-gray-700 text-xs font-bold rounded cursor-pointer hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 bg-brand-red-600 hover:bg-brand-red-700 text-white text-xs font-bold rounded cursor-pointer disabled:opacity-50 transition-colors"
            >
              {saving ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      )}

      {/* Category List */}
      <div className="bg-white border border-brand-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-brand-gray-200 bg-brand-gray-50 text-brand-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3 w-12">#</th>
              <th className="py-2.5 px-3">Category Name</th>
              <th className="py-2.5 px-3 hidden sm:table-cell">Slug ID</th>
              <th className="py-2.5 px-3 text-center">Products</th>
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
            ) : categories.map((cat, index) => (
              <tr key={cat.id} className={`hover:bg-brand-gray-50 transition-colors ${!cat.isActive ? 'opacity-50' : ''}`}>
                <td className="py-2.5 px-3 text-brand-gray-400 font-mono text-[10px]">
                  {cat.sortOrder ?? index}
                </td>
                <td className="py-2.5 px-3">
                  {editingId === cat.id ? (
                    <input
                      type="text"
                      value={editCat.name}
                      onChange={(e) => setEditCat(prev => ({ ...prev, name: e.target.value }))}
                      className="border border-brand-red-300 rounded px-2 py-1 text-xs font-bold focus:outline-none w-full max-w-xs"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      {cat.image && (
                        <img src={cat.image} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                      )}
                      <span className="font-bold text-brand-gray-900">{cat.name}</span>
                    </div>
                  )}
                </td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-brand-gray-500 hidden sm:table-cell">
                  {cat.id}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className={`font-mono font-bold text-xs ${cat.productCount > 0 ? 'text-brand-gray-900' : 'text-brand-gray-300'}`}>
                    {cat.productCount ?? 0}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center">
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className="cursor-pointer"
                  >
                    {cat.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <FiToggleRight className="text-sm" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-gray-500 bg-brand-gray-100 px-2 py-0.5 rounded">
                        <FiToggleLeft className="text-sm" /> Hidden
                      </span>
                    )}
                  </button>
                </td>
                <td className="py-2.5 px-3 text-center">
                  {editingId === cat.id ? (
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer disabled:opacity-50"
                        title="Save"
                      >
                        <FiSave className="text-xs" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 text-brand-gray-500 hover:bg-brand-gray-100 rounded cursor-pointer"
                        title="Cancel"
                      >
                        <FiX className="text-xs" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1.5 text-brand-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                        title="Edit"
                      >
                        <FiEdit2 className="text-xs" />
                      </button>
                      <button
                        onClick={() => {
                          if (cat.productCount > 0) {
                            setError(`Cannot delete "${cat.name}" — it has ${cat.productCount} products assigned. Reassign or remove them first.`);
                          } else {
                            setDeleteTarget(cat);
                          }
                        }}
                        className="p-1.5 text-brand-gray-500 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                        title="Delete"
                      >
                        <FiTrash2 className="text-xs" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to deactivate "${deleteTarget?.name}"? It can be reactivated later.`}
        confirmLabel="Deactivate"
        confirmStyle="danger"
        loading={isDeleting}
      />
    </div>
  );
}
