import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CategoryGrid from '../components/CategoryGrid';
import ProductGridCard from '../components/ProductGridCard';
import { getCategories, getCompanyInfo, getProducts } from '../services/productService';
import {
  FiCheckSquare, FiTruck, FiFileText, FiAward,
  FiArrowRight, FiPhone, FiMail, FiMapPin,
  FiClock, FiSend, FiShield
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [company, setCompany] = useState(null);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    country: '',
    message: ''
  });

  useEffect(() => {
    async function loadData() {
      const cats = await getCategories();
      const comp = await getCompanyInfo();
      const prods = await getProducts();
      setCategories(cats);
      setCompany(comp);
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

    const subject = `Bulk Product Inquiry - ${formData.organization || formData.name}`;
    const body = `Hello 4Core Exim Sales Desk,

I would like to submit a B2B wholesale inquiry.

Sender Details:
Name: ${formData.name}
Email: ${formData.email}
Phone/Mobile: ${formData.phone || 'Not Provided'}
Organization: ${formData.organization || 'Not Specified'}
Country: ${formData.country}

Inquiry Message:
${formData.message}

Regards`;

    const mailtoUrl = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleFeaturedQuote = (productName, categoryName) => {
    if (!company) return;

    const subject = `Featured Product Enquiry - ${productName}`;
    const body = `Hello,

I am interested in obtaining a bulk quote for your featured product:

Product: ${productName}
Category: ${categoryName}

Please share pricing, MOQ, and export terms (FOB/CIF).

Regards`;

    const mailtoUrl = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const featureList = [
    {
      icon: <FiAward className="text-2xl" />,
      title: "Quality Assurance",
      description: "We source formulation batches strictly from WHO-GMP, EU-GMP, and US-FDA compliant manufacturers."
    },
    {
      icon: <FiTruck className="text-2xl" />,
      title: "Cold-Chain Logistics",
      description: "Dedicated temp-controlled warehousing and refrigerated transit pipelines for biologicals and vaccines."
    },
    {
      icon: <FiFileText className="text-2xl" />,
      title: "Dossier & DMF Support",
      description: "Provision of detailed regulatory documentation including CoA, stability test sheets, and custom files."
    },
    {
      icon: <FiCheckSquare className="text-2xl" />,
      title: "100% Genuine Supplies",
      description: "Direct official distribution chains eliminate counterfeit risks, providing authentic pharmaceutical shipments."
    }
  ];

  return (
    <div className="bg-brand-gray-50/50">

      {/* Category Quick Nav Bar */}
      <section className="bg-white border-b border-brand-gray-200 py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-red-500 mb-6 bg-brand-red-50 px-3 py-1 rounded-full border border-brand-red-100">
              Browse Wholesale Therapeutic Segments
            </span>
            <CategoryGrid categories={categories} />
          </div>
        </div>
      </section>

      {/* 3-Column Banner Section (Featured Products / Brand Banner) */}
      <section className="py-8 bg-brand-gray-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1: Featured Injectable */}
            <div className="bg-white border border-brand-gray-200 rounded-xl p-5 shadow-premium flex flex-col justify-between hover:shadow-premium-hover hover:border-brand-red-100 transition-all duration-300">
              <div>
                <span className="text-[9px] uppercase font-bold text-brand-red-500 tracking-wider">Top Featured Formulation</span>
                <h3 className="text-base font-extrabold text-brand-gray-900 mt-1">Meropenem Injection IP 1g</h3>
                <p className="text-[11px] text-brand-gray-700 font-semibold mt-0.5">Brand: Meroza 1g (Alkem Labs)</p>
                <div className="flex gap-4 items-center my-4">
                  <img
                    src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=400&auto=format&fit=crop&q=80"
                    alt="Meropenem Injection"
                    className="w-20 h-20 object-contain mix-blend-multiply bg-brand-gray-50 p-2 rounded-lg border border-brand-gray-150"
                  />
                  <div className="text-xs space-y-1 text-brand-gray-800">
                    <p><strong>Salt:</strong> Meropenem Sterile IP</p>
                    <p><strong>MOQ:</strong> 200 Vials</p>
                    <p><strong>Price:</strong> USD 24.00/Vial</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleFeaturedQuote("Meropenem Injection IP 1g", "Pharmaceutical Injections")}
                className="w-full py-2 bg-brand-red-500 hover:bg-brand-red-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FiMail /> Get Best Quote
              </button>
            </div>

            {/* Card 2: Featured Capsule */}
            <div className="bg-white border border-brand-gray-200 rounded-xl p-5 shadow-premium flex flex-col justify-between hover:shadow-premium-hover hover:border-brand-red-100 transition-all duration-300">
              <div>
                <span className="text-[9px] uppercase font-bold text-brand-red-500 tracking-wider">Top Featured Formulation</span>
                <h3 className="text-base font-extrabold text-brand-gray-900 mt-1">Pregabalin Capsules 300mg</h3>
                <p className="text-[11px] text-brand-gray-700 font-semibold mt-0.5">Brand: Pregarica (Healing Pharma)</p>
                <div className="flex gap-4 items-center my-4">
                  <img
                    src="https://images.unsplash.com/photo-1626847037657-fd3622613ce3?w=400&auto=format&fit=crop&q=80"
                    alt="Pregabalin Capsules"
                    className="w-20 h-20 object-contain mix-blend-multiply bg-brand-gray-50 p-2 rounded-lg border border-brand-gray-150"
                  />
                  <div className="text-xs space-y-1 text-brand-gray-800">
                    <p><strong>Salt:</strong> Pregabalin IP 300mg</p>
                    <p><strong>MOQ:</strong> 50 Boxes</p>
                    <p><strong>Price:</strong> USD 18.00/Box</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleFeaturedQuote("Pregabalin Capsules 300mg", "Pharmaceutical Capsules")}
                className="w-full py-2 bg-brand-red-500 hover:bg-brand-red-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FiMail /> Get Best Quote
              </button>
            </div>

            {/* Card 3: Brand Promo / Logo Banner */}
            <div className="bg-gradient-to-br from-brand-gray-900 via-brand-gray-900 to-brand-red-950 text-white border border-brand-gray-800 rounded-xl p-5 shadow-premium flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red-500/10 rounded-full filter blur-2xl pointer-events-none"></div>
              <div>
                <span className="text-[9px] uppercase font-bold text-brand-red-500 tracking-wider">Wholesale Export Desk</span>
                <h3 className="text-lg font-black mt-1 text-white leading-tight">4Core Exim</h3>
                <p className="text-xs text-brand-gray-300 font-semibold mt-0.5">By Thakkar Medico Traders</p>

                <div className="my-4 space-y-2 text-xs text-brand-gray-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-brand-red-500 rounded-full shrink-0"></span>
                    <span>WHO-GMP, FDA Sourced Batches</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-brand-red-500 rounded-full shrink-0"></span>
                    <span>Refrigerated Cold Chain Logistics</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-brand-red-500 rounded-full shrink-0"></span>
                    <span>Regulatory Dossiers & DMF Support</span>
                  </div>
                </div>
              </div>

              <Link
                to="/catalog"
                className="w-full py-2 border border-brand-red-500/50 hover:border-brand-red-500 text-center font-bold text-xs rounded-lg bg-brand-red-500/10 hover:bg-brand-red-500 text-white transition-all cursor-pointer block"
              >
                Browse Entire Catalog
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Welcome & Trust Section */}
      {company && (
        <section className="py-16 bg-white border-y border-brand-gray-150">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

              {/* Left Column: Welcome Intro */}
              <div className="lg:col-span-5">
                <span className="text-xs font-extrabold uppercase tracking-widest text-brand-red-500 block mb-2">
                  Welcome to
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-gray-900 tracking-tight leading-tight">
                  {company.name}
                </h2>
                <p className="text-xs font-bold text-brand-gray-700 mt-1 uppercase tracking-wider border-b border-brand-gray-100 pb-3">
                  {company.subtitle}
                </p>
                <p className="text-sm text-brand-gray-700 leading-relaxed font-medium mt-4">
                  {company.aboutFull.intro}
                </p>
                <p className="text-sm text-brand-gray-700 leading-relaxed font-medium mt-3">
                  {company.aboutFull.sourcing}
                </p>
                <div className="mt-6">
                  <a
                    href="#inquiry-form"
                    className="inline-flex items-center justify-center px-6 py-3 bg-brand-red-500 hover:bg-brand-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    Submit Bulk Enquiry
                  </a>
                </div>
              </div>

              {/* Right Column: B2B Trust Features Grid */}
              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {featureList.map((feature, idx) => (
                    <div
                      key={idx}
                      className="bg-brand-gray-50/50 p-5 rounded-xl border border-brand-gray-200 hover:border-brand-red-100 hover:bg-white transition-all duration-300"
                    >
                      <div className="mb-3 inline-block bg-brand-red-50 p-2.5 rounded-lg border border-brand-red-100/50 text-brand-red-500 animate-pulse">
                        {feature.icon}
                      </div>
                      <h3 className="text-sm font-bold text-brand-gray-900 mb-1.5">{feature.title}</h3>
                      <p className="text-xs text-brand-gray-700 leading-relaxed font-medium">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Products Showcase by Category */}
      <section className="py-16 bg-brand-gray-50/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          <div className="border-b border-brand-gray-200 pb-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-red-500">
              Bulk Export Inventory
            </span>
            <h2 className="text-2xl font-black text-brand-gray-900 mt-1">
              Products & Services
            </h2>
          </div>

          {categories
            .filter(cat => getProductsByCategory(cat.id).length > 0)
            .map(cat => {
              const catProducts = getProductsByCategory(cat.id);
              return (
                <div key={cat.id} className="space-y-4">
                  {/* Category Title & View All */}
                  <div className="flex justify-between items-end border-b border-brand-gray-200 pb-2">
                    <h3 className="text-base font-extrabold text-brand-gray-900 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-brand-red-500 rounded-full inline-block"></span>
                      {cat.name}
                    </h3>
                    <Link
                      to="/catalog"
                      state={{ selectedCategory: cat.id }}
                      className="text-xs font-bold text-brand-red-500 hover:text-brand-red-600 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All</span>
                      <FiArrowRight />
                    </Link>
                  </div>

                  {/* Grid of Products */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
        <section id="inquiry-form" className="py-16 bg-white border-t border-brand-gray-150">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="mb-10 border-b border-brand-gray-200 pb-5">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-red-500 font-semibold">Contact Trade Office</span>
              <h2 className="text-3xl font-black text-brand-gray-900 mt-1">Submit B2B Bulk Inquiry</h2>
              <p className="text-sm text-brand-gray-700 mt-2 font-medium">
                Reach out directly to verify lead times, dispatch options, labeling custom profiles, and batch stability analysis data.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">

              {/* Left Column: Office details */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-brand-gray-50/50 border border-brand-gray-200 rounded-xl p-6 shadow-premium">
                  <h3 className="text-base font-bold text-brand-gray-900 mb-5 border-b border-brand-gray-200 pb-2">
                    Office Coordinates
                  </h3>

                  <div className="space-y-4">
                    {/* Address */}
                    <div className="flex gap-3 text-xs">
                      <div className="w-8 h-8 rounded bg-brand-red-50 border border-brand-red-100 flex items-center justify-center shrink-0 text-brand-red-500">
                        <FiMapPin />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-gray-700 uppercase tracking-wider">Registered Address</h4>
                        <p className="text-brand-gray-900 mt-0.5 font-semibold leading-relaxed">{company.address}</p>
                      </div>
                    </div>

                    {/* Telephone */}
                    <div className="flex gap-3 text-xs">
                      <div className="w-8 h-8 rounded bg-brand-red-50 border border-brand-red-100 flex items-center justify-center shrink-0 text-brand-red-500">
                        <FiPhone />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-gray-700 uppercase tracking-wider">Trade Telephone</h4>
                        <a href={`tel:${company.phone.replace(/\s+/g, '')}`} className="text-brand-red-600 mt-0.5 font-bold block hover:underline">
                          {company.phone}
                        </a>
                      </div>
                    </div>

                    {/* Corporate Email */}
                    <div className="flex gap-3 text-xs">
                      <div className="w-8 h-8 rounded bg-brand-red-50 border border-brand-red-100 flex items-center justify-center shrink-0 text-brand-red-500">
                        <FiMail />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-gray-700 uppercase tracking-wider">Trade Email</h4>
                        <a href={`mailto:${company.email}`} className="text-brand-red-600 mt-0.5 font-bold block hover:underline">
                          {company.email}
                        </a>
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div className="flex gap-3 text-xs">
                      <div className="w-8 h-8 rounded bg-green-50 border border-green-150 flex items-center justify-center shrink-0 text-green-600">
                        <FaWhatsapp className="text-base" />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-gray-700 uppercase tracking-wider">WhatsApp Trade Desk</h4>
                        <a
                          href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-700 mt-0.5 font-bold block hover:underline"
                        >
                          {company.whatsapp}
                        </a>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="flex gap-3 text-xs">
                      <div className="w-8 h-8 rounded bg-brand-gray-150 border border-brand-gray-200 flex items-center justify-center shrink-0 text-brand-gray-700">
                        <FiClock />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-gray-700 uppercase tracking-wider">Office Hours</h4>
                        <p className="text-brand-gray-900 mt-0.5 font-semibold">{company.businessHours}</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* B2B wholesale disclaimer */}
                <div className="bg-brand-gray-900 text-white rounded-xl p-5 border border-brand-gray-800 shadow-md">
                  <span className="text-[9px] uppercase tracking-widest font-extrabold text-brand-red-500 block mb-1">Corporate Notice</span>
                  <h4 className="text-xs font-bold mb-1.5">B2B Sourcing Only</h4>
                  <p className="text-[10px] text-brand-gray-300 leading-relaxed font-medium">
                    We coordinate batches exclusively for wholesale distributors, export firms, pharmacies, and global medical agencies. We require active corporate credentials and local drug import licenses to finalize bulk deliveries.
                  </p>
                </div>
              </div>

              {/* Right Column: Inquiry Form Card */}
              <div className="lg:col-span-7">
                <div className="bg-white border border-brand-gray-200 rounded-xl p-6 shadow-premium">
                  <h3 className="text-base font-bold text-brand-gray-900 mb-5 border-b border-brand-gray-100 pb-2">
                    Submit Digital Inquiry
                  </h3>

                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-brand-gray-700 uppercase mb-1">Contact Name *</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleFormChange}
                          placeholder="e.g. John Doe"
                          className="w-full bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-2.5 text-xs text-brand-gray-950 focus:outline-none focus:ring-2 focus:ring-brand-red-500/20 focus:border-brand-red-500 transition-all font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-brand-gray-700 uppercase mb-1">Corporate Email *</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleFormChange}
                          placeholder="e.g. buyer@company.com"
                          className="w-full bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-2.5 text-xs text-brand-gray-950 focus:outline-none focus:ring-2 focus:ring-brand-red-500/20 focus:border-brand-red-500 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-brand-gray-700 uppercase mb-1">Mobile / Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleFormChange}
                          placeholder="e.g. +1 555 123 4567"
                          className="w-full bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-2.5 text-xs text-brand-gray-950 focus:outline-none focus:ring-2 focus:ring-brand-red-500/20 focus:border-brand-red-500 transition-all font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-brand-gray-700 uppercase mb-1">Pharmacy / Organization *</label>
                        <input
                          type="text"
                          name="organization"
                          required
                          value={formData.organization}
                          onChange={handleFormChange}
                          placeholder="e.g. Globamed Distributors Ltd"
                          className="w-full bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-2.5 text-xs text-brand-gray-950 focus:outline-none focus:ring-2 focus:ring-brand-red-500/20 focus:border-brand-red-500 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-gray-700 uppercase mb-1">Destination Country *</label>
                      <input
                        type="text"
                        name="country"
                        required
                        value={formData.country}
                        onChange={handleFormChange}
                        placeholder="e.g. Philippines, Peru, Kenya"
                        className="w-full bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-2.5 text-xs text-brand-gray-950 focus:outline-none focus:ring-2 focus:ring-brand-red-500/20 focus:border-brand-red-500 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-gray-700 uppercase mb-1">Requirement Details *</label>
                      <textarea
                        name="message"
                        required
                        rows="4"
                        value={formData.message}
                        onChange={handleFormChange}
                        placeholder="Describe target products, strength, required packaging configurations, target MOQ, dossier support profiles, and shipping terms..."
                        className="w-full bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-2.5 text-xs text-brand-gray-950 focus:outline-none focus:ring-2 focus:ring-brand-red-500/20 focus:border-brand-red-500 transition-all font-medium resize-y"
                      ></textarea>
                    </div>

                    <div className="pt-1">
                      <button
                        type="submit"
                        className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-2.5 bg-brand-red-500 hover:bg-brand-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
                      >
                        <FiSend />
                        <span>Send Inquiry Email</span>
                      </button>
                      <span className="text-[9px] text-brand-gray-750 mt-1.5 block italic">
                        * Submitting opens your local system mail client to complete delivery.
                      </span>
                    </div>
                  </form>

                </div>
              </div>

            </div>

            {/* Embed Map Coordinates */}
            {company.googleMapsEmbedUrl && (
              <div className="w-full bg-white border border-brand-gray-200 rounded-xl overflow-hidden shadow-premium">
                <div className="p-4 border-b border-brand-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                    <FiMapPin className="text-brand-red-500" /> Map Coordinates
                  </span>
                  <span className="text-[10px] font-bold text-brand-gray-700 uppercase tracking-wider bg-brand-gray-150 px-2 py-0.5 rounded">
                    4 Core Exim, Nagpur, Maharashtra, India
                  </span>
                </div>
                <div className="w-full h-72 relative">
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
