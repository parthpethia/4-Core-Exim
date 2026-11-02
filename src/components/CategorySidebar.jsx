import React from 'react';
import { FiGrid } from 'react-icons/fi';

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
      <div className="hidden lg:block bg-white border border-brand-gray-200 rounded-lg p-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gray-900 border-b border-brand-gray-200 pb-2.5 mb-3 flex items-center gap-2">
          <FiGrid className="text-brand-red-600" />
          <span>Therapeutic Categories</span>
        </h3>
        <nav className="space-y-1">
          {/* All Categories Option */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-bold transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-brand-red-600 text-white'
                : 'text-brand-gray-700 hover:bg-brand-gray-100 hover:text-brand-gray-950'
            }`}
          >
            <span>All Formulations</span>
            <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
              selectedCategory === 'all' ? 'bg-brand-red-800 text-white' : 'bg-brand-gray-100 text-brand-gray-600'
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-brand-red-600 text-white font-bold'
                    : 'text-brand-gray-700 hover:bg-brand-gray-100 hover:text-brand-gray-950'
                }`}
              >
                <span className="truncate mr-2">{cat.name}</span>
                <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded shrink-0 ${
                  isActive ? 'bg-brand-red-800 text-white' : 'bg-brand-gray-100 text-brand-gray-600'
                }`}>
                  {cat.productCount}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Horizontal Scroll Filter Bar */}
      <div className="block lg:hidden w-full pb-2">
        <span className="text-[11px] font-bold text-brand-gray-500 uppercase tracking-wider block mb-1.5">
          Filter Category ({categories.length + 1})
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-2 scroll-smooth">
          <button
            onClick={() => onSelectCategory('all')}
            className={`whitespace-nowrap px-3 py-1.5 rounded text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-brand-red-600 text-white'
                : 'bg-white border border-brand-gray-200 text-brand-gray-800 hover:bg-brand-gray-50'
            }`}
          >
            <span>All Formulations</span>
            <span className={`font-mono text-[10px] px-1 rounded ${
              selectedCategory === 'all' ? 'bg-brand-red-800 text-white' : 'bg-brand-gray-100 text-brand-gray-600'
            }`}>
              {totalCount}
            </span>
          </button>

          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-brand-red-600 text-white font-bold'
                    : 'bg-white border border-brand-gray-200 text-brand-gray-800 hover:bg-brand-gray-50'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`font-mono text-[10px] px-1 rounded ${
                  isActive ? 'bg-brand-red-800 text-white' : 'bg-brand-gray-100 text-brand-gray-600'
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
