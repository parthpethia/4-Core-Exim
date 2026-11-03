import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getProducts, getCategories, getInquiries, getAllCategories } from '../services/productService';
import AdminProductTable from '../components/admin/AdminProductTable';
import AdminProductForm from '../components/admin/AdminProductForm';
import AdminCategoryManager from '../components/admin/AdminCategoryManager';
import AdminCompanySettings from '../components/admin/AdminCompanySettings';
import AdminInquiries from '../components/admin/AdminInquiries';
import {
  FiShield,
  FiPackage,
  FiLayers,
  FiFileText,
  FiCheckCircle,
  FiLogOut,
  FiExternalLink,
  FiSettings,
  FiInbox,
  FiBarChart2,
  FiPlus
} from 'react-icons/fi';

const TABS = [
  { id: 'overview', label: 'Overview', icon: FiBarChart2 },
  { id: 'products', label: 'Products', icon: FiPackage },
  { id: 'categories', label: 'Categories', icon: FiLayers },
  { id: 'company', label: 'Company', icon: FiSettings },
  { id: 'inquiries', label: 'Inquiries', icon: FiInbox },
];

export default function AdminDashboard() {
  const { user, signOut, isSupabaseConfigured } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Overview data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productRefreshKey, setProductRefreshKey] = useState(0);

  // All categories for the product form dropdown
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodList, catList] = await Promise.all([
          getProducts({ lean: false, limit: 500 }),
          getCategories()
        ]);
        setProducts(prodList);
        setCategories(catList);

        // Try loading inquiries (may fail if no RLS access yet)
        try {
          const inqList = await getInquiries();
          setInquiries(inqList);
        } catch (e) {
          // Silently handle — inquiries table may not exist yet
          setInquiries([]);
        }

        // Load all categories for product form
        try {
          const allCats = await getAllCategories();
          setAllCategories(allCats);
        } catch (e) {
          setAllCategories(catList);
        }
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [productRefreshKey]);

  const adminEmail = user?.email || 'admin@4coreexim.com';
  const provider = user?.app_metadata?.provider || 'oauth';

  // Count monograph standards
  const ipCount = products.filter(p => `${p.name} ${p.saltComposition || ''}`.toUpperCase().includes('IP')).length;
  const bpCount = products.filter(p => `${p.name} ${p.saltComposition || ''}`.toUpperCase().includes('BP')).length;
  const uspCount = products.filter(p => `${p.name} ${p.saltComposition || ''}`.toUpperCase().includes('USP')).length;

  // New inquiry count
  const newInquiryCount = inquiries.filter(i => i.status === 'new').length;

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleProductSaved = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setProductRefreshKey(k => k + 1);
  };

  return (
    <div className="bg-brand-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Admin Header Banner */}
        <div className="bg-brand-gray-900 text-white rounded-xl p-6 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-red-600 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-sm">
              <FiShield />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Trade Desk Control Console
                </h1>
                <span className="bg-brand-red-600/30 text-brand-red-400 border border-brand-red-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Administrator
                </span>
              </div>
              <p className="text-xs text-brand-gray-300 mt-1">
                Authenticated Officer: <span className="font-mono text-white">{adminEmail}</span> &bull; Provider: <span className="capitalize">{provider}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/catalog"
              className="px-4 py-2 bg-brand-red-600 hover:bg-brand-red-700 text-white rounded text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <FiExternalLink className="text-xs" />
              <span>Public Catalog View</span>
            </Link>
            <button
              onClick={() => signOut()}
              className="px-3 py-2 border border-brand-gray-700 hover:bg-brand-gray-800 text-brand-gray-300 rounded text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FiLogOut />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const badge = tab.id === 'inquiries' && newInquiryCount > 0 ? newInquiryCount : null;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-brand-red-600 text-white shadow-sm'
                    : 'bg-white border border-brand-gray-200 text-brand-gray-600 hover:text-brand-gray-900 hover:border-brand-gray-300'
                }`}
              >
                <Icon className="text-sm" />
                <span>{tab.label}</span>
                {badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-brand-red-600' : 'bg-brand-red-600 text-white'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-brand-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-brand-gray-500">Live Inventory Index</span>
                  <div className="p-2 bg-brand-red-50 text-brand-red-600 rounded-lg">
                    <FiPackage className="text-base" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-brand-gray-900 font-mono">
                  {loading ? '...' : products.length}
                </div>
                <span className="text-[11px] text-brand-gray-500 mt-1 block">Active formulations listed</span>
              </div>

              <div className="bg-white border border-brand-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-brand-gray-500">Therapeutic Categories</span>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <FiLayers className="text-base" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-brand-gray-900 font-mono">
                  {loading ? '...' : categories.length}
                </div>
                <span className="text-[11px] text-brand-gray-500 mt-1 block">Classification segments</span>
              </div>

              <div className="bg-white border border-brand-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-brand-gray-500">B2B Inquiries</span>
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <FiInbox className="text-base" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-brand-gray-900 font-mono">
                  {loading ? '...' : inquiries.length}
                </div>
                <span className="text-[11px] text-brand-gray-500 mt-1 block">
                  {newInquiryCount > 0 ? `${newInquiryCount} new, awaiting response` : 'Total leads received'}
                </span>
              </div>

              <div className="bg-white border border-brand-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-brand-gray-500">Pharmacopeia Standards</span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <FiFileText className="text-base" />
                  </div>
                </div>
                <div className="text-xs font-bold text-brand-gray-800 space-y-0.5">
                  <div>IP: <span className="font-mono text-brand-red-600">{ipCount}</span></div>
                  <div>BP: <span className="font-mono text-brand-red-600">{bpCount}</span> | USP: <span className="font-mono text-brand-red-600">{uspCount}</span></div>
                </div>
                <span className="text-[10px] text-brand-gray-500 mt-1 block">Standardized monographs</span>
              </div>
            </div>

            {/* Two Column Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Product Table Preview */}
              <div className="lg:col-span-2 bg-white border border-brand-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-brand-gray-150 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wider">
                      Recent Products
                    </h2>
                    <p className="text-xs text-brand-gray-500">Latest catalog entries</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddProduct}
                      className="px-3 py-1.5 bg-brand-red-600 hover:bg-brand-red-700 text-white rounded text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <FiPlus className="text-xs" />
                      <span>Add Product</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="text-xs font-bold text-brand-red-600 hover:text-brand-red-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Manage All</span>
                      <FiExternalLink className="text-xs" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-brand-gray-200 text-brand-gray-500 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Price</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gray-100">
                      {products.slice(0, 8).map((p) => (
                        <tr key={p.id} className="hover:bg-brand-gray-50 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-brand-gray-900">{p.name}</td>
                          <td className="py-2.5 px-3 capitalize text-brand-gray-700 text-[11px]">
                            {categories.find(c => c.id === p.category)?.name || p.category}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-brand-gray-800">
                            {p.currency} {p.price}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              <FiCheckCircle className="text-[10px]" /> Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 pt-3 border-t border-brand-gray-150 flex items-center justify-between text-xs text-brand-gray-500">
                  <span>Showing 8 of {products.length} catalog items</span>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="font-bold text-brand-red-600 hover:underline cursor-pointer"
                  >
                    View all formulations &rarr;
                  </button>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">

                {/* Quick Actions */}
                <div className="bg-white border border-brand-gray-200 rounded-xl p-6 shadow-sm">
                  <h2 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wider mb-3 border-b border-brand-gray-150 pb-2">
                    Quick Actions
                  </h2>
                  <div className="space-y-2">
                    <button
                      onClick={handleAddProduct}
                      className="w-full flex items-center gap-2 px-3 py-2.5 bg-brand-red-50 hover:bg-brand-red-100 text-brand-red-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      <FiPlus /> Add New Product
                    </button>
                    <button
                      onClick={() => setActiveTab('categories')}
                      className="w-full flex items-center gap-2 px-3 py-2.5 bg-brand-gray-50 hover:bg-brand-gray-100 text-brand-gray-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      <FiLayers /> Manage Categories
                    </button>
                    <button
                      onClick={() => setActiveTab('inquiries')}
                      className="w-full flex items-center gap-2 px-3 py-2.5 bg-brand-gray-50 hover:bg-brand-gray-100 text-brand-gray-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      <FiInbox /> View Inquiries
                      {newInquiryCount > 0 && (
                        <span className="bg-brand-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-auto">
                          {newInquiryCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* System Config */}
                <div className="bg-white border border-brand-gray-200 rounded-xl p-6 shadow-sm">
                  <h2 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wider mb-3 border-b border-brand-gray-150 pb-2 flex items-center gap-2">
                    <FiSettings className="text-brand-red-600" />
                    <span>System Status</span>
                  </h2>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-brand-gray-500 block text-[11px] uppercase font-bold">Supabase Database</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-xs font-bold text-brand-gray-800">
                          {isSupabaseConfigured ? 'Connected' : 'Setup Required (.env)'}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-brand-gray-150">
                      <span className="text-brand-gray-500 block text-[11px] uppercase font-bold">Admin Email</span>
                      <div className="mt-1 p-2 bg-brand-gray-50 border border-brand-gray-200 rounded font-mono text-[11px] text-brand-gray-800 break-all">
                        {adminEmail}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ===== PRODUCTS TAB ===== */}
        {activeTab === 'products' && (
          <AdminProductTable
            onEditProduct={handleEditProduct}
            onAddProduct={handleAddProduct}
            refreshKey={productRefreshKey}
          />
        )}

        {/* ===== CATEGORIES TAB ===== */}
        {activeTab === 'categories' && (
          <AdminCategoryManager />
        )}

        {/* ===== COMPANY TAB ===== */}
        {activeTab === 'company' && (
          <AdminCompanySettings />
        )}

        {/* ===== INQUIRIES TAB ===== */}
        {activeTab === 'inquiries' && (
          <AdminInquiries />
        )}

      </div>

      {/* Product Form Modal (shared across tabs) */}
      <AdminProductForm
        isOpen={showProductForm}
        onClose={() => { setShowProductForm(false); setEditingProduct(null); }}
        onSave={handleProductSaved}
        product={editingProduct}
        categories={allCategories}
      />
    </div>
  );
}
