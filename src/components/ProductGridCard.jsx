import { FiMail } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import OptimizedImage from './OptimizedImage';
import { resolveProductThumbnail } from '../utils/imageUrl';

/**
 * ProductGridCard — compact home showcase card with WhatsApp-first quote CTAs.
 */
export default function ProductGridCard({ product, categoryName, companyEmail, companyWhatsapp }) {
  const {
    name,
    price,
    currency,
    displayCurrency,
    priceInDisplay,
    brand,
    strength,
    packagingSize,
    saltComposition,
    minimumOrderQuantity
  } = product;

  const productImage = resolveProductThumbnail(product);
  const shownCurrency = displayCurrency || currency;
  const shownPrice = priceInDisplay != null ? priceInDisplay : price;

  let pharmacopeia = 'IP';
  if (name.includes('USP') || (saltComposition && saltComposition.includes('USP'))) pharmacopeia = 'USP';
  else if (name.includes('BP') || (saltComposition && saltComposition.includes('BP'))) pharmacopeia = 'BP';

  const whatsappNumber = (companyWhatsapp || '+919325303018').replace(/[^0-9]/g, '');
  const waBody = encodeURIComponent(
    `Hello 4Core Exim Trade Desk,\n\nI would like an export quote and MOQ for:\n\nProduct: ${name}\nBrand: ${brand || 'Standard Formulation'}\nCategory: ${categoryName}\nPacking: ${packagingSize || 'N/A'}\n\nPlease share FOB Mumbai / CIF pricing and batch CoA availability.`
  );

  const handleWhatsApp = (e) => {
    e.preventDefault();
    window.open(`https://wa.me/${whatsappNumber}?text=${waBody}`, '_blank', 'noopener,noreferrer');
  };

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
    <div className="flex flex-col bg-white border border-brand-gray-200/80 rounded-md hover:border-brand-gray-300 transition-colors overflow-hidden h-full">
      <div className="h-32 bg-brand-gray-50 flex items-center justify-center p-2.5 border-b border-brand-gray-100 relative shrink-0">
        <OptimizedImage
          src={productImage}
          alt={name}
          width={280}
          sizes="(max-width: 640px) 45vw, 180px"
          className="max-h-full max-w-full object-contain mix-blend-multiply"
        />
        <span className="absolute top-1.5 left-1.5 bg-white/95 border border-brand-gray-200 text-brand-gray-700 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
          {pharmacopeia}
        </span>
      </div>

      <div className="p-3 flex-grow flex flex-col justify-between text-xs">
        <div>
          {brand && (
            <span className="text-[9px] uppercase font-bold text-brand-red-700 tracking-wider block">
              {brand}
            </span>
          )}
          <h3 className="text-xs font-bold text-brand-gray-900 line-clamp-2 mt-0.5 leading-snug" title={name}>
            {name}
          </h3>

          <div className="mt-2 mb-2">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-brand-red-700 font-mono">
                {shownCurrency} {shownPrice}
              </span>
              <span className="text-[10px] text-brand-gray-500">/ unit</span>
            </div>
          </div>

          {saltComposition && (
            <p className="text-[10px] text-brand-gray-500 line-clamp-1 mb-2" title={saltComposition}>
              {saltComposition}
            </p>
          )}

          <div className="space-y-0.5 text-[10px] text-brand-gray-600 mb-2">
            {strength && (
              <div className="flex justify-between gap-2">
                <span className="text-brand-gray-500 shrink-0">Strength</span>
                <span className="font-mono font-semibold text-brand-gray-900 text-right truncate">{strength}</span>
              </div>
            )}
            <div className="flex justify-between gap-2">
              <span className="text-brand-gray-500 shrink-0">Packing</span>
              <span className="font-semibold text-brand-gray-900 text-right truncate">{packagingSize}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-brand-gray-500 shrink-0">MOQ</span>
              <span className="font-mono font-semibold text-brand-gray-900 text-right truncate">
                {minimumOrderQuantity || 'Ask desk'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-1 space-y-1.5">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-1.5 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded transition-colors cursor-pointer"
            aria-label={`WhatsApp quote for ${name}`}
          >
            <FaWhatsapp className="text-sm shrink-0" />
            <span>WhatsApp Quote</span>
          </button>
          <button
            type="button"
            onClick={handleInquiry}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 border border-brand-red-600 text-brand-red-700 hover:bg-brand-red-50 text-[11px] font-bold rounded transition-colors cursor-pointer"
            aria-label={`Email RFQ for ${name}`}
          >
            <FiMail className="text-xs shrink-0" />
            <span>Email RFQ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
