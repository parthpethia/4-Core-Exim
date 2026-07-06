import React from 'react';
import InterestedButton from './InterestedButton';
import { FiCheckCircle, FiGlobe, FiPackage, FiShield, FiSliders } from 'react-icons/fi';

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

  const productImage = (images && images[0]) || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80';

  return (
    <div className="w-full bg-white border border-brand-gray-200 rounded-xl shadow-premium hover:shadow-premium-hover hover:border-brand-red-100 transition-all duration-300 overflow-hidden mb-6">
      <div className="flex flex-col lg:flex-row">
        
        {/* Left Column: Product Image */}
        <div className="lg:w-1/4 min-w-[200px] bg-brand-gray-50 flex items-center justify-center p-6 border-b lg:border-b-0 lg:border-r border-brand-gray-100 relative group">
          <img
            src={productImage}
            alt={name}
            className="w-40 h-40 object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <span className="absolute top-3 left-3 bg-brand-gray-200 text-brand-gray-800 text-xs px-2.5 py-1 rounded-full font-medium">
            {categoryName}
          </span>
        </div>

        {/* Middle Column: Core Info & Specs */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            {/* Title & Brand */}
            <div className="mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-brand-red-500">{brand}</span>
              <h3 className="text-xl font-bold text-brand-gray-900 mt-0.5">{name}</h3>
              <p className="text-xs text-brand-gray-700 mt-1 italic">
                Mfg by: <span className="font-semibold">{manufacturer}</span>
              </p>
            </div>

            {/* Salt / Composition Badge */}
            {saltComposition && (
              <div className="bg-brand-red-50/50 border border-brand-red-100/60 rounded-lg p-2.5 mb-4">
                <span className="text-xs font-bold text-brand-red-600 block uppercase tracking-wide">Active Composition</span>
                <span className="text-sm text-brand-gray-800 font-medium">{saltComposition}</span>
              </div>
            )}

            {/* Grid of Key Product Details */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-brand-gray-700 mb-4">
              <div>
                <span className="text-brand-gray-700 block font-medium">Strength:</span>
                <span className="text-brand-gray-900 font-semibold">{strength || 'N/A'}</span>
              </div>
              <div>
                <span className="text-brand-gray-700 block font-medium">Packaging:</span>
                <span className="text-brand-gray-900 font-semibold">{packagingSize} ({packagingType || 'Pack'})</span>
              </div>
              <div>
                <span className="text-brand-gray-700 block font-medium">Treatment:</span>
                <span className="text-brand-gray-900 font-semibold line-clamp-1">{treatment || 'N/A'}</span>
              </div>
              <div>
                <span className="text-brand-gray-700 block font-medium">Storage:</span>
                <span className="text-brand-gray-900 font-semibold line-clamp-1">{storage || 'N/A'}</span>
              </div>
            </div>

            {/* Dynamic/Additional Specifications */}
            {Object.keys(specifications).length > 0 && (
              <div className="mt-4 pt-3 border-t border-brand-gray-100">
                <h4 className="text-xs font-bold text-brand-gray-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <FiSliders className="text-brand-red-500" /> Additional Specifications
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5">
                  {Object.entries(specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between md:justify-start items-center text-xs py-0.5 border-b border-dashed border-brand-gray-100 last:border-b-0">
                      <span className="text-brand-gray-700 font-medium md:w-36">{key}:</span>
                      <span className="text-brand-gray-900 font-semibold text-right md:text-left flex-1">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Brief Description */}
          {description && (
            <p className="text-xs text-brand-gray-700 mt-4 line-clamp-2 bg-brand-gray-50/50 p-2 rounded border border-brand-gray-100">
              {description}
            </p>
          )}
        </div>

        {/* Right Column: Pricing & Call To Action */}
        <div className="lg:w-1/4 bg-brand-gray-50/70 p-6 flex flex-col justify-between items-stretch lg:items-center border-t lg:border-t-0 lg:border-l border-brand-gray-100 text-center">
          
          {/* Price Label */}
          <div className="mb-4 lg:my-auto text-left lg:text-center w-full">
            <span className="text-xs text-brand-gray-700 block uppercase font-medium tracking-wide">Indicative Wholesale Price</span>
            <div className="flex items-baseline justify-start lg:justify-center gap-1 mt-1">
              <span className="text-2xl font-extrabold text-brand-red-600">
                {currency} {price}
              </span>
              <span className="text-xs text-brand-gray-700 font-semibold">/ Unit</span>
            </div>
            
            {/* MOQ and Origin Badges */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-brand-gray-800 justify-start lg:justify-center bg-white px-3 py-1.5 rounded-lg border border-brand-gray-200 shadow-sm">
                <FiPackage className="text-brand-red-500 shrink-0" />
                <span>MOQ: <strong className="text-brand-gray-900 font-bold">{minimumOrderQuantity || 'Contact Us'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-gray-800 justify-start lg:justify-center bg-white px-3 py-1.5 rounded-lg border border-brand-gray-200 shadow-sm">
                <FiGlobe className="text-brand-red-500 shrink-0" />
                <span>Origin: <strong className="text-brand-gray-900 font-bold">{countryOfOrigin}</strong></span>
              </div>
            </div>
          </div>

          {/* Inquiry CTA Button */}
          <div className="w-full mt-2">
            <InterestedButton
              productName={name}
              categoryName={categoryName}
              companyEmail={companyEmail}
            />
            <span className="text-[10px] text-brand-gray-700 mt-2 block flex items-center justify-center gap-1">
              <FiShield className="text-green-600 inline shrink-0" /> Verified Export Formulation
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
