import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import CategorySidebar from '../components/CategorySidebar';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import MarketSelector from '../components/MarketSelector';
import PageSEO from '../components/PageSEO';
import {
  getCategories,
  getProducts,
  getCompanyInfo,
  getCountries,
  CATALOG_PAGE_SIZE
} from '../services/productService';
import { detectMarketCountry, persistMarketCountry } from '../utils/marketLocation';
import { FiInbox, FiRefreshCw, FiChevronDown } from 'react-icons/fi';

export default function Catalog() {
  const location = useLocation();

  const [company, setCompany] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [countries, setCountries] = useState([]);
  const [marketCountry, setMarketCountry] = useState(() => detectMarketCountry());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pharmacopeiaFilter, setPharmacopeiaFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (location.state && location.state.selectedCategory) {
      setSelectedCategory(location.state.selectedCategory);
    }
  }, [location.state]);

  useEffect(() => {
    async function loadConfig() {
      const [comp, marketList] = await Promise.all([
        getCompanyInfo(),
        getCountries({ targetOnly: true })
      ]);
      setCompany(comp);
      setCountries(marketList);

      const codes = marketList.map(c => c.code);
      const detected = detectMarketCountry(codes);
      setMarketCountry(detected);
      persistMarketCountry(detected);
    }
    loadConfig();
  }, []);

  useEffect(() => {
    async function loadCategories() {
      const cats = await getCategories({ marketCountry });
      setCategories(cats);
    }
    loadCategories();
  }, [marketCountry]);

  const fetchPage = useCallback(async ({ reset }) => {
    const nextOffset = reset ? 0 : offset;
    if (reset) setLoading(true);
    else setLoadingMore(true);

    const page = await getProducts({
      category: selectedCategory,
      search: searchQuery,
      marketCountry,
      pharmacopeia: pharmacopeiaFilter,
      lean: true,
      limit: CATALOG_PAGE_SIZE,
      offset: nextOffset
    });

    const total = page[0]?.totalCount ?? (reset ? page.length : totalCount);
    setTotalCount(total);

    if (reset) {
      setProducts(page);
      setOffset(page.length);
    } else {
      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const merged = [...prev];
        page.forEach((p) => {
          if (!seen.has(p.id)) merged.push(p);
        });
        return merged;
      });
      setOffset(nextOffset + page.length);
    }

    setLoading(false);
    setLoadingMore(false);
  }, [selectedCategory, searchQuery, pharmacopeiaFilter, marketCountry, offset, totalCount]);

  // Reset list when filters change
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      const page = await getProducts({
        category: selectedCategory,
        search: searchQuery,
        marketCountry,
        pharmacopeia: pharmacopeiaFilter,
        lean: true,
        limit: CATALOG_PAGE_SIZE,
        offset: 0
      });
      if (cancelled) return;
      setProducts(page);
      setOffset(page.length);
      setTotalCount(page[0]?.totalCount ?? page.length);
      setLoading(false);
    }, searchQuery ? 220 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedCategory, searchQuery, pharmacopeiaFilter, marketCountry]);

  const activeCategoryObject = categories.find(c => c.id === selectedCategory);
  const activeCategoryName = activeCategoryObject ? activeCategoryObject.name : 'All Formulations';
  const activeMarket = useMemo(
    () => countries.find(c => c.code === marketCountry),
    [countries, marketCountry]
  );

  const hasMore = products.length < totalCount;

  const handleMarketChange = (code) => {
    setMarketCountry(code);
    persistMarketCountry(code);
    setSelectedCategory('all');
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPharmacopeiaFilter('all');
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) fetchPage({ reset: false });
  };

  return (
    <div className="bg-brand-gray-50 min-h-screen py-10">
      <PageSEO
        title="Pharmaceutical Export Catalog — Generic & Branded Medicines from India"
        description="Browse 500+ WHO-GMP certified medicines for export: tablets, capsules, injections, antibiotics, oncology drugs, veterinary products. FOB Mumbai pricing for wholesale buyers."
        path="/catalog"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-6 border-b border-brand-gray-200 pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-red-600">Export Index</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-gray-900 mt-0.5">Pharmaceutical Export Catalog & RFQ</h1>
          <p className="text-xs text-brand-gray-600 mt-1">
            Browse our WHO-GMP certified inventory index. Catalog order and pricing adapt to your destination market
            {activeMarket ? ` (${activeMarket.name})` : ''}. Search by salt composition, brand, strength, or pharmacopeial standard.
          </p>
        </div>

        {countries.length > 0 && (
          <div className="mb-3 flex justify-end">
            <MarketSelector
              countries={countries}
              value={marketCountry}
              onChange={handleMarketChange}
              className="w-full sm:w-80"
            />
          </div>
        )}

        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="w-full lg:w-1/4 shrink-0 sticky top-20 z-10 lg:z-0">
            <CategorySidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 bg-white border border-brand-gray-200 rounded-lg px-4 py-3 shadow-sm text-xs">
              <div className="text-brand-gray-800 font-bold uppercase tracking-wide">
                Category: <span className="text-brand-red-600">{activeCategoryName}</span>
                {activeMarket && (
                  <span className="ml-2 font-medium normal-case text-brand-gray-500">
                    · ranked for {activeMarket.name}
                  </span>
                )}
              </div>

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
                  <strong className="text-brand-gray-900 font-bold font-mono">{products.length}</strong>
                  {totalCount > products.length ? (
                    <span className="text-brand-gray-500"> / {totalCount}</span>
                  ) : null}
                  {' '}{totalCount === 1 ? 'item' : 'items'}
                </div>
              </div>
            </div>

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
                      marketCountry={marketCountry}
                    />
                  );
                })}

                {hasMore && (
                  <div className="flex justify-center pt-2 pb-6">
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-brand-gray-300 hover:border-brand-gray-400 text-brand-gray-800 text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <FiChevronDown className={loadingMore ? 'animate-bounce' : ''} />
                      {loadingMore ? 'Loading…' : `Load more (${Math.min(CATALOG_PAGE_SIZE, totalCount - products.length)} of ${totalCount - products.length} left)`}
                    </button>
                  </div>
                )}
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
