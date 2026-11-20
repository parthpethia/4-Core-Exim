import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

/**
 * SearchBar component for live-filtering products.
 * @param {Object} props
 * @param {string} props.searchQuery - Active search query text
 * @param {Function} props.onSearchChange - Callback when search text changes
 */
export default function SearchBar({ searchQuery, onSearchChange }) {
  const quickFilters = ['Meropenem', 'Pregabalin', 'Metformin', 'Injections', 'Cipla', 'Veterinary'];

  return (
    <div className="w-full bg-white border border-brand-gray-200 rounded-lg p-4 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
      
      {/* Search Header */}
      <div className="w-full md:w-auto">
        <h4 className="font-bold text-brand-gray-900 text-sm">Product Search & Filter</h4>
        <p className="text-[11px] text-brand-gray-500 mt-0.5">Query by brand name, active salt (API), manufacturer, strength, or dosage form.</p>
      </div>

      {/* Input container */}
      <div className="w-full md:w-1/2 flex flex-col gap-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-gray-400">
            <FiSearch className="text-sm" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search e.g. Pregabalin, Injection, Cipla, 500mg..."
            className="w-full pl-9 pr-9 py-2 bg-brand-gray-50 border border-brand-gray-200 rounded text-xs text-brand-gray-900 placeholder-brand-gray-400 focus:outline-none focus:bg-white focus:border-brand-green-600 focus:ring-1 focus:ring-brand-green-600 font-medium transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-gray-400 hover:text-brand-gray-700 transition-colors cursor-pointer"
              aria-label="Clear search input"
            >
              <FiX className="text-sm" />
            </button>
          )}
        </div>

        {/* Quick Search Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-brand-gray-500 font-bold uppercase tracking-wider">Quick:</span>
          {quickFilters.map((tag) => (
            <button
              key={tag}
              onClick={() => onSearchChange(tag)}
              className="text-[10px] font-semibold bg-brand-gray-100 hover:bg-brand-gray-200 text-brand-gray-700 px-2 py-0.5 rounded transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
