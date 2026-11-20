import React, { useState, useEffect } from 'react';
import { FiSave, FiLoader, FiCheckCircle } from 'react-icons/fi';
import { getCompanyInfo, updateCompanySettings } from '../../services/productService';
import { useCompany } from '../../context/CompanyContext';

/**
 * AdminCompanySettings — Edit form for company configuration.
 */
export default function AdminCompanySettings() {
  const { refreshCompany } = useCompany();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCompanyInfo();
        setForm({
          name: data.name || '',
          subtitle: data.subtitle || '',
          email: data.email || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          address: data.address || '',
          businessHours: data.businessHours || '',
          googleMapsEmbedUrl: data.googleMapsEmbedUrl || '',
          aboutShort: data.aboutShort || '',
          aboutFull: {
            intro: data.aboutFull?.intro || '',
            sourcing: data.aboutFull?.sourcing || '',
            supplyChain: data.aboutFull?.supplyChain || '',
            compliance: data.aboutFull?.compliance || ''
          }
        });
      } catch (err) {
        setError('Failed to load company settings.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSuccess(false);
  };

  const handleAboutChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      aboutFull: { ...prev.aboutFull, [field]: value }
    }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      await updateCompanySettings(form);
      if (refreshCompany) {
        await refreshCompany();
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save company settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center text-brand-gray-400 text-xs">
        <FiLoader className="animate-spin mr-2" /> Loading company settings...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="py-8 text-center text-brand-gray-400 text-xs">
        Unable to load company settings.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wider">
            Company Settings
          </h3>
          <p className="text-xs text-brand-gray-500">
            Edit company information displayed across the website.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-green-600 hover:bg-brand-green-700 text-white text-xs font-bold rounded transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
        >
          {saving ? (
            <>
              <FiLoader className="text-xs animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <FiSave className="text-xs" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Success */}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center gap-2">
          <FiCheckCircle className="text-sm shrink-0" />
          Company settings saved successfully.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white border border-brand-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="text-xs font-bold text-brand-gray-900 uppercase tracking-wider border-b border-brand-gray-150 pb-2">
          Basic Information
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-brand-gray-600 mb-1">Company Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs text-brand-gray-900 font-semibold focus:outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-brand-gray-600 mb-1">Subtitle</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              className="w-full border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-brand-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-brand-gray-600 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-brand-gray-600 mb-1">WhatsApp</label>
            <input
              type="tel"
              value={form.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              className="w-full border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-brand-gray-600 mb-1">Business Address</label>
          <textarea
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            rows={2}
            className="w-full border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-brand-gray-600 mb-1">Business Hours</label>
            <input
              type="text"
              value={form.businessHours}
              onChange={(e) => handleChange('businessHours', e.target.value)}
              className="w-full border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-brand-gray-600 mb-1">Google Maps Embed URL</label>
            <input
              type="url"
              value={form.googleMapsEmbedUrl}
              onChange={(e) => handleChange('googleMapsEmbedUrl', e.target.value)}
              className="w-full border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs text-brand-gray-900 font-mono focus:outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500"
            />
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white border border-brand-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="text-xs font-bold text-brand-gray-900 uppercase tracking-wider border-b border-brand-gray-150 pb-2">
          About / Company Profile
        </div>

        <div>
          <label className="block text-[11px] font-bold text-brand-gray-600 mb-1">Short Description</label>
          <textarea
            value={form.aboutShort}
            onChange={(e) => handleChange('aboutShort', e.target.value)}
            rows={2}
            className="w-full border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-brand-gray-600 mb-1">Full Intro</label>
          <textarea
            value={form.aboutFull.intro}
            onChange={(e) => handleAboutChange('intro', e.target.value)}
            rows={3}
            className="w-full border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-brand-gray-600 mb-1">Sourcing</label>
          <textarea
            value={form.aboutFull.sourcing}
            onChange={(e) => handleAboutChange('sourcing', e.target.value)}
            rows={3}
            className="w-full border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-brand-gray-600 mb-1">Supply Chain</label>
          <textarea
            value={form.aboutFull.supplyChain}
            onChange={(e) => handleAboutChange('supplyChain', e.target.value)}
            rows={3}
            className="w-full border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-brand-gray-600 mb-1">Compliance</label>
          <textarea
            value={form.aboutFull.compliance}
            onChange={(e) => handleAboutChange('compliance', e.target.value)}
            rows={3}
            className="w-full border border-brand-gray-300 rounded px-2.5 py-1.5 text-xs text-brand-gray-900 focus:outline-none focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 resize-none"
          />
        </div>
      </div>

    </form>
  );
}
