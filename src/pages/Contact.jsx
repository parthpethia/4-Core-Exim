import React, { useState, useEffect } from 'react';
import { getCompanyInfo } from '../services/productService';
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend, FiGlobe } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function Contact() {
  const [company, setCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    country: '',
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
      <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center">
        <p className="text-sm font-semibold text-brand-gray-700">Loading contact coordinates...</p>
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
    
    const subject = `General B2B Inquiry - ${formData.organization || formData.name}`;
    const body = `Hello 4Core Exim Sales Desk,

I would like to submit a B2B enquiry.

Sender Details:
Name: ${formData.name}
Email: ${formData.email}
Organization: ${formData.organization || 'Not Specified'}
Country: ${formData.country}

Inquiry Message:
${formData.message}

Please get in touch at your earliest convenience.

Regards`;

    const mailtoUrl = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="bg-brand-gray-50/50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-10 border-b border-brand-gray-200 pb-5">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-red-500 font-semibold">Connect With Us</span>
          <h1 className="text-3xl font-black text-brand-gray-900 mt-1">Export Desk & Trade Offices</h1>
          <p className="text-sm text-brand-gray-700 mt-2 font-medium">
            Contact our trade team directly for quotes, certifications, container dispatch options, and custom packaging queries.
          </p>
        </div>

        {/* Contact Page Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Coordinate Cards */}
            <div className="bg-white border border-brand-gray-200 rounded-xl p-6 shadow-premium">
              <h3 className="text-lg font-bold text-brand-gray-900 mb-5 border-b border-brand-gray-100 pb-2 flex items-center gap-2">
                Office Information
              </h3>
              
              <div className="space-y-4">
                {/* Address Card */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-red-50 border border-brand-red-100 flex items-center justify-center shrink-0 text-brand-red-500">
                    <FiMapPin className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gray-700">Registered Office Address</h4>
                    <p className="text-xs text-brand-gray-900 mt-1 font-semibold leading-relaxed">{company.address}</p>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-red-50 border border-brand-red-100 flex items-center justify-center shrink-0 text-brand-red-500">
                    <FiPhone className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gray-700">Telephone / Fax</h4>
                    <a href={`tel:${company.phone.replace(/\s+/g, '')}`} className="text-xs text-brand-red-600 mt-1 font-semibold block hover:underline">
                      {company.phone}
                    </a>
                  </div>
                </div>

                {/* Email Card */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-red-50 border border-brand-red-100 flex items-center justify-center shrink-0 text-brand-red-500">
                    <FiMail className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gray-700">Corporate Email</h4>
                    <a href={`mailto:${company.email}`} className="text-xs text-brand-red-600 mt-1 font-semibold block hover:underline">
                      {company.email}
                    </a>
                  </div>
                </div>

                {/* WhatsApp Trade Desk */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-150 flex items-center justify-center shrink-0 text-green-600">
                    <FaWhatsapp className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gray-700">WhatsApp Export Desk</h4>
                    <a 
                      href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-700 mt-1 font-semibold block hover:underline"
                    >
                      {company.whatsapp}
                    </a>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-gray-100 border border-brand-gray-200 flex items-center justify-center shrink-0 text-brand-gray-700">
                    <FiClock className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gray-700">Business Hours</h4>
                    <p className="text-xs text-brand-gray-900 mt-1 font-semibold">{company.businessHours}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick trade notice */}
            <div className="bg-brand-gray-900 text-white rounded-xl p-5 border border-brand-gray-800 shadow-lg relative overflow-hidden">
              <span className="text-[9px] uppercase tracking-widest font-extrabold text-brand-red-500 block mb-1">Corporate Notice</span>
              <h4 className="text-xs font-bold mb-2">B2B Sourcing Only</h4>
              <p className="text-[10px] text-brand-gray-300 leading-relaxed font-medium">
                Please note that 4Core Exim works exclusively in wholesale distribution. We do not service retail buyers, retail prescriptions, or individual pharmacy walk-ins. We require active corporate credentials and local drug import licensing profiles to complete bulk shipments.
              </p>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-brand-gray-200 rounded-xl p-6 shadow-premium">
              <h3 className="text-lg font-bold text-brand-gray-900 mb-5 border-b border-brand-gray-100 pb-2 flex items-center gap-2">
                Submit Trade Enquiry
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-gray-700 uppercase mb-1">Contact Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
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
                      onChange={handleChange}
                      placeholder="e.g. buyer@company.com"
                      className="w-full bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-2.5 text-xs text-brand-gray-950 focus:outline-none focus:ring-2 focus:ring-brand-red-500/20 focus:border-brand-red-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-gray-700 uppercase mb-1">Organization / Pharmacy *</label>
                    <input
                      type="text"
                      name="organization"
                      required
                      value={formData.organization}
                      onChange={handleChange}
                      placeholder="e.g. Globamed Distributors Ltd"
                      className="w-full bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-2.5 text-xs text-brand-gray-950 focus:outline-none focus:ring-2 focus:ring-brand-red-500/20 focus:border-brand-red-500 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-gray-700 uppercase mb-1">Destination Country *</label>
                    <input
                      type="text"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="e.g. Philippines, Peru, Kenya"
                      className="w-full bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-2.5 text-xs text-brand-gray-950 focus:outline-none focus:ring-2 focus:ring-brand-red-500/20 focus:border-brand-red-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-gray-700 uppercase mb-1">Inquiry / Requirements Message *</label>
                  <textarea
                    name="message"
                    required
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe target products, strength, required packing size, target MOQ, documentation support (DMF/Dossiers), and target shipping terms (FOB/CIF)..."
                    className="w-full bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-2.5 text-xs text-brand-gray-950 focus:outline-none focus:ring-2 focus:ring-brand-red-500/20 focus:border-brand-red-500 transition-all font-medium resize-y"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-brand-red-500 hover:bg-brand-red-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <FiSend className="text-sm shrink-0" />
                    <span>Send Inquiry Email</span>
                  </button>
                  <span className="text-[10px] text-brand-gray-700 mt-2 block italic leading-none">
                    * Submitting will open your default email app to complete sending.
                  </span>
                </div>
              </form>

            </div>
          </div>

        </div>

        {/* Google Maps Placement */}
        {company.googleMapsEmbedUrl && (
          <div className="w-full bg-white border border-brand-gray-200 rounded-xl overflow-hidden shadow-premium">
            <div className="p-4 border-b border-brand-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-brand-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                <FiMapPin className="text-brand-red-500" /> Geographic Location
              </span>
              <span className="text-[10px] font-bold text-brand-gray-700 uppercase tracking-wider bg-brand-gray-100 px-2 py-0.5 rounded">
                Mumbai Central, India
              </span>
            </div>
            <div className="w-full h-80 relative">
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
