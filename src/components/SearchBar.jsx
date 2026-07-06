import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

/**
 * SearchBar component for live-filtering products.
 * @param {Object} props
 * @param {string} props.searchQuery - Active search query text
 * @param {Function} props.onSearchChange - Callback when search text changes
 */
export default function SearchBar({ searchQuery, onSearchChange }) {
  return (
    <div className="w-full bg-white border border-brand-gray-200 rounded-xl p-4 shadow-premium mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
      
      {/* Description block */}
      <div className="w-full md:w-auto">
        <h4 className="font-bold text-brand-gray-900 text-sm md:text-base">Search Export Catalog</h4>
        <p className="text-xs text-brand-gray-700 mt-0.5">Search by medicine name, brand, active ingredients, category, or manufacturer.</p>
      </div>

      {/* Input container */}
      <div className="w-full md:w-1/2 relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-gray-700">
          <FiSearch className="text-lg" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="e.g., Pregabalin, Cipla, Tenovate, capsules..."
          className="w-full pl-10 pr-10 py-3 bg-brand-gray-50 border border-brand-gray-200 rounded-lg text-sm text-brand-gray-950 placeholder-brand-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-red-500/20 focus:border-brand-red-500 hover:bg-brand-gray-100/50 transition-all font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brand-gray-700 hover:text-brand-red-500 transition-colors cursor-pointer"
            aria-label="Clear search input"
          >
            <FiX className="text-lg" />
          </button>
        )}
      </div>

    </div>
  );
}
