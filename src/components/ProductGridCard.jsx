import { FiMail, FiShield } from 'react-icons/fi';

/**
 * ProductGridCard component for B2B Grid Showcase.
 * Displays product details in a clean, vertical card format.
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
    saltComposition,
    countryOfOrigin,
    minimumOrderQuantity,
    images
  } = product;

  const productImage = (images && images[0]) || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80';

  // Extract Pharmacopeial monograph if available
  let pharmacopeia = 'IP';
  if (name.includes('USP') || (saltComposition && saltComposition.includes('USP'))) pharmacopeia = 'USP';
  else if (name.includes('BP') || (saltComposition && saltComposition.includes('BP'))) pharmacopeia = 'BP';

  const handleInquiry = (e) => {
    e.preventDefault();
    
    const subject = `B2B Export Inquiry - ${name}`;
    const body = `Hello 4Core Exim Sales Desk,

I would like to request an export quote and Minimum Order Quantity (MOQ) for the following product:

Product: ${name}
Brand: ${brand || 'Standard Formulation'}
Category: ${categoryName}
Pharmacopeial Standard: ${pharmacopeia}

Please share FOB Mumbai / CIF export pricing and batch Certificate of Analysis (CoA) details.

Regards`;

    const mailtoUrl = `mailto:${companyEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="flex flex-col bg-white border border-brand-gray-200 rounded-lg shadow-sm hover:border-brand-gray-300 transition-colors overflow-hidden h-full">
      {/* Product Image Section */}
      <div className="h-44 bg-brand-gray-50 flex items-center justify-center p-3 border-b border-brand-gray-200 relative shrink-0">
        <img
          src={productImage}
          alt={name}
          className="max-h-full max-w-full object-contain mix-blend-multiply"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 flex gap-1">
          <span className="bg-white border border-brand-gray-200 text-brand-gray-800 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
            {categoryName}
          </span>
          <span className="bg-brand-gray-100 border border-brand-gray-200 text-brand-gray-700 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
            {pharmacopeia}
          </span>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-grow flex flex-col justify-between text-xs">
        <div>
          {/* Brand & Name */}
          <div className="mb-2">
            {brand && (
              <span className="text-[10px] uppercase font-bold text-brand-red-700 tracking-wider block">
                {brand}
              </span>
            )}
            <h3 className="text-xs font-bold text-brand-gray-900 line-clamp-2 mt-0.5" title={name}>
              {name}
            </h3>
            {manufacturer && (
              <p className="text-[11px] text-brand-gray-500 mt-0.5">
                Mfg: <span className="font-semibold text-brand-gray-700">{manufacturer}</span>
              </p>
            )}
          </div>

          {/* Pricing Info */}
          <div className="my-2 py-1.5 border-y border-brand-gray-150">
            <span className="text-[10px] text-brand-gray-500 uppercase font-semibold tracking-wider block">
              Indicative Export Price
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-bold text-brand-red-700 font-mono">
                {currency} {price}
              </span>
              <span className="text-[10px] text-brand-gray-500 font-medium">/ Unit</span>
            </div>
          </div>

          {/* Active Composition Box */}
          {saltComposition && (
            <div className="bg-brand-gray-50 border border-brand-gray-200 rounded p-2 mb-3">
              <span className="text-[9px] font-bold text-brand-gray-500 uppercase tracking-wide block">
                Active Ingredient
              </span>
              <p className="text-[11px] text-brand-gray-800 font-medium line-clamp-2 leading-snug">
                {saltComposition}
              </p>
            </div>
          )}

          {/* Specifications Sheet */}
          <div className="space-y-1 text-[11px] text-brand-gray-700 mb-3">
            {strength && (
              <div className="flex justify-between border-b border-brand-gray-100 pb-1">
                <span className="text-brand-gray-500">Strength:</span>
                <span className="font-mono font-semibold text-brand-gray-900">{strength}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-brand-gray-100 pb-1">
              <span className="text-brand-gray-500">Packing:</span>
              <span className="font-semibold text-brand-gray-900">{packagingSize}</span>
            </div>
            <div className="flex justify-between border-b border-brand-gray-100 pb-1">
              <span className="text-brand-gray-500">Min Order:</span>
              <span className="font-mono font-semibold text-brand-gray-900">{minimumOrderQuantity || 'Contact Trade Desk'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-gray-500">Origin:</span>
              <span className="font-semibold text-brand-gray-900">{countryOfOrigin}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-2">
          <button
            onClick={handleInquiry}
            className="flex items-center justify-center gap-1.5 w-full py-2 bg-brand-red-600 hover:bg-brand-red-700 text-white text-xs font-bold rounded transition-colors cursor-pointer"
            aria-label={`Get Quote for ${name}`}
          >
            <FiMail className="text-xs shrink-0" />
            <span>Request Quote (RFQ)</span>
          </button>
          <span className="text-[10px] text-emerald-700 text-center mt-1.5 block font-semibold flex items-center justify-center gap-1">
            <FiShield className="inline text-xs shrink-0" /> Wholesale Export Batch
          </span>
        </div>
      </div>
    </div>
  );
}
