import React from 'react';
import { FiGrid, FiChevronRight } from 'react-icons/fi';

/**
 * CategorySidebar component for filtering catalog.
 * @param {Object} props
 * @param {Array} props.categories - Array of categories with product counts
 * @param {string} props.selectedCategory - Currently selected category ID
 * @param {Function} props.onSelectCategory - Callback when category is selected
 */
export default function CategorySidebar({ categories, selectedCategory, onSelectCategory }) {
  const totalCount = categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0);

  return (
    <div className="w-full">
      {/* Desktop Sidebar View */}
      <div className="hidden lg:block bg-white border border-brand-gray-200 rounded-xl p-5 shadow-premium">
        <h3 className="text-lg font-bold text-brand-gray-900 border-b border-brand-gray-100 pb-3 mb-4 flex items-center gap-2">
          <FiGrid className="text-brand-red-500" /> Filter by Category
        </h3>
        <nav className="space-y-1">
          {/* All Categories Option */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-brand-red-500 text-white shadow-sm'
                : 'text-brand-gray-700 hover:bg-brand-gray-100 hover:text-brand-gray-950'
            }`}
          >
            <span className="flex items-center gap-2">All Products</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              selectedCategory === 'all' ? 'bg-brand-red-600 text-white' : 'bg-brand-gray-200 text-brand-gray-800'
            }`}>
              {totalCount}
            </span>
          </button>

          {/* Individual Category Buttons */}
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-brand-red-500 text-white shadow-sm'
                    : 'text-brand-gray-700 hover:bg-brand-gray-100 hover:text-brand-gray-950'
                }`}
              >
                <span className="flex items-center gap-2 truncate">{cat.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-brand-red-600 text-white' : 'bg-brand-gray-200 text-brand-gray-800'
                }`}>
                  {cat.productCount}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile & Tablet Pill Navigation View */}
      <div className="block lg:hidden w-full pb-4">
        <span className="text-xs font-bold text-brand-gray-700 uppercase tracking-wide block mb-2 px-1">
          Categories ({categories.length + 1})
        </span>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 scroll-smooth -mx-4 px-4 mask-right">
          {/* All Categories Option */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-brand-red-500 text-white'
                : 'bg-white border border-brand-gray-200 text-brand-gray-800 hover:bg-brand-gray-50'
            }`}
          >
            <span>All Products</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              selectedCategory === 'all' ? 'bg-brand-red-600 text-white' : 'bg-brand-gray-200 text-brand-gray-800'
            }`}>
              {totalCount}
            </span>
          </button>

          {/* Individual Category Buttons */}
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-brand-red-500 text-white'
                    : 'bg-white border border-brand-gray-200 text-brand-gray-800 hover:bg-brand-gray-50'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-brand-red-600 text-white' : 'bg-brand-gray-200 text-brand-gray-800'
                }`}>
                  {cat.productCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
