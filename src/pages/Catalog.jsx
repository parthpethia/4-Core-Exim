import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CategorySidebar from '../components/CategorySidebar';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { getCategories, getProducts, getCompanyInfo } from '../services/productService';
import { FiInbox, FiRefreshCw } from 'react-icons/fi';

export default function Catalog() {
  const location = useLocation();
  
  const [company, setCompany] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pharmacopeiaFilter, setPharmacopeiaFilter] = useState('all');
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

  // Filter products based on category and search query state
  useEffect(() => {
    async function filterCatalog() {
      setLoading(true);
      let filteredProducts = await getProducts({
        category: selectedCategory,
        search: searchQuery
      });

      if (pharmacopeiaFilter !== 'all') {
        filteredProducts = filteredProducts.filter(p => {
          const comp = `${p.name} ${p.saltComposition || ''}`.toUpperCase();
          return comp.includes(pharmacopeiaFilter);
        });
      }

      // Add a slight realistic micro-delay so skeleton animation is discernible
      setTimeout(() => {
        setProducts(filteredProducts);
        setLoading(false);
      }, 150);
    }
    
    filterCatalog();
  }, [selectedCategory, searchQuery, pharmacopeiaFilter]);

  const activeCategoryObject = categories.find(c => c.id === selectedCategory);
  const activeCategoryName = activeCategoryObject ? activeCategoryObject.name : 'All Formulations';

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPharmacopeiaFilter('all');
  };

  return (
    <div className="bg-brand-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header Banner */}
        <div className="mb-6 border-b border-brand-gray-200 pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-red-600">Export Index</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-gray-900 mt-0.5">Pharmaceutical Export Catalog & RFQ</h1>
          <p className="text-xs text-brand-gray-600 mt-1">
            Browse our WHO-GMP certified inventory index. Search by salt composition, brand, strength, or pharmacopeial standard to view specifications and request bulk export quotes.
          </p>
        </div>

        {/* Global Search Component */}
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        {/* Catalog Main Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left Category Sidebar Column */}
          <div className="w-full lg:w-1/4 shrink-0 sticky top-20 z-10 lg:z-0">
            <CategorySidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* Right Product Grid/List Column */}
          <div className="flex-1 w-full">
            
            {/* Catalog Info & Filter header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 bg-white border border-brand-gray-200 rounded-lg px-4 py-3 shadow-sm text-xs">
              <div className="text-brand-gray-800 font-bold uppercase tracking-wide">
                Category: <span className="text-brand-red-600">{activeCategoryName}</span>
              </div>
              
              {/* Pharmacopeia Filter Bar */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-brand-gray-500 font-semibold uppercase text-[10px]">Monograph:</span>
                {['all', 'IP', 'BP', 'USP'].map((mono) => (
                  <button
                    key={mono}
                    onClick={() => setPharmacopeiaFilter(mono)}
                    className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] transition-colors cursor-pointer ${
                      pharmacopeiaFilter === mono
                        ? 'bg-brand-gray-900 text-white'
                        : 'bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200'
                    }`}
                  >
                    {mono === 'all' ? 'All Standards' : mono}
                  </button>
                ))}
                <span className="text-brand-gray-300 mx-1">|</span>
                <div className="text-brand-gray-600 font-medium">
                  <strong className="text-brand-gray-900 font-bold font-mono">{products.length}</strong> {products.length === 1 ? 'item' : 'items'}
                </div>
              </div>
            </div>

            {/* Loading Skeleton vs Products vs Empty State */}
            {loading ? (
              <ProductSkeleton viewMode="list" count={3} />
            ) : products.length > 0 ? (
              <div className="space-y-4">
                {products.map((product) => {
                  const productCategory = categories.find(c => c.id === product.category);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      categoryName={productCategory ? productCategory.name : 'Formulations'}
                      companyEmail={company ? company.email : 'exports@4coreexim.com'}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-brand-gray-200 rounded-lg p-10 text-center flex flex-col items-center justify-center">
                <div className="bg-brand-gray-100 p-3 rounded-full text-brand-gray-600 mb-3">
                  <FiInbox className="text-3xl" />
                </div>
                <h3 className="text-base font-bold text-brand-gray-900 mb-1">No Matching Formulations Found</h3>
                <p className="text-xs text-brand-gray-600 max-w-sm mb-4 leading-relaxed">
                  No records matched your search query "{searchQuery}" under "{activeCategoryName}". Try adjusting the active keywords or resetting active filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-red-600 hover:bg-brand-red-700 text-white font-bold rounded text-xs transition-colors cursor-pointer"
                >
                  <FiRefreshCw className="text-xs" />
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
