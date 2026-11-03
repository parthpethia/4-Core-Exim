import React, { useState, useEffect } from 'react';
import { FiLoader, FiInbox, FiGlobe } from 'react-icons/fi';
import {
  getInquiries,
  updateInquiryStatus,
  getCountryInterestSummary
} from '../../services/productService';

const STATUS_COLORS = {
  new: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'New' },
  contacted: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Contacted' },
  quoted: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Quoted' },
  closed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Closed' }
};

const STATUS_OPTIONS = ['new', 'contacted', 'quoted', 'closed'];

/**
 * AdminInquiries — B2B inquiry/lead management panel.
 */
export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating, setUpdating] = useState(null); // inquiry ID being updated
  const [countryInterest, setCountryInterest] = useState([]);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const [data, interest] = await Promise.all([
        getInquiries({ status: statusFilter }),
        getCountryInterestSummary(12).catch(() => [])
      ]);
      setInquiries(data);
      setCountryInterest(interest);
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [statusFilter]);

  const handleStatusChange = async (inquiry, newStatus) => {
    setUpdating(inquiry.id);
    try {
      await updateInquiryStatus(inquiry.id, { status: newStatus });
      setInquiries(prev => prev.map(inq =>
        inq.id === inquiry.id ? { ...inq, status: newStatus } : inq
      ));
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // Counts per status
  const statusCounts = inquiries.reduce((acc, inq) => {
    acc[inq.status] = (acc[inq.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wider">
            B2B Inquiries & Leads
          </h3>
          <p className="text-xs text-brand-gray-500">
            {inquiries.length} total inquiries received
          </p>
        </div>
      </div>

      {/* Country interest — learned from inquiries (what each market looks for) */}
      {countryInterest.length > 0 && (
        <div className="bg-white border border-brand-gray-200 rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <FiGlobe className="text-brand-red-600 text-sm" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-gray-700">
              Market interest (learned)
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {countryInterest.slice(0, 6).map((row) => (
              <div
                key={row.country}
                className="rounded-lg border border-brand-gray-100 bg-brand-gray-50 px-2.5 py-2"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-bold text-brand-gray-900">
                    {row.countryName || row.country}
                  </span>
                  <span className="font-mono text-[10px] text-brand-gray-500">
                    {row.inquiryCount ?? '—'} leads
                  </span>
                </div>
                <p className="text-[10px] text-brand-gray-600 mt-1 line-clamp-2">
                  {row.topCategoryName || row.topCategories?.[0]?.id || 'Categories learning…'}
                  {row.topProductName ? ` · ${row.topProductName}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-brand-gray-900 text-white'
              : 'bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200'
          }`}
        >
          All ({inquiries.length})
        </button>
        {STATUS_OPTIONS.map(status => {
          const config = STATUS_COLORS[status];
          const count = statusCounts[status] || 0;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === status
                  ? `${config.bg} ${config.text} border ${config.border}`
                  : 'bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200'
              }`}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Inquiries Table */}
      <div className="bg-white border border-brand-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-gray-200 bg-brand-gray-50 text-brand-gray-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3 hidden md:table-cell">Business</th>
                <th className="py-2.5 px-3 hidden sm:table-cell">Phone</th>
                <th className="py-2.5 px-3 hidden md:table-cell">Market</th>
                <th className="py-2.5 px-3 hidden lg:table-cell">Incoterm</th>
                <th className="py-2.5 px-3 hidden lg:table-cell">Destination</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="py-3 px-3">
                      <div className="h-4 bg-brand-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-brand-gray-400">
                      <FiInbox className="text-2xl" />
                      <span className="text-xs">No inquiries found</span>
                    </div>
                  </td>
                </tr>
              ) : inquiries.map((inq) => {
                const config = STATUS_COLORS[inq.status] || STATUS_COLORS.new;
                return (
                  <tr key={inq.id} className="hover:bg-brand-gray-50 transition-colors">
                    <td className="py-2.5 px-3 text-brand-gray-500 font-mono text-[10px] whitespace-nowrap">
                      {formatDate(inq.created_at)}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-brand-gray-900 line-clamp-1 max-w-[200px]">
                        {inq.product_name || '—'}
                      </div>
                      {inq.category_name && (
                        <div className="text-[10px] text-brand-gray-400 mt-0.5">{inq.category_name}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-brand-gray-700 hidden md:table-cell">
                      {inq.business_name || '—'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-brand-gray-700 hidden sm:table-cell whitespace-nowrap">
                      {inq.country_code} {inq.phone || '—'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-brand-gray-800 hidden md:table-cell">
                      {inq.market_country || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-brand-gray-700 font-mono hidden lg:table-cell">
                      {inq.incoterm || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-brand-gray-700 hidden lg:table-cell">
                      {inq.destination_port || '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq, e.target.value)}
                        disabled={updating === inq.id}
                        className={`text-[10px] font-bold px-2 py-1 rounded border cursor-pointer focus:outline-none disabled:opacity-50 ${config.bg} ${config.text} ${config.border}`}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>
                            {STATUS_COLORS[s].label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {inquiries.length > 0 && (
          <div className="border-t border-brand-gray-200 bg-brand-gray-50 px-4 py-2.5 text-xs text-brand-gray-500">
            Showing {inquiries.length} inquiries
            {statusFilter !== 'all' && ` (filtered: ${STATUS_COLORS[statusFilter]?.label})`}
          </div>
        )}
      </div>

    </div>
  );
}
