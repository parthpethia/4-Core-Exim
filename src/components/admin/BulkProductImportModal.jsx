import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiCheck, FiAlertTriangle, FiFile, FiLoader } from 'react-icons/fi';
import { supabase } from '../../services/supabaseClient';

// ---------------------------------------------------------------------------
// CSV Export utility (standalone, importable)
// ---------------------------------------------------------------------------

/**
 * Generate a CSV from products and trigger a browser download.
 * @param {Array} products - Product objects in frontend (camelCase) format
 * @param {Array} categories - Category objects with { id, name }
 */
export function exportProductsToCsv(products, categories = []) {
  const catMap = {};
  categories.forEach(c => { catMap[c.id] = c.name; });

  const headers = [
    'id', 'name', 'category_id', 'category_name', 'brand', 'manufacturer', 'marketer',
    'price', 'currency', 'strength', 'packaging_size', 'packaging_type',
    'salt_composition', 'country_of_origin', 'minimum_order_quantity',
    'storage', 'treatment', 'description', 'is_active'
  ];

  const escCsv = (val) => {
    if (val == null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const rows = products.map(p => [
    p.id,
    p.name,
    p.category,
    catMap[p.category] || p.category,
    p.brand,
    p.manufacturer,
    p.marketer,
    p.price,
    p.currency,
    p.strength,
    p.packagingSize,
    p.packagingType,
    p.saltComposition,
    p.countryOfOrigin,
    p.minimumOrderQuantity,
    p.storage,
    p.treatment,
    p.description,
    p.isActive !== false ? 'true' : 'false'
  ].map(escCsv).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `4core-exim-catalog-${date}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// CSV Parser (no external dependencies)
// ---------------------------------------------------------------------------

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, j) => {
      row[h] = values[j] !== undefined ? values[j] : '';
    });
    row.__lineNumber = i + 1;
    rows.push(row);
  }
  return { headers, rows };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const REQUIRED_COLUMNS = ['id', 'name', 'category_id'];
const ALL_COLUMNS = [
  'id', 'name', 'category_id', 'brand', 'manufacturer', 'marketer',
  'price', 'currency', 'strength', 'packaging_size', 'packaging_type',
  'salt_composition', 'country_of_origin', 'minimum_order_quantity',
  'storage', 'treatment', 'description', 'is_active'
];

function validateRow(row, categoryIds) {
  const errors = [];

  if (!row.id || !row.id.trim()) {
    errors.push('Missing required field: id');
  } else if (!/^[a-z0-9-]+$/.test(row.id.trim())) {
    errors.push('ID must contain only lowercase letters, numbers, and hyphens');
  }

  if (!row.name || !row.name.trim()) {
    errors.push('Missing required field: name');
  }

  if (!row.category_id || !row.category_id.trim()) {
    errors.push('Missing required field: category_id');
  } else if (categoryIds.size > 0 && !categoryIds.has(row.category_id.trim())) {
    errors.push(`Unknown category: "${row.category_id}"`);
  }

  if (row.price && row.price.trim() !== '') {
    const price = parseFloat(row.price);
    if (isNaN(price) || price < 0) {
      errors.push(`Invalid price: "${row.price}"`);
    }
  }

  if (row.is_active && !['true', 'false', '1', '0', 'yes', 'no', ''].includes(row.is_active.toLowerCase())) {
    errors.push(`Invalid is_active value: "${row.is_active}" (use true/false)`);
  }

  return errors;
}

function rowToDbFormat(row) {
  const isActive = row.is_active
    ? ['true', '1', 'yes'].includes(row.is_active.toLowerCase())
    : true;

  return {
    id: row.id.trim(),
    name: row.name.trim(),
    category_id: row.category_id.trim(),
    brand: row.brand || null,
    manufacturer: row.manufacturer || null,
    marketer: row.marketer || null,
    price: row.price ? parseFloat(row.price) : null,
    currency: (row.currency || 'USD').toUpperCase(),
    strength: row.strength || null,
    packaging_size: row.packaging_size || null,
    packaging_type: row.packaging_type || null,
    salt_composition: row.salt_composition || null,
    country_of_origin: row.country_of_origin || null,
    minimum_order_quantity: row.minimum_order_quantity || null,
    storage: row.storage || null,
    treatment: row.treatment || null,
    description: row.description || null,
    is_active: isActive
  };
}

// ---------------------------------------------------------------------------
// Modal Steps
// ---------------------------------------------------------------------------

const STEPS = ['upload', 'preview', 'executing', 'done'];

/**
 * BulkProductImportModal — CSV upload → validate → diff preview → execute.
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onComplete - Called after successful import
 * @param {Array} props.categories - For validation
 */
export default function BulkProductImportModal({ isOpen, onClose, onComplete, categories = [] }) {
  const [step, setStep] = useState('upload');
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [validRows, setValidRows] = useState([]);
  const [invalidRows, setInvalidRows] = useState([]);
  const [newRows, setNewRows] = useState([]);
  const [updateRows, setUpdateRows] = useState([]);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const categoryIds = new Set(categories.map(c => c.id));

  const resetState = () => {
    setStep('upload');
    setFileName('');
    setParsedRows([]);
    setValidRows([]);
    setInvalidRows([]);
    setNewRows([]);
    setUpdateRows([]);
    setExecuting(false);
    setResult(null);
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = async (file) => {
    if (!file) return;
    setError(null);
    setFileName(file.name);

    try {
      const text = await file.text();
      const { headers, rows } = parseCsv(text);

      // Check required columns
      const missingCols = REQUIRED_COLUMNS.filter(c => !headers.includes(c));
      if (missingCols.length > 0) {
        setError(`Missing required columns: ${missingCols.join(', ')}. Found: ${headers.join(', ')}`);
        return;
      }

      setParsedRows(rows);

      // Validate each row
      const valid = [];
      const invalid = [];

      rows.forEach((row) => {
        const errors = validateRow(row, categoryIds);
        if (errors.length > 0) {
          invalid.push({ row, errors });
        } else {
          valid.push(row);
        }
      });

      // Check which valid IDs already exist in DB
      const ids = valid.map(r => r.id.trim());
      let existingIds = new Set();
      if (ids.length > 0) {
        try {
          const { data } = await supabase
            .from('products')
            .select('id')
            .in('id', ids);
          existingIds = new Set((data || []).map(d => d.id));
        } catch {
          // If lookup fails, treat all as new
        }
      }

      const newOnes = valid.filter(r => !existingIds.has(r.id.trim()));
      const updates = valid.filter(r => existingIds.has(r.id.trim()));

      setValidRows(valid);
      setInvalidRows(invalid);
      setNewRows(newOnes);
      setUpdateRows(updates);
      setStep('preview');
    } catch (err) {
      setError('Failed to parse CSV file: ' + err.message);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    setStep('executing');
    setError(null);

    try {
      const dbRows = validRows.map(rowToDbFormat);

      // Batch upsert (Supabase supports up to ~1000 rows per call)
      const BATCH_SIZE = 500;
      let totalInserted = 0;

      for (let i = 0; i < dbRows.length; i += BATCH_SIZE) {
        const batch = dbRows.slice(i, i + BATCH_SIZE);
        const { data, error: upsertError } = await supabase
          .from('products')
          .upsert(batch, { onConflict: 'id', ignoreDuplicates: false })
          .select('id');

        if (upsertError) throw upsertError;
        totalInserted += (data || []).length;
      }

      setResult({
        total: dbRows.length,
        inserted: newRows.length,
        updated: updateRows.length,
        success: totalInserted
      });
      setStep('done');
    } catch (err) {
      setError('Import failed: ' + (err.message || 'Unknown error'));
      setStep('preview');
    } finally {
      setExecuting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-brand-gray-950/70 overflow-y-auto">
      <div className="fixed inset-0" onClick={handleClose} />

      <div className="relative bg-white border border-brand-gray-300 rounded-xl shadow-xl w-full max-w-2xl z-10 my-8 overflow-hidden">

        {/* Header */}
        <div className="bg-brand-gray-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-tight">Bulk Product Import</h3>
            <p className="text-[11px] text-brand-gray-300">
              Upload a CSV file to create or update products in bulk
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded hover:bg-brand-gray-800 text-brand-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-brand-gray-50 border-b border-brand-gray-200 flex items-center gap-3">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === s ? 'bg-brand-red-600 text-white' :
                STEPS.indexOf(step) > i ? 'bg-emerald-500 text-white' :
                'bg-brand-gray-200 text-brand-gray-500'
              }`}>
                {STEPS.indexOf(step) > i ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                step === s ? 'text-brand-gray-900' : 'text-brand-gray-400'
              }`}>
                {s === 'upload' ? 'Upload' : s === 'preview' ? 'Preview' : s === 'executing' ? 'Importing' : 'Done'}
              </span>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-brand-gray-300" />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs font-medium flex items-start gap-2">
              <FiAlertTriangle className="text-sm shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-brand-gray-300 rounded-xl p-8 text-center hover:border-brand-red-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.name.endsWith('.csv')) handleFileSelect(file);
                }}
              >
                <FiUpload className="text-3xl text-brand-gray-400 mx-auto mb-3" />
                <p className="text-xs font-bold text-brand-gray-700">
                  Click to select or drag & drop a CSV file
                </p>
                <p className="text-[10px] text-brand-gray-400 mt-1">
                  Required columns: id, name, category_id
                </p>
                {fileName && (
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-brand-gray-600">
                    <FiFile className="text-sm" />
                    <span>{fileName}</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
              <div className="bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-3">
                <p className="text-[10px] font-bold text-brand-gray-600 uppercase mb-1">CSV Format Guide</p>
                <p className="text-[10px] text-brand-gray-500 font-mono leading-relaxed">
                  id, name, category_id, brand, price, currency, strength, packaging_size, packaging_type, salt_composition, country_of_origin, minimum_order_quantity, is_active
                </p>
              </div>
            </div>
          )}

          {/* STEP: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                  <div className="text-xl font-extrabold text-emerald-700 font-mono">{newRows.length}</div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase">🟢 New Products</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                  <div className="text-xl font-extrabold text-amber-700 font-mono">{updateRows.length}</div>
                  <div className="text-[10px] font-bold text-amber-600 uppercase">🟡 Updates</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <div className="text-xl font-extrabold text-red-700 font-mono">{invalidRows.length}</div>
                  <div className="text-[10px] font-bold text-red-600 uppercase">🔴 Invalid</div>
                </div>
              </div>

              {/* Invalid Rows Detail */}
              {invalidRows.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h4 className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1">
                    <FiAlertTriangle className="text-sm" /> Invalid Rows (will be skipped)
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-1.5">
                    {invalidRows.map(({ row, errors }, idx) => (
                      <div key={idx} className="text-[10px] text-red-700 bg-white rounded px-2 py-1.5 border border-red-100">
                        <span className="font-bold">Row {row.__lineNumber}:</span>{' '}
                        <span className="font-mono">{row.id || '(no id)'}</span> — {errors.join('; ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Valid Rows Preview */}
              {validRows.length > 0 && (
                <div className="bg-white border border-brand-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-brand-gray-50 px-3 py-2 border-b border-brand-gray-200">
                    <span className="text-[10px] font-bold text-brand-gray-600 uppercase">
                      {validRows.length} valid rows ready for import
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="border-b border-brand-gray-100 text-brand-gray-500 uppercase font-bold">
                          <th className="py-1.5 px-2 text-left">Type</th>
                          <th className="py-1.5 px-2 text-left">ID</th>
                          <th className="py-1.5 px-2 text-left">Name</th>
                          <th className="py-1.5 px-2 text-left">Category</th>
                          <th className="py-1.5 px-2 text-left">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-gray-50">
                        {validRows.slice(0, 50).map((row, idx) => {
                          const isNew = newRows.some(r => r.id === row.id);
                          return (
                            <tr key={idx} className="text-brand-gray-700">
                              <td className="py-1 px-2">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  isNew ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {isNew ? 'NEW' : 'UPDATE'}
                                </span>
                              </td>
                              <td className="py-1 px-2 font-mono">{row.id}</td>
                              <td className="py-1 px-2 font-semibold max-w-[200px] truncate">{row.name}</td>
                              <td className="py-1 px-2">{row.category_id}</td>
                              <td className="py-1 px-2 font-mono">{row.currency || 'USD'} {row.price || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {validRows.length > 50 && (
                      <div className="px-3 py-1.5 text-[10px] text-brand-gray-400 text-center">
                        ...and {validRows.length - 50} more rows
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP: Executing */}
          {step === 'executing' && (
            <div className="text-center py-12">
              <FiLoader className="text-3xl text-brand-red-600 animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold text-brand-gray-900">Importing products...</p>
              <p className="text-xs text-brand-gray-500 mt-1">
                Processing {validRows.length} rows. Please do not close this window.
              </p>
            </div>
          )}

          {/* STEP: Done */}
          {step === 'done' && result && (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="text-2xl" />
              </div>
              <h4 className="text-sm font-bold text-brand-gray-900 mb-2">Import Complete!</h4>
              <div className="text-xs text-brand-gray-600 space-y-1">
                <p>🟢 <strong>{result.inserted}</strong> new products created</p>
                <p>🟡 <strong>{result.updated}</strong> existing products updated</p>
                {invalidRows.length > 0 && (
                  <p>🔴 <strong>{invalidRows.length}</strong> invalid rows skipped</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-brand-gray-50 border-t border-brand-gray-200 px-6 py-3.5 flex items-center justify-between">
          <span className="text-[11px] text-brand-gray-500">
            {parsedRows.length > 0 ? `${parsedRows.length} rows parsed from ${fileName}` : 'No file selected'}
          </span>
          <div className="flex gap-2">
            {step === 'preview' && (
              <button
                onClick={() => { resetState(); }}
                className="px-4 py-2 border border-brand-gray-300 hover:bg-white text-brand-gray-700 text-xs font-bold rounded transition-colors cursor-pointer"
              >
                Start Over
              </button>
            )}
            <button
              type="button"
              onClick={step === 'done' ? () => { onComplete(); resetState(); } : handleClose}
              className="px-4 py-2 border border-brand-gray-300 hover:bg-white text-brand-gray-700 text-xs font-bold rounded transition-colors cursor-pointer"
            >
              {step === 'done' ? 'Close' : 'Cancel'}
            </button>
            {step === 'preview' && validRows.length > 0 && (
              <button
                onClick={handleExecute}
                disabled={executing}
                className="px-5 py-2 bg-brand-red-600 hover:bg-brand-red-700 text-white text-xs font-bold rounded transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <FiCheck className="text-xs" />
                <span>Import {validRows.length} Products</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
