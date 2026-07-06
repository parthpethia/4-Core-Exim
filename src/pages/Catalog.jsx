import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CategorySidebar from '../components/CategorySidebar';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import { getCategories, getProducts, getCompanyInfo } from '../services/productService';
import { FiInbox, FiRefreshCw } from 'react-icons/fi';

export default function Catalog() {
  const location = useLocation();
  
  const [company, setCompany] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Sync category selected from Home page or navigation state
  useEffect(() => {
    if (location.state && location.state.selectedCategory) {
      setSelectedCategory(location.state.selectedCategory);
    }
  }, [location.state]);

  // Load initial static company & categories data
  useEffect(() => {
    async function loadConfig() {
      const comp = await getCompanyInfo();
      const cats = await getCategories();
      setCompany(comp);
      setCategories(cats);
    }
    loadConfig();
  }, []);

  // Live filter products based on category and search query state
  useEffect(() => {
    async function filterCatalog() {
      setLoading(true);
      const filteredProducts = await getProducts({
        category: selectedCategory,
        search: searchQuery
      });
      setProducts(filteredProducts);
      setLoading(false);
    }
    
    filterCatalog();
  }, [selectedCategory, searchQuery]);

  const activeCategoryObject = categories.find(c => c.id === selectedCategory);
  const activeCategoryName = activeCategoryObject ? activeCategoryObject.name : 'All Products';

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
  };

  return (
    <div className="bg-brand-gray-50/50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header Banner */}
        <div className="mb-8 border-b border-brand-gray-200 pb-5">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-red-500">Corporate Catalog</span>
          <h1 className="text-3xl font-black text-brand-gray-900 mt-1">Export Product Index</h1>
          <p className="text-sm text-brand-gray-700 mt-2 font-medium">
            Browse our WHO-GMP certified inventory list. Select a category or search below to query specifications, pricing, and launch enquiries.
          </p>
        </div>

        {/* Global Search Component */}
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        {/* Catalog Main Layout (Sidebar + Main Content) */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Category Sidebar Column */}
          <div className="w-full lg:w-1/4 shrink-0 sticky top-24 z-10 lg:z-0">
            <CategorySidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* Right Product Grid/List Column */}
          <div className="flex-1 w-full">
            
            {/* Catalog Info header */}
            <div className="flex justify-between items-center mb-4 bg-white border border-brand-gray-200 rounded-lg px-4 py-3 shadow-sm">
              <div className="text-xs text-brand-gray-800 font-bold uppercase tracking-wide">
                Active: <span className="text-brand-red-500">{activeCategoryName}</span>
              </div>
              <div className="text-xs text-brand-gray-700 font-semibold">
                Showing <strong className="text-brand-gray-900 font-bold">{products.length}</strong> {products.length === 1 ? 'item' : 'items'}
              </div>
            </div>

            {/* Loading indicator */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-brand-gray-750">
                <FiRefreshCw className="text-4xl text-brand-red-500 animate-spin mb-4" />
                <p className="text-sm font-semibold">Querying pharmaceutical database...</p>
              </div>
            ) : products.length > 0 ? (
              
              /* Products List container */
              <div className="space-y-4">
                {products.map((product) => {
                  const productCategory = categories.find(c => c.id === product.category);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      categoryName={productCategory ? productCategory.name : 'Medicines'}
                      companyEmail={company ? company.email : 'exports@4coreexim.com'}
                    />
                  );
                })}
              </div>
            ) : (
              
              /* Empty Results Container */
              <div className="bg-white border border-brand-gray-200 rounded-xl shadow-premium p-12 text-center flex flex-col items-center justify-center">
                <div className="bg-brand-gray-100 p-4 rounded-full text-brand-gray-700 mb-4">
                  <FiInbox className="text-4xl" />
                </div>
                <h3 className="text-lg font-bold text-brand-gray-900 mb-2">No Matching Formulations Found</h3>
                <p className="text-xs text-brand-gray-700 max-w-sm mb-6 leading-relaxed font-medium">
                  We couldn't find any medicines matching "{searchQuery}" under "{activeCategoryName}". Try adjusting your keywords or resetting filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-red-500 hover:bg-brand-red-600 text-white font-bold rounded-lg text-xs transition-all shadow cursor-pointer"
                >
                  <FiRefreshCw className="text-sm shrink-0" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
