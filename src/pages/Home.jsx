import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CategoryGrid from '../components/CategoryGrid';
import ProductGridCard from '../components/ProductGridCard';
import PageSEO from '../components/PageSEO';
import { getCategories, getProducts } from '../services/productService';
import { useCompany } from '../context/CompanyContext';
import { detectMarketCountry } from '../utils/marketLocation';
import {
  FiTruck, FiFileText, FiAward,
  FiArrowRight, FiPhone, FiMail, FiMapPin,
  FiClock, FiSend, FiGlobe
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function Home() {
  const { company } = useCompany();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    country: '',
    incoterm: 'FOB',
    destinationPort: '',
    message: ''
  });

  useEffect(() => {
    async function loadData() {
      const marketCountry = detectMarketCountry();
      const cats = await getCategories({ marketCountry });
      // Lean payloads + capped page for fast home paint
      const prods = await getProducts({ marketCountry, limit: 36, lean: true });
      setCategories(cats);
      setProducts(prods);
    }
    loadData();
  }, []);

  const getProductsByCategory = (catId) => {
    return products.filter(p => p.category === catId).slice(0, 5);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!company) return;

    const subject = `B2B Export Quotation Request - ${formData.organization || formData.name}`;
    const body = `Hello 4Core Exim Sales Desk,

I would like to submit a formal B2B wholesale quotation request.

Buyer & Corporate Coordinates:
Name: ${formData.name}
Corporate Email: ${formData.email}
Phone/WhatsApp: ${formData.phone || 'Not Provided'}
Organization: ${formData.organization || 'Not Specified'}
Destination Country: ${formData.country}
Target Incoterm: ${formData.incoterm}
Destination Discharge Port: ${formData.destinationPort || 'Standard International Hub'}

Product Requirements & Specification Notes:
${formData.message}

Please provide FOB Mumbai / CIF pricing, MOQ, and batch CoA availability.

Regards`;

    const mailtoUrl = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const tradeStandards = [
    {
      icon: <FiAward className="text-xl text-brand-red-600" />,
      title: "WHO-GMP Sourced Batches",
      description: "Procured strictly from licensed manufacturing sites complying with WHO-GMP, EU-GMP, and US-FDA quality protocols."
    },
    {
      icon: <FiTruck className="text-xl text-brand-red-600" />,
      title: "Cold-Chain Logistics",
      description: "Validated thermal packaging and calibrated USB/NFC dataloggers for biologicals, injectables, and vaccines (2°C - 8°C)."
    },
    {
      icon: <FiFileText className="text-xl text-brand-red-600" />,
      title: "Regulatory Dossiers & CoPP",
      description: "Complete technical documentation including Certificate of Analysis (CoA), Stability Sheets (Zone IVb), and CTD dossiers."
    },
    {
      icon: <FiGlobe className="text-xl text-brand-red-600" />,
      title: "Global Export Dispatch",
      description: "Direct routing from Mumbai Air Cargo (BOM) and Nhava Sheva Sea Port (JNPT) with full customs clearance management."
    }
  ];

  return (
    <div className="bg-brand-gray-50">

      <PageSEO
        title="4Core Exim — Pharmaceutical Exporter from India | WHO-GMP Medicines"
        description="Premier B2B pharmaceutical exporter from India. WHO-GMP certified generic, oncology, veterinary, and specialty medicines exported to 40+ countries. FOB Mumbai pricing."
        path="/"
      />

      {/* Category Quick Index Bar */}
      <section className="bg-white border-b border-brand-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-red-700 bg-brand-red-50 px-2.5 py-1 rounded border border-brand-red-100">
                Therapeutic Segments Index
              </span>
            </div>
            <CategoryGrid categories={categories} />
          </div>
        </div>
      </section>

      {/* Corporate Overview & Trade Standards Section */}
      {company && (
        <section className="py-14 bg-white border-b border-brand-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

              {/* Left Column: Corporate Intro */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-red-600">
                  Global Supply Infrastructure
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-brand-gray-900 tracking-tight">
                  {company.name}
                </h2>
                <p className="text-xs font-semibold text-brand-gray-500 uppercase tracking-wider">
                  {company.subtitle}
                </p>
                <p className="text-xs text-brand-gray-700 leading-relaxed font-normal">
                  {company.aboutFull.intro}
                </p>
                <p className="text-xs text-brand-gray-700 leading-relaxed font-normal">
                  {company.aboutFull.sourcing}
                </p>
                <div className="pt-2 flex gap-3">
                  <a
                    href="#inquiry-form"
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-brand-red-600 hover:bg-brand-red-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors shadow-sm cursor-pointer"
                  >
                    Submit RFQ Inquiry
                  </a>
                  <Link
                    to="/compliance"
                    className="inline-flex items-center justify-center px-5 py-2.5 border border-brand-gray-300 hover:bg-brand-gray-50 text-brand-gray-800 font-bold text-xs uppercase tracking-wider rounded transition-colors"
                  >
                    View QMS Specs
                  </Link>
                </div>
              </div>

              {/* Right Column: 4 Trade Standards */}
              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tradeStandards.map((std, idx) => (
                    <div
                      key={idx}
                      className="bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-4"
                    >
                      <div className="mb-2.5 inline-block bg-white p-2 rounded border border-brand-gray-200">
                        {std.icon}
                      </div>
                      <h3 className="text-xs font-bold text-brand-gray-900 mb-1">{std.title}</h3>
                      <p className="text-[11px] text-brand-gray-600 leading-relaxed">{std.description}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Products Showcase by Category */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="border-b border-brand-gray-200 pb-3 flex justify-between items-end">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-red-600 block">
                Wholesale Product Showcase
              </span>
              <h2 className="text-2xl font-bold text-brand-gray-900 mt-0.5">
                Export Formulations by Category
              </h2>
            </div>
            <Link
              to="/catalog"
              className="text-xs font-bold text-brand-red-600 hover:text-brand-red-700 flex items-center gap-1"
            >
              <span>View Full Index ({products.length} Items)</span>
              <FiArrowRight />
            </Link>
          </div>

          {categories
            .filter(cat => getProductsByCategory(cat.id).length > 0)
            .map(cat => {
              const catProducts = getProductsByCategory(cat.id);
              return (
                <div key={cat.id} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex justify-between items-center bg-white border border-brand-gray-200 rounded px-4 py-2.5">
                    <h3 className="text-xs font-bold text-brand-gray-900 flex items-center gap-2">
                      <span className="w-1.5 h-3 bg-brand-red-600 rounded-sm inline-block"></span>
                      <span>{cat.name}</span>
                    </h3>
                    <Link
                      to="/catalog"
                      state={{ selectedCategory: cat.id }}
                      className="text-[11px] font-bold text-brand-red-600 hover:text-brand-red-700 uppercase tracking-wider flex items-center gap-1"
                    >
                      <span>Explore Category</span>
                      <FiArrowRight />
                    </Link>
                  </div>

                  {/* Grid of Products */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                    {catProducts.map(product => (
                      <ProductGridCard
                        key={product.id}
                        product={product}
                        categoryName={cat.name}
                        companyEmail={company?.email || 'exports@4coreexim.com'}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* Inquiry Form Section & Contact Coordinates */}
      {company && (
        <section id="inquiry-form" className="py-14 bg-white border-t border-brand-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="mb-8 border-b border-brand-gray-200 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-red-600 block">
                B2B Trade Office Desk
              </span>
              <h2 className="text-2xl font-bold text-brand-gray-900 mt-0.5">Submit Commercial Quotation Request (RFQ)</h2>
              <p className="text-xs text-brand-gray-600 mt-1">
                Direct trade desk for verification of Minimum Order Quantities (MOQ), proforma invoices, custom labeling, and stability data.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">

              {/* Left Column: Trade coordinates */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gray-900 mb-4 border-b border-brand-gray-200 pb-2">
                    Trade Coordinates
                  </h3>

                  <div className="space-y-3.5 text-xs">
                    {/* Address */}
                    <div className="flex gap-3">
                      <FiMapPin className="text-brand-red-600 text-sm shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-brand-gray-500 uppercase text-[10px]">Registered Trade Office</h4>
                        <p className="text-brand-gray-900 mt-0.5 font-medium leading-relaxed">{company?.address || '4 Core Exim, Nagpur, India'}</p>
                      </div>
                    </div>

                    {/* Telephone */}
                    <div className="flex gap-3">
                      <FiPhone className="text-brand-red-600 text-sm shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-brand-gray-500 uppercase text-[10px]">Trade Desk Telephone</h4>
                        <a href={`tel:${(company?.phone || '+91 93253 03018').replace(/\s+/g, '')}`} className="text-brand-gray-900 hover:text-brand-red-600 mt-0.5 font-mono font-bold block">
                          {company?.phone || '+91 93253 03018'}
                        </a>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex gap-3">
                      <FiMail className="text-brand-red-600 text-sm shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-brand-gray-500 uppercase text-[10px]">Export Corporate Email</h4>
                        <a href={`mailto:${company?.email || 'exports@4coreexim.com'}`} className="text-brand-gray-900 hover:text-brand-red-600 mt-0.5 font-semibold block">
                          {company?.email || 'exports@4coreexim.com'}
                        </a>
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div className="flex gap-3">
                      <FaWhatsapp className="text-emerald-600 text-base shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-brand-gray-500 uppercase text-[10px]">WhatsApp Trade Desk</h4>
                        <a
                          href={`https://wa.me/${(company?.whatsapp || '+919325303018').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 font-mono font-bold block hover:underline"
                        >
                          {company?.whatsapp || '+91 93253 03018'}
                        </a>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="flex gap-3">
                      <FiClock className="text-brand-gray-500 text-sm shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-brand-gray-500 uppercase text-[10px]">Business Operating Hours</h4>
                        <p className="text-brand-gray-900 mt-0.5">{company?.businessHours || 'Mon - Sat: 11:00 AM - 8:00 PM (IST)'}</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* B2B Sourcing disclaimer */}
                <div className="bg-brand-gray-900 text-white rounded-lg p-4 border border-brand-gray-800 text-xs">
                  <span className="text-[10px] uppercase font-bold text-brand-red-500 block mb-1">Notice to Buyers</span>
                  <p className="text-brand-gray-300 leading-relaxed">
                    We coordinate batches exclusively for wholesale distributors, export firms, and hospital agencies holding active corporate credentials and local drug import licenses.
                  </p>
                </div>
              </div>

              {/* Right Column: Inquiry Form Card */}
              <div className="lg:col-span-7">
                <div className="bg-white border border-brand-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gray-900 mb-4 border-b border-brand-gray-200 pb-2">
                    Submit Digital RFQ Form
                  </h3>

                  <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-brand-gray-700 font-bold mb-1">Contact Name *</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleFormChange}
                          placeholder="e.g. Dr. Robert Vance"
                          className="w-full bg-brand-gray-50 border border-brand-gray-300 rounded px-3 py-2 text-brand-gray-900 focus:outline-none focus:border-brand-red-600 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-brand-gray-700 font-bold mb-1">Corporate Email *</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleFormChange}
                          placeholder="e.g. buyer@distributor.com"
                          className="w-full bg-brand-gray-50 border border-brand-gray-300 rounded px-3 py-2 text-brand-gray-900 focus:outline-none focus:border-brand-red-600 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-brand-gray-700 font-bold mb-1">Phone / WhatsApp Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleFormChange}
                          placeholder="e.g. +1 555 234 5678"
                          className="w-full bg-brand-gray-50 border border-brand-gray-300 rounded px-3 py-2 text-brand-gray-900 focus:outline-none focus:border-brand-red-600 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-brand-gray-700 font-bold mb-1">Organization / Pharmacy *</label>
                        <input
                          type="text"
                          name="organization"
                          required
                          value={formData.organization}
                          onChange={handleFormChange}
                          placeholder="e.g. Globamed Distributors Ltd"
                          className="w-full bg-brand-gray-50 border border-brand-gray-300 rounded px-3 py-2 text-brand-gray-900 focus:outline-none focus:border-brand-red-600 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-brand-gray-700 font-bold mb-1">Destination Country *</label>
                        <input
                          type="text"
                          name="country"
                          required
                          value={formData.country}
                          onChange={handleFormChange}
                          placeholder="e.g. Philippines, Peru, Kenya"
                          className="w-full bg-brand-gray-50 border border-brand-gray-300 rounded px-3 py-2 text-brand-gray-900 focus:outline-none focus:border-brand-red-600 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-brand-gray-700 font-bold mb-1">Target Incoterm</label>
                        <select
                          name="incoterm"
                          value={formData.incoterm}
                          onChange={handleFormChange}
                          className="w-full bg-brand-gray-50 border border-brand-gray-300 rounded px-3 py-2 text-brand-gray-900 focus:outline-none focus:border-brand-red-600 font-medium"
                        >
                          <option value="FOB">FOB (Mumbai / JNPT)</option>
                          <option value="CIF">CIF (Port of Discharge)</option>
                          <option value="CFR">CFR (Cost & Freight)</option>
                          <option value="EXW">EXW (Ex Works)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-brand-gray-700 font-bold mb-1">Destination Port</label>
                        <input
                          type="text"
                          name="destinationPort"
                          value={formData.destinationPort}
                          onChange={handleFormChange}
                          placeholder="e.g. Manila, Callao"
                          className="w-full bg-brand-gray-50 border border-brand-gray-300 rounded px-3 py-2 text-brand-gray-900 focus:outline-none focus:border-brand-red-600 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-brand-gray-700 font-bold mb-1">Target Products & Quantity *</label>
                      <textarea
                        name="message"
                        required
                        rows="3"
                        value={formData.message}
                        onChange={handleFormChange}
                        placeholder="List target medicines, strength, required packing size, target volume / MOQ, documentation support (DMF/Dossiers), etc."
                        className="w-full bg-brand-gray-50 border border-brand-gray-300 rounded px-3 py-2 text-brand-gray-900 focus:outline-none focus:border-brand-red-600 font-medium resize-y"
                      ></textarea>
                    </div>

                    <div className="pt-1">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-red-600 hover:bg-brand-red-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
                      >
                        <FiSend />
                        <span>Send Wholesale Inquiry</span>
                      </button>
                    </div>
                  </form>

                </div>
              </div>

            </div>

            {/* Google Maps Coordinates */}
            {company.googleMapsEmbedUrl && (
              <div className="w-full bg-white border border-brand-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="p-3 border-b border-brand-gray-200 flex items-center justify-between text-xs font-bold text-brand-gray-900">
                  <span className="flex items-center gap-1.5">
                    <FiMapPin className="text-brand-red-600" /> Geographic Location
                  </span>
                  <span className="text-brand-gray-500 font-mono text-[11px]">
                    4Core Exim, Nagpur / Mumbai, India
                  </span>
                </div>
                <div className="w-full h-64 relative">
                  <iframe
                    title="Office Location Map"
                    src={company.googleMapsEmbedUrl}
                    className="w-full h-full border-none"
                    allowFullScreen=""
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            )}

          </div>
        </section>
      )}

    </div>
  );
}
