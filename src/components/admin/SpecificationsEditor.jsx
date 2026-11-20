import React from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

/**
 * Dynamic key-value pair editor for product specifications.
 * Allows admin to add/remove specification rows (e.g., Form, Shelf Life, Side Effects).
 * @param {Object} props
 * @param {Object} props.specifications - Current specifications object { key: value }
 * @param {Function} props.onChange - Callback with updated specs object
 */
export default function SpecificationsEditor({ specifications = {}, onChange }) {
  const entries = Object.entries(specifications);

  const handleKeyChange = (oldKey, newKey) => {
    const updated = {};
    Object.entries(specifications).forEach(([k, v]) => {
      if (k === oldKey) {
        updated[newKey] = v;
      } else {
        updated[k] = v;
      }
    });
    onChange(updated);
  };

  const handleValueChange = (key, newValue) => {
    onChange({ ...specifications, [key]: newValue });
  };

  const handleAdd = () => {
    // Find a unique default key name
    let idx = entries.length + 1;
    let newKey = `Specification ${idx}`;
    while (specifications[newKey] !== undefined) {
      idx++;
      newKey = `Specification ${idx}`;
    }
    onChange({ ...specifications, [newKey]: '' });
  };

  const handleRemove = (key) => {
    const updated = { ...specifications };
    delete updated[key];
    onChange(updated);
  };

  // Common specification key suggestions
  const keySuggestions = [
    'Form', 'Shelf Life', 'Side Effects', 'Warnings', 'Precautions',
    'Dosing Course', 'Administration', 'USP', 'Highlights',
    'Usage Guidelines', 'Prescription Status', 'Product Highlights',
    'Application Type', 'Mode of Action', 'Regulatory Class',
    'Usage/Application', 'Grade Standard', 'Variant', 'Pack Size'
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-bold text-brand-gray-700 uppercase tracking-wider">
          Specifications (Key-Value Pairs)
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-brand-green-700 hover:text-brand-green-800 bg-brand-green-50 hover:bg-brand-green-100 rounded transition-colors cursor-pointer border border-brand-green-200"
        >
          <FiPlus className="text-xs" />
          <span>Add Row</span>
        </button>
      </div>

      {entries.length === 0 && (
        <p className="text-[11px] text-brand-gray-400 italic py-2">
          No specifications added yet. Click "Add Row" to start.
        </p>
      )}

      {entries.map(([key, value], index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={key}
              onChange={(e) => handleKeyChange(key, e.target.value)}
              placeholder="Spec name (e.g., Form)"
              list="spec-key-suggestions"
              className="w-full border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs text-brand-gray-900 font-semibold focus:outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 bg-brand-gray-50"
            />
          </div>
          <div className="flex-[2]">
            <input
              type="text"
              value={value}
              onChange={(e) => handleValueChange(key, e.target.value)}
              placeholder="Value (e.g., Hard Gelatin Capsule)"
              className="w-full border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500"
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemove(key)}
            className="p-1.5 text-brand-gray-400 hover:text-red-600 cursor-pointer shrink-0 mt-0.5"
            title="Remove specification"
          >
            <FiTrash2 className="text-xs" />
          </button>
        </div>
      ))}

      {/* Datalist for key suggestions */}
      <datalist id="spec-key-suggestions">
        {keySuggestions.map(s => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  );
}
