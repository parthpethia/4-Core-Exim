import React from 'react';
import { FiMail, FiShield, FiPackage, FiGlobe } from 'react-icons/fi';

/**
 * ProductGridCard component for B2B Grid Showcase.
 * Displays product details in a vertical card format.
 * @param {Object} props
 * @param {Object} props.product - The product object
 * @param {string} props.categoryName - Human readable category name
 * @param {string} props.companyEmail - Email address for B2B enquiries
 */
export default function ProductGridCard({ product, categoryName, companyEmail }) {
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
    treatment,
    images
  } = product;

  const productImage = (images && images[0]) || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80';

  const handleInquiry = (e) => {
    e.preventDefault();
    
    const subject = `Product Enquiry - ${name}`;
    const body = `Hello,

I am interested in the following product.

Product: ${name}
Brand: ${brand}
Category: ${categoryName}

Please share MOQ, pricing, and export details.

Regards`;

    const mailtoUrl = `mailto:${companyEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="flex flex-col bg-white border border-brand-gray-200 rounded-xl shadow-premium hover:shadow-premium-hover hover:border-brand-red-100 transition-all duration-300 overflow-hidden h-full">
      {/* Product Image Section */}
      <div className="h-48 bg-brand-gray-50 flex items-center justify-center p-4 border-b border-brand-gray-100 relative group shrink-0">
        <img
          src={productImage}
          alt={name}
          className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <span className="absolute top-2 left-2 bg-brand-gray-200 text-brand-gray-800 text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
          {categoryName}
        </span>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          {/* Brand & Name */}
          <div className="mb-2">
            <span className="text-[10px] uppercase font-bold text-brand-red-500 tracking-wider">
              {brand}
            </span>
            <h3 className="text-sm font-bold text-brand-gray-900 line-clamp-2 mt-0.5" title={name}>
              {name}
            </h3>
            <p className="text-[10px] text-brand-gray-700 italic">
              Mfg: <span className="font-semibold">{manufacturer}</span>
            </p>
          </div>

          {/* Pricing Info */}
          <div className="my-2 py-1.5 border-y border-brand-gray-100">
            <span className="text-[10px] text-brand-gray-700 uppercase font-medium tracking-wide block">
              Indicative Price
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-extrabold text-brand-red-600">
                {currency} {price}
              </span>
              <span className="text-[10px] text-brand-gray-700 font-semibold">/ Unit</span>
            </div>
          </div>

          {/* Active Composition Box */}
          {saltComposition && (
            <div className="bg-brand-red-50/40 border border-brand-red-100/50 rounded-lg px-2 py-1.5 mb-3">
              <span className="text-[9px] font-bold text-brand-red-600 uppercase tracking-wide block">
                Active Salt
              </span>
              <p className="text-xs text-brand-gray-950 font-medium line-clamp-2 leading-tight">
                {saltComposition}
              </p>
            </div>
          )}

          {/* Bulleted Specifications */}
          <div className="space-y-1.5 text-xs text-brand-gray-800 mb-4">
            {strength && (
              <div className="flex justify-between border-b border-dashed border-brand-gray-100 pb-1">
                <span className="text-brand-gray-750 font-medium">Strength:</span>
                <span className="font-bold text-brand-gray-950 text-right">{strength}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-dashed border-brand-gray-100 pb-1">
              <span className="text-brand-gray-750 font-medium">Packing:</span>
              <span className="font-bold text-brand-gray-950 text-right">{packagingSize}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-brand-gray-100 pb-1">
              <span className="text-brand-gray-750 font-medium">Min Order:</span>
              <span className="font-bold text-brand-gray-950 text-right">{minimumOrderQuantity || 'Contact Us'}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-brand-gray-750 font-medium">Origin:</span>
              <span className="font-bold text-brand-gray-950 text-right">{countryOfOrigin}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-2">
          <button
            onClick={handleInquiry}
            className="flex items-center justify-center gap-1.5 w-full py-2 bg-brand-red-500 hover:bg-brand-red-600 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
            aria-label={`Get Quote for ${name}`}
          >
            <FiMail className="text-sm shrink-0" />
            <span>Get Quote</span>
          </button>
          <span className="text-[9px] text-brand-gray-700 text-center mt-1.5 block flex items-center justify-center gap-1">
            <FiShield className="text-green-600 inline shrink-0" /> Wholesale Export Only
          </span>
        </div>
      </div>
    </div>
  );
}
