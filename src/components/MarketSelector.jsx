import React from 'react';
import { FiGlobe } from 'react-icons/fi';

/**
 * Destination-market picker — drives catalog reorder + display currency.
 */
export default function MarketSelector({
  countries = [],
  value,
  onChange,
  className = ''
}) {
  return (
    <div
      className={`flex items-center gap-2 bg-white border border-brand-gray-200 rounded-lg px-3 py-2 shadow-sm ${className}`}
    >
      <FiGlobe className="text-brand-red-600 shrink-0" aria-hidden />
      <label htmlFor="market-country" className="text-[10px] font-bold uppercase tracking-wider text-brand-gray-500 whitespace-nowrap">
        Your market
      </label>
      <select
        id="market-country"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        className="flex-1 min-w-0 text-xs font-semibold text-brand-gray-900 bg-transparent border-0 focus:ring-0 cursor-pointer"
      >
        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name} ({c.code}) · {c.currencyCode || 'USD'}
          </option>
        ))}
      </select>
    </div>
  );
}
