import React, { useState, useEffect } from 'react';
import { getCompanyInfo } from '../services/productService';
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import PageSEO from '../components/PageSEO';

export default function Contact() {
  const [company, setCompany] = useState(null);
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
    async function loadConfig() {
      const comp = await getCompanyInfo();
      setCompany(comp);
    }
    loadConfig();
  }, []);

  if (!company) {
    return (
      <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center p-8">
        <div className="w-full max-w-xl space-y-4">
          <div className="w-48 h-6 shimmer rounded"></div>
          <div className="w-full h-24 shimmer rounded-lg"></div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const subject = `B2B Wholesale Inquiry - ${formData.organization || formData.name}`;
    const body = `Hello 4Core Exim Sales Desk,

I would like to submit a B2B export enquiry.

Sender Details:
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not Provided'}
Organization: ${formData.organization || 'Not Specified'}
Destination Country: ${formData.country}
Target Incoterm: ${formData.incoterm}
Destination Port: ${formData.destinationPort || 'Not Specified'}

Inquiry Message:
${formData.message}

Please get in touch at your earliest convenience.

Regards`;

    const mailtoUrl = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="bg-brand-gray-50 min-h-screen py-12">
      <PageSEO
        title="Contact 4Core Exim — Pharmaceutical Export Inquiry & RFQ"
        description="Submit wholesale medicine export inquiries to 4Core Exim. Direct trade desk for quotations, MOQ, proforma invoices, batch CoA verification. WhatsApp: +91 91460 65002."
        path="/contact"
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="bg-white border border-brand-gray-200 rounded-lg p-8 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-green-600 block mb-2">
            Direct Trade Contacts
          </span>
          <h1 className="text-3xl font-bold text-brand-gray-900 tracking-tight">Export Desk & Trade Offices</h1>
          <p className="text-xs text-brand-gray-600 mt-2">
            Contact our international pharmaceutical sales team directly for proforma invoices, export quotations, batch CoA verification, and shipping arrangements.
          </p>
        </div>

        {/* Contact Page Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Office coordinates */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-white border border-brand-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gray-900 mb-4 border-b border-brand-gray-200 pb-2">
                Trade Office Information
              </h3>
              
              <div className="space-y-4 text-xs">
                {/* Address Card */}
                <div className="flex gap-3">
                  <FiMapPin className="text-brand-green-600 text-sm shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-brand-gray-500 uppercase text-[10px]">Registered Office Address</h4>
                    <p className="text-brand-gray-900 mt-0.5 font-medium leading-relaxed">{company.address}</p>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="flex gap-3">
                  <FiPhone className="text-brand-green-600 text-sm shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-brand-gray-500 uppercase text-[10px]">Trade Telephone</h4>
                    <a href={`tel:${company.phone.replace(/\s+/g, '')}`} className="text-brand-gray-900 hover:text-brand-green-600 mt-0.5 font-mono font-bold block">
                      {company.phone}
                    </a>
                  </div>
                </div>

                {/* Email Card */}
                <div className="flex gap-3">
                  <FiMail className="text-brand-green-600 text-sm shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-brand-gray-500 uppercase text-[10px]">Corporate Export Email</h4>
                    <a href={`mailto:${company.email}`} className="text-brand-gray-900 hover:text-brand-green-600 mt-0.5 font-medium block">
                      {company.email}
                    </a>
                  </div>
                </div>

                {/* WhatsApp Trade Desk */}
                <div className="flex gap-3">
                  <FaWhatsapp className="text-emerald-600 text-base shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-brand-gray-500 uppercase text-[10px]">WhatsApp Trade Desk</h4>
                    <a 
                      href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 font-mono font-bold block hover:underline"
                    >
                      {company.whatsapp}
                    </a>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex gap-3">
                  <FiClock className="text-brand-gray-500 text-sm shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-brand-gray-500 uppercase text-[10px]">Business Hours</h4>
                    <p className="text-brand-gray-900 mt-0.5 font-medium">{company.businessHours}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Notice */}
            <div className="bg-brand-gray-900 text-white rounded-lg p-5 border border-brand-gray-800 text-xs">
              <span className="text-[10px] uppercase font-bold text-brand-green-400 block mb-1">Corporate Notice</span>
              <h4 className="font-bold mb-1">B2B Wholesale Operations Only</h4>
              <p className="text-brand-gray-300 leading-relaxed">
                4Core Exim operates exclusively in wholesale distribution and export consignment supply. We do not service retail inquiries, personal prescriptions, or consumer walk-ins.
              </p>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-brand-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gray-900 mb-4 border-b border-brand-gray-200 pb-2">
                Submit Trade Enquiry (RFQ)
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-brand-gray-700 font-bold mb-1">Contact Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      className="w-full bg-brand-gray-50 border border-brand-gray-300 rounded px-3 py-2 text-brand-gray-900 focus:outline-none focus:border-brand-green-600 focus:ring-1 focus:ring-brand-green-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-gray-700 font-bold mb-1">Corporate Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. buyer@distributor.com"
                      className="w-full bg-brand-gray-50 border border-brand-gray-300 rounded px-3 py-2 text-brand-gray-900 focus:outline-none focus:border-brand-green-600 focus:ring-1 focus:ring-brand-green-600 font-medium"
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
                      onChange={handleChange}
                      placeholder="e.g. +1 555 123 4567"
                      className="w-full bg-brand-gray-50 border border-brand-gray-300 rounded px-3 py-2 text-brand-gray-900 focus:outline-none focus:border-brand-green-600 focus:ring-1 focus:ring-brand-green-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-gray-700 font-bold mb-1">Organization / Pharmacy *</label>
                    <input
                      type="text"
                      name="organization"
                      required
                      value={formData.organization}
                      onChange={handleChange}
                      placeholder="e.g. Globamed Distributors Ltd"
                      className="w-full bg-brand-gray-50 border border-brand-gray-300 rounded px-3 py-2 text-brand-gray-900 focus:outline-none focus:border-brand-green-600 focus:ring-1 focus:ring-brand-green-600 font-medium"
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
                      onChange={handleChange}
                      placeholder="e.g. Philippines, Peru"
                      className="w-full bg-brand-gray-50 border border-brand-gray-300 rounded px-3 py-2 text-brand-gray-900 focus:outline-none focus:border-brand-green-600 focus:ring-1 focus:ring-brand-green-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-gray-700 font-bold mb-1">Target Incoterm</label>
                    <select
                      name="incoterm"
                      value={formData.incoterm}
                      onChange={handleChange}
                      className="w-full bg-brand-gray-50 border border-brand-gray-300 rounded px-3 py-2 text-brand-gray-900 focus:outline-none focus:border-brand-green-600 focus:ring-1 focus:ring-brand-green-600 font-medium"
                    >
                      <option value="FOB">FOB (Mumbai / JNPT)</option>
                      <option value="CIF">CIF (Destination Port)</option>
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
                      onChange={handleChange}
                      placeholder="e.g. Manila, Callao"
                      className="w-full bg-brand-gray-50 border border-brand-gray-300 rounded px-3 py-2 text-brand-gray-900 focus:outline-none focus:border-brand-green-600 focus:ring-1 focus:ring-brand-green-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-brand-gray-700 font-bold mb-1">Inquiry / Requirement Details *</label>
                  <textarea
                    name="message"
                    required
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="List required formulations, strength, target volume (MOQ), packaging preferences, stability data requirements, etc."
                    className="w-full bg-brand-gray-50 border border-brand-gray-300 rounded px-3 py-2 text-brand-gray-900 focus:outline-none focus:border-brand-green-600 focus:ring-1 focus:ring-brand-green-600 font-medium resize-y"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-green-600 hover:bg-brand-green-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer shadow-sm"
                  >
                    <FiSend className="text-xs" />
                    <span>Send Commercial Inquiry</span>
                  </button>
                </div>
              </form>

            </div>
          </div>

        </div>

        {/* Office Map */}
        {company.googleMapsEmbedUrl && (
          <div className="w-full bg-white border border-brand-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="p-3 border-b border-brand-gray-200 flex items-center justify-between text-xs font-bold text-brand-gray-900">
              <span className="flex items-center gap-1.5">
                <FiMapPin className="text-brand-green-600" /> Geographic Location
              </span>
              <span className="text-brand-gray-500 font-mono text-[11px]">
                4Core Exim, Nagpur / Mumbai, India
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
    </div>
  );
}
