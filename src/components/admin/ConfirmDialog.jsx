import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

/**
 * Reusable confirmation dialog modal.
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onConfirm
 * @param {string} props.title
 * @param {string} props.message
 * @param {string} [props.confirmLabel='Confirm']
 * @param {string} [props.confirmStyle='danger'] - 'danger' or 'primary'
 * @param {boolean} [props.loading=false]
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmStyle = 'danger',
  loading = false
}) {
  if (!isOpen) return null;

  const btnClass = confirmStyle === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-brand-red-600 hover:bg-brand-red-700 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-gray-950/70">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white border border-brand-gray-300 rounded-xl shadow-xl w-full max-w-sm z-10 p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-brand-gray-400 hover:text-brand-gray-800 cursor-pointer"
          aria-label="Close"
        >
          <FiX />
        </button>

        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FiAlertTriangle className="text-lg" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-gray-900">{title}</h3>
            <p className="text-xs text-brand-gray-600 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-brand-gray-300 hover:bg-brand-gray-50 text-brand-gray-700 text-xs font-bold rounded transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-xs font-bold rounded transition-colors cursor-pointer disabled:opacity-50 ${btnClass}`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
