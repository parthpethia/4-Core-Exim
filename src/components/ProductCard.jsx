import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InterestedButton from './InterestedButton';
import companyData from '../data/company.json';
import { FiGlobe, FiPackage, FiShield, FiSliders, FiMail, FiX } from 'react-icons/fi';

/**
 * ProductCard component for B2B Catalog.
 * @param {Object} props
 * @param {Object} props.product - The product object
 * @param {string} props.categoryName - Human readable category name
 * @param {string} props.companyEmail - Email address for enquiries
 */
export default function ProductCard({ product, categoryName, companyEmail }) {
  const {
    name,
    price,
    currency,
    brand,
    manufacturer,
    strength,
    packagingSize,
    packagingType,
    saltComposition,
    countryOfOrigin,
    minimumOrderQuantity,
    storage,
    treatment,
    description,
    images,
    specifications = {}
  } = product;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = (images && images[activeImageIndex]) || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80';

  // Modal State Variables
  const [showModal, setShowModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [businessName, setBusinessName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [modalAction, setModalAction] = useState('');

  const handleModalSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    
    // In a live system, this would send an API request (e.g. to a backend or CRM)
    // To simulate B2B lead capture, we log the parameters.
    console.log("B2B Lead Captured:", {
      product: name,
      category: categoryName,
      action: modalAction,
      phone: `${countryCode} ${phoneNumber}`,
      business: businessName || 'Not Provided',
      timestamp: new Date().toISOString()
    });
  };

  const productImage = (images && images[0]) || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80';

  return (
    <div className="w-full bg-white border border-brand-gray-200 rounded-xl shadow-premium hover:shadow-premium-hover hover:border-brand-red-100 transition-all duration-300 overflow-hidden mb-6">
      
      {/* Header Block (Full Width) */}
      <div className="bg-brand-gray-50/80 px-6 py-4 border-b border-brand-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-red-500 bg-brand-red-50 px-2.5 py-0.5 rounded border border-brand-red-100/50">
              {categoryName}
            </span>
            {brand && (
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-gray-700 bg-brand-gray-200/60 px-2.5 py-0.5 rounded border border-brand-gray-300/40">
                Brand: {brand}
              </span>
            )}
          </div>
          <h3 className="text-lg font-black text-brand-gray-900 mt-2">{name}</h3>
        </div>
        
        {/* Request Callback Link */}
        <button
          onClick={() => {
            setShowModal(true);
            setModalAction('callback');
          }}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-brand-red-500 text-brand-red-500 hover:bg-brand-red-500 hover:text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shrink-0 cursor-pointer shadow-sm self-start sm:self-center"
        >
          Request Callback
        </button>
      </div>

      {/* Main Content Layout (Horizontal Split on Large Screens) */}
      <div className="p-6 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Image Showcase (approx 35% width) */}
        <div className="w-full lg:w-[35%] shrink-0 flex flex-col items-center">
          
          {/* Main Large Image Container */}
          <div className="w-full h-56 sm:h-64 border border-brand-gray-200 rounded-xl bg-white p-4 flex items-center justify-center relative overflow-hidden shadow-inner group">
            <img
              src={activeImage}
              alt={name}
              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>

          {/* Thumbnails Row */}
          {images && images.length > 1 && (
            <div className="flex flex-wrap gap-2 mt-3.5 justify-center">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-10 h-10 border-2 rounded-lg p-1 bg-white hover:border-brand-red-400 transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'border-brand-red-500 shadow-sm' : 'border-brand-gray-200'
                  }`}
                  aria-label={`View ${name} image ${idx + 1}`}
                >
                  <img src={img} alt={`${name} thumbnail ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Get Best Quote Button under the image */}
          <button
            onClick={() => {
              setShowModal(true);
              setModalAction('quote');
            }}
            className="mt-4 w-full px-4 py-2 border border-brand-gray-300 hover:border-brand-red-500 text-brand-gray-800 hover:text-brand-red-500 text-xs font-bold rounded-lg transition-all bg-white hover:bg-brand-red-50/20 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
          >
            <FiMail />
            <span>Get Best Quote</span>
          </button>
        </div>

        {/* Right Column: Specs Sheet & Price Details (occupies remainder width) */}
        <div className="flex-grow w-full space-y-4">
          
          {/* Price Block */}
          <div className="flex items-baseline justify-between gap-4 border-b border-brand-gray-150 pb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-brand-red-600">
                {currency} {price}
              </span>
              <span className="text-xs text-brand-gray-750 font-bold">/ Unit</span>
              <button
                onClick={() => {
                  setShowModal(true);
                  setModalAction('price');
                }}
                className="text-xs text-brand-red-500 hover:text-brand-red-600 font-extrabold hover:underline ml-2"
              >
                Get Latest Price
              </button>
            </div>
          </div>

          {/* Specifications Table (Vertical Rows, Left-Aligned Label) */}
          <div className="divide-y divide-brand-gray-100">
            {brand && (
              <div className="flex py-1.5 text-xs">
                <span className="text-brand-gray-700 font-bold w-1/3 sm:w-1/4 shrink-0">Brand Name</span>
                <span className="text-brand-gray-955 font-semibold flex-1">{brand}</span>
              </div>
            )}
            {strength && (
              <div className="flex py-1.5 text-xs">
                <span className="text-brand-gray-700 font-bold w-1/3 sm:w-1/4 shrink-0">Strength</span>
                <span className="text-brand-gray-955 font-semibold flex-1">{strength}</span>
              </div>
            )}
            {packagingSize && (
              <div className="flex py-1.5 text-xs">
                <span className="text-brand-gray-700 font-bold w-1/3 sm:w-1/4 shrink-0">Packaging Size</span>
                <span className="text-brand-gray-955 font-semibold flex-1">{packagingSize} {packagingType ? `(${packagingType})` : ''}</span>
              </div>
            )}
            {manufacturer && (
              <div className="flex py-1.5 text-xs">
                <span className="text-brand-gray-700 font-bold w-1/3 sm:w-1/4 shrink-0">Manufactured By</span>
                <span className="text-brand-gray-955 font-semibold flex-1">{manufacturer}</span>
              </div>
            )}
            {saltComposition && (
              <div className="flex py-1.5 text-xs">
                <span className="text-brand-gray-700 font-bold w-1/3 sm:w-1/4 shrink-0">Composition</span>
                <span className="text-brand-gray-955 font-semibold flex-1">{saltComposition}</span>
              </div>
            )}
            {treatment && (
              <div className="flex py-1.5 text-xs">
                <span className="text-brand-gray-700 font-bold w-1/3 sm:w-1/4 shrink-0">Treatment</span>
                <span className="text-brand-gray-955 font-semibold flex-1 leading-relaxed">{treatment}</span>
              </div>
            )}
            {storage && (
              <div className="flex py-1.5 text-xs">
                <span className="text-brand-gray-700 font-bold w-1/3 sm:w-1/4 shrink-0">Storage</span>
                <span className="text-brand-gray-955 font-semibold flex-1 leading-relaxed">{storage}</span>
              </div>
            )}
            {minimumOrderQuantity && (
              <div className="flex py-1.5 text-xs">
                <span className="text-brand-gray-700 font-bold w-1/3 sm:w-1/4 shrink-0">Minimum Order</span>
                <span className="text-brand-gray-955 font-semibold flex-1">{minimumOrderQuantity}</span>
              </div>
            )}
            {countryOfOrigin && (
              <div className="flex py-1.5 text-xs">
                <span className="text-brand-gray-700 font-bold w-1/3 sm:w-1/4 shrink-0">Country of Origin</span>
                <span className="text-brand-gray-955 font-semibold flex-1">{countryOfOrigin}</span>
              </div>
            )}
            {/* Dynamic Specifications */}
            {Object.entries(specifications).map(([key, value]) => (
              <div key={key} className="flex py-1.5 text-xs">
                <span className="text-brand-gray-700 font-bold w-1/3 sm:w-1/4 shrink-0">{key}</span>
                <span className="text-brand-gray-955 font-semibold flex-1 leading-relaxed">{value}</span>
              </div>
            ))}
          </div>

          {/* Description Paragraph */}
          {description && (
            <p className="text-xs text-brand-gray-700 leading-relaxed font-medium pt-2">
              {description}
            </p>
          )}

          {/* Call to Action Row */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-auto min-w-[200px]">
              <InterestedButton
                productName={name}
                categoryName={categoryName}
                companyEmail={companyEmail}
                label="Yes! I am interested"
                onClick={() => {
                  setShowModal(true);
                  setModalAction('interest');
                }}
              />
            </div>
            <span className="text-[10px] text-brand-gray-750 flex items-center gap-1.5 shrink-0 bg-brand-gray-50 px-3 py-2 rounded-lg border border-brand-gray-200">
              <FiShield className="text-green-600 inline shrink-0" /> Verified Export Grade
            </span>
          </div>

        </div>

      </div>

      {/* Inquiry Modal Overlay */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-[1.5px] p-4"
          >
            {/* Backdrop click dismiss */}
            <div 
              className="absolute inset-0 cursor-pointer"
              onClick={() => {
                setShowModal(false);
                setIsSubmitted(false);
                setPhoneNumber('');
                setBusinessName('');
              }}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
              className="relative bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-brand-gray-200 z-10"
            >
              
              {/* Close Button */}
              <button 
                onClick={() => {
                  setShowModal(false);
                  setIsSubmitted(false);
                  setPhoneNumber('');
                  setBusinessName('');
                }}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white border border-brand-gray-200 shadow-sm hover:bg-brand-gray-50 flex items-center justify-center text-brand-gray-700 hover:text-brand-gray-955 transition-all cursor-pointer text-xl font-bold"
                aria-label="Close modal"
              >
                <FiX />
              </button>

              {/* Left Panel: Summary */}
              <div className="hidden md:flex md:w-[38%] bg-brand-gray-50 p-6 flex-col justify-between border-r border-brand-gray-150">
                <div className="space-y-4">
                  <div className="w-full h-32 border border-brand-gray-200 bg-white rounded-xl p-2.5 flex items-center justify-center overflow-hidden">
                    <img src={productImage} alt={name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-brand-gray-900 leading-snug">{name}</h4>
                    <div className="mt-2 flex items-baseline gap-1 text-[11px]">
                      <span className="text-brand-red-600 font-extrabold text-xs">{currency} {price}</span>
                      <span className="text-brand-gray-700">/ Unit</span>
                    </div>
                    <p className="text-[10px] text-brand-gray-500 mt-1">Sold By - {companyData.name}</p>
                  </div>
                </div>

                {/* Specs Summary */}
                <div className="space-y-1.5 pt-3.5 border-t border-brand-gray-200 text-[10px]">
                  {strength && (
                    <div className="flex justify-between">
                      <span className="text-brand-gray-600 font-bold">Strength:</span>
                      <span className="text-brand-gray-900 font-extrabold">{strength}</span>
                    </div>
                  )}
                  {packagingSize && (
                    <div className="flex justify-between">
                      <span className="text-brand-gray-650 font-bold">Pack Size:</span>
                      <span className="text-brand-gray-955 font-extrabold">{packagingSize}</span>
                    </div>
                  )}
                  {brand && (
                    <div className="flex justify-between">
                      <span className="text-brand-gray-600 font-bold">Brand:</span>
                      <span className="text-brand-gray-900 font-extrabold">{brand}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel: Form */}
              <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center min-h-[350px]">
                {!isSubmitted ? (
                  <form onSubmit={handleModalSubmit} className="space-y-4">
                    <div>
                      <span className="text-[9px] font-extrabold text-[#00a29a] uppercase tracking-widest block mb-1">Wholesale Trade Inquiry</span>
                      <h3 className="text-base font-black text-brand-gray-955 leading-snug">
                        Get Best Price <span className="text-brand-gray-600 font-normal">and details from</span> "{companyData.name}" <span className="text-brand-gray-600 font-normal">on your mobile quickly</span>
                      </h3>
                    </div>

                    <div className="space-y-3.5">
                      {/* Mobile Input */}
                      <div>
                        <label className="block text-[10px] font-extrabold text-brand-gray-700 uppercase tracking-wider mb-1.5">Mobile Number *</label>
                        <div className="flex rounded-lg border border-brand-gray-200 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-[#00a29a]/20 focus-within:border-[#00a29a] transition-all bg-brand-gray-50/50">
                          <select 
                            value={countryCode} 
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="bg-brand-gray-100 border-r border-brand-gray-200 text-xs px-2.5 py-2 font-bold text-brand-gray-900 focus:outline-none cursor-pointer"
                          >
                            <option value="+91">🇮🇳 +91</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+61">🇦🇺 +61</option>
                            <option value="+971">🇦🇪 +971</option>
                            <option value="+63">🇵🇭 +63</option>
                            <option value="+254">🇰🇪 +254</option>
                          </select>
                          <input
                            type="tel"
                            required
                            pattern="[0-9]{8,12}"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Enter your mobile"
                            className="flex-1 bg-white text-xs font-bold text-brand-gray-955 px-3 py-2 focus:outline-none"
                          />
                        </div>
                        <p className="text-[9px] text-brand-gray-600 mt-1.5 italic">We will contact you on this number</p>
                      </div>

                      {/* Business Info (Optional) */}
                      <div>
                        <label className="block text-[10px] font-extrabold text-brand-gray-700 uppercase tracking-wider mb-1.5">Business Name or Email (Optional)</label>
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. Globamed Distributors"
                          className="w-full bg-brand-gray-50 border border-brand-gray-200 focus:bg-white focus:ring-2 focus:ring-[#00a29a]/20 focus:border-[#00a29a] rounded-lg p-2.5 text-xs text-brand-gray-950 focus:outline-none transition-all font-semibold"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#00a29a] hover:bg-[#00918a] text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Submit Now
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-4 space-y-4 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-green-50 border border-green-150 flex items-center justify-center text-green-600 text-2xl font-bold">
                      ✓
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-brand-gray-950">Inquiry Submitted!</h3>
                      <p className="text-xs text-brand-gray-700 mt-1 max-w-xs leading-relaxed font-semibold">
                        Thank you. Our sales desk will reach you at <strong className="text-brand-gray-955">{countryCode} {phoneNumber}</strong> via Call/WhatsApp shortly.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setIsSubmitted(false);
                        setPhoneNumber('');
                        setBusinessName('');
                      }}
                      className="px-4 py-2 bg-brand-gray-900 hover:bg-brand-gray-955 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-sm"
                    >
                      Close Window
                    </button>
                  </div>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
