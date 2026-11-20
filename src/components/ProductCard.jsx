import React, { useState, useEffect, useRef } from 'react';
import InterestedButton from './InterestedButton';
import CoaModal from './CoaModal';
import OptimizedImage from './OptimizedImage';
import { submitInquiry, getProductById } from '../services/productService';
import { resolveProductThumbnail } from '../utils/imageUrl';
import { dialToMarket, DIAL_TO_ISO } from '../utils/countryInterestRank';
import { detectMarketCountry } from '../utils/marketLocation';
import { FiShield, FiMail, FiX, FiFileText, FiCheckCircle } from 'react-icons/fi';

const ISO_TO_DIAL = Object.fromEntries(
  Object.entries(DIAL_TO_ISO).map(([dial, iso]) => [iso, dial])
);

function dialForMarket(code) {
  const iso = (code || detectMarketCountry() || 'AE').toUpperCase();
  return ISO_TO_DIAL[iso] || '+971';
}

/**
 * ProductCard component for B2B Catalog.
 * Starts from a lean list payload, then hydrates full detail when scrolled into view.
 */
export default function ProductCard({ product: initialProduct, categoryName, companyEmail, marketCountry }) {
  const [product, setProduct] = useState(initialProduct);
  const cardRef = useRef(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    setProduct(initialProduct);
    hydratedRef.current = !initialProduct?.isLite;
  }, [initialProduct]);

  // Progressive detail load — only when card is near viewport
  useEffect(() => {
    if (!product?.isLite || !product?.id || hydratedRef.current) return undefined;
    const node = cardRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      getProductById(product.id, { marketCountry }).then((full) => {
        if (full) {
          hydratedRef.current = true;
          setProduct((prev) => ({ ...prev, ...full, isLite: false }));
        }
      });
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || hydratedRef.current) return;
        hydratedRef.current = true;
        observer.disconnect();
        getProductById(product.id, { marketCountry }).then((full) => {
          if (full) setProduct((prev) => ({ ...prev, ...full, isLite: false }));
        });
      },
      { rootMargin: '200px 0px', threshold: 0.01 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [product?.id, product?.isLite, marketCountry]);

  const {
    name,
    price,
    currency,
    displayCurrency,
    priceInDisplay,
    isFeatured,
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

  const shownCurrency = displayCurrency || currency;
  const shownPrice = priceInDisplay != null ? priceInDisplay : price;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const gallery = (images && images.length)
    ? images
    : [resolveProductThumbnail(product)];
  const activeImage = gallery[activeImageIndex] || resolveProductThumbnail(product);

  // Modal State Variables
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showCoaModal, setShowCoaModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState(() => dialForMarket(marketCountry));
  const [businessName, setBusinessName] = useState('');
  const [incoterm, setIncoterm] = useState('FOB');
  const [destinationPort, setDestinationPort] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setCountryCode(dialForMarket(marketCountry));
  }, [marketCountry]);

  const handleModalSubmit = async (e) => {
    e.preventDefault();

    const resolvedMarket =
      (marketCountry || '').toUpperCase() ||
      dialToMarket(countryCode) ||
      detectMarketCountry();

    // Save inquiry — feeds country-interest learning for that market
    try {
      await submitInquiry({
        productId: product.id,
        productName: name,
        categoryName: categoryName,
        categoryId: product.category || null,
        phone: phoneNumber,
        countryCode: countryCode,
        marketCountry: resolvedMarket,
        businessName: businessName || null,
        incoterm: incoterm,
        destinationPort: destinationPort || null
      });
    } catch (err) {
      // Log but don't block the user — inquiry is still captured via email fallback
      console.warn('Inquiry DB save failed (will still show success):', err.message);
    }

    setIsSubmitted(true);
  };

  // Determine Pharmacopeial standard from salt composition or name
  let pharmacopeia = 'IP';
  if (name.includes('USP') || (saltComposition && saltComposition.includes('USP'))) pharmacopeia = 'USP';
  else if (name.includes('BP') || (saltComposition && saltComposition.includes('BP'))) pharmacopeia = 'BP';
  else if (name.includes('EP') || (saltComposition && saltComposition.includes('EP'))) pharmacopeia = 'EP';

  return (
    <div ref={cardRef} className="w-full bg-white border border-brand-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
      
      {/* Header Block */}
      <div className="bg-brand-gray-50 px-6 py-3.5 border-b border-brand-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-green-700 bg-brand-green-50 border border-brand-green-200 px-2 py-0.5 rounded">
              {categoryName}
            </span>
            <span className="text-[10px] font-mono font-bold text-brand-gray-700 bg-brand-gray-200/80 border border-brand-gray-300 px-2 py-0.5 rounded">
              Monograph: {pharmacopeia}
            </span>
            {brand && (
              <span className="text-[10px] font-semibold text-brand-gray-700 bg-white border border-brand-gray-200 px-2 py-0.5 rounded">
                Brand: {brand}
              </span>
            )}
            {isFeatured && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-green-800 bg-brand-green-100 border border-brand-green-200 px-2 py-0.5 rounded">
                Market focus
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-brand-gray-900 mt-1.5">{name}</h3>
        </div>
        
        {/* Quick Batch CoA Trigger */}
        <button
          onClick={async () => {
            if (product.isLite && product.id) {
              const full = await getProductById(product.id, { marketCountry });
              if (full) {
                hydratedRef.current = true;
                setProduct((prev) => ({ ...prev, ...full, isLite: false }));
              }
            }
            setShowCoaModal(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-brand-gray-300 hover:border-brand-green-600 bg-white text-brand-gray-800 font-bold text-xs rounded transition-colors shrink-0 cursor-pointer self-start sm:self-center"
        >
          <FiFileText className="text-brand-green-600 text-xs" />
          <span>View Batch CoA Specs</span>
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="p-6 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Image Showcase */}
        <div className="w-full lg:w-[32%] shrink-0 flex flex-col items-center">
          
          {/* Main Large Image Container */}
          <div className="w-full h-56 border border-brand-gray-200 rounded-md bg-brand-gray-50 p-4 flex items-center justify-center relative overflow-hidden">
            <OptimizedImage
              src={activeImage}
              alt={name}
              width={480}
              sizes="(max-width: 1024px) 80vw, 280px"
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>

          {/* Thumbnails Row */}
          {gallery.length > 1 && (
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-10 h-10 border rounded p-0.5 bg-white transition-colors cursor-pointer ${
                    activeImageIndex === idx ? 'border-brand-green-600' : 'border-brand-gray-200'
                  }`}
                  aria-label={`View ${name} image ${idx + 1}`}
                >
                  <OptimizedImage
                    src={img}
                    alt={`${name} thumbnail ${idx + 1}`}
                    width={80}
                    sizes="40px"
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Get Best Quote Button */}
          <button
            onClick={() => setShowInquiryModal(true)}
            className="mt-3 w-full px-4 py-2 border border-brand-gray-300 hover:border-brand-green-600 hover:bg-brand-green-50 text-brand-gray-800 text-xs font-bold rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <FiMail className="text-brand-green-600" />
            <span>Request Commercial Quote</span>
          </button>
        </div>

        {/* Right Column: Specs Sheet & Price Details */}
        <div className="flex-grow w-full space-y-4">
          
          {/* Price Block */}
          <div className="flex items-baseline justify-between gap-4 border-b border-brand-gray-200 pb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-brand-green-700 font-mono">
                {shownCurrency} {shownPrice}
              </span>
              <span className="text-xs text-brand-gray-500 font-medium">/ Indicative Export Unit</span>
              {displayCurrency && currency && displayCurrency !== currency && price != null && (
                <span className="text-[10px] text-brand-gray-400 font-mono">
                  ({currency} {price})
                </span>
              )}
            </div>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <FiShield className="text-xs" /> Export Grade Batch
            </span>
          </div>

          {/* Specifications Table */}
          <div className="border border-brand-gray-200 rounded-md overflow-hidden text-xs">
            <div className="divide-y divide-brand-gray-150">
              {strength && (
                <div className="flex py-2 px-3 bg-brand-gray-50/50">
                  <span className="text-brand-gray-500 font-semibold w-1/3 sm:w-1/4 shrink-0">Strength</span>
                  <span className="text-brand-gray-900 font-medium flex-1 font-mono">{strength}</span>
                </div>
              )}
              {packagingSize && (
                <div className="flex py-2 px-3">
                  <span className="text-brand-gray-500 font-semibold w-1/3 sm:w-1/4 shrink-0">Packaging Size</span>
                  <span className="text-brand-gray-900 font-medium flex-1">{packagingSize} {packagingType ? `(${packagingType})` : ''}</span>
                </div>
              )}
              {manufacturer && (
                <div className="flex py-2 px-3 bg-brand-gray-50/50">
                  <span className="text-brand-gray-500 font-semibold w-1/3 sm:w-1/4 shrink-0">Manufacturer</span>
                  <span className="text-brand-gray-900 font-medium flex-1">{manufacturer}</span>
                </div>
              )}
              {saltComposition && (
                <div className="flex py-2 px-3">
                  <span className="text-brand-gray-500 font-semibold w-1/3 sm:w-1/4 shrink-0">Active Salt (API)</span>
                  <span className="text-brand-gray-900 font-medium flex-1 leading-relaxed">{saltComposition}</span>
                </div>
              )}
              {treatment && (
                <div className="flex py-2 px-3 bg-brand-gray-50/50">
                  <span className="text-brand-gray-500 font-semibold w-1/3 sm:w-1/4 shrink-0">Therapeutic Class</span>
                  <span className="text-brand-gray-900 font-medium flex-1 leading-relaxed">{treatment}</span>
                </div>
              )}
              {storage && (
                <div className="flex py-2 px-3">
                  <span className="text-brand-gray-500 font-semibold w-1/3 sm:w-1/4 shrink-0">Storage & Stability</span>
                  <span className="text-brand-gray-900 font-medium flex-1 leading-relaxed">{storage}</span>
                </div>
              )}
              {minimumOrderQuantity && (
                <div className="flex py-2 px-3 bg-brand-gray-50/50">
                  <span className="text-brand-gray-500 font-semibold w-1/3 sm:w-1/4 shrink-0">Minimum Order (MOQ)</span>
                  <span className="text-brand-gray-900 font-bold flex-1 font-mono">{minimumOrderQuantity}</span>
                </div>
              )}
              {countryOfOrigin && (
                <div className="flex py-2 px-3">
                  <span className="text-brand-gray-500 font-semibold w-1/3 sm:w-1/4 shrink-0">Country of Origin</span>
                  <span className="text-brand-gray-900 font-medium flex-1">{countryOfOrigin}</span>
                </div>
              )}
              {/* Dynamic Extra Specs */}
              {Object.entries(specifications).map(([key, value]) => (
                <div key={key} className="flex py-2 px-3 bg-brand-gray-50/30">
                  <span className="text-brand-gray-500 font-semibold w-1/3 sm:w-1/4 shrink-0">{key}</span>
                  <span className="text-brand-gray-900 font-medium flex-1 leading-relaxed">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-xs text-brand-gray-600 leading-relaxed pt-1">
              {description}
            </p>
          )}

          {/* Action Row */}
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:w-auto">
              <InterestedButton
                productName={name}
                categoryName={categoryName}
                companyEmail={companyEmail}
                label="Submit B2B Inquiry"
                onClick={() => setShowInquiryModal(true)}
              />
            </div>
            <button
              onClick={() => setShowCoaModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 border border-brand-gray-300 hover:border-brand-green-600 hover:bg-brand-green-50 text-brand-gray-800 text-xs font-bold rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FiFileText className="text-brand-green-600" />
              <span>Inspect Certificate of Analysis (CoA)</span>
            </button>
          </div>

        </div>

      </div>

      {/* CoA Modal */}
      <CoaModal
        isOpen={showCoaModal}
        onClose={() => setShowCoaModal(false)}
        product={product}
        categoryName={categoryName}
      />

      {/* B2B Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-gray-950/70 overflow-y-auto">
          <div 
            className="fixed inset-0"
            onClick={() => {
              setShowInquiryModal(false);
              setIsSubmitted(false);
            }}
          />

          <div className="relative bg-white border border-brand-gray-300 rounded-lg shadow-xl w-full max-w-lg z-10 p-6 overflow-hidden">
            <button 
              onClick={() => {
                setShowInquiryModal(false);
                setIsSubmitted(false);
              }}
              className="absolute top-4 right-4 p-1 text-brand-gray-500 hover:text-brand-gray-900 text-lg cursor-pointer"
              aria-label="Close modal"
            >
              <FiX />
            </button>

            {!isSubmitted ? (
              <form onSubmit={handleModalSubmit} className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-brand-green-700 uppercase tracking-wider block mb-1">Wholesale Export Desk</span>
                  <h3 className="text-base font-bold text-brand-gray-900">
                    Request Quotation for {name}
                  </h3>
                  <p className="text-brand-gray-500 mt-0.5">Direct commercial pricing from 4 Core Exim</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-brand-gray-700 font-bold mb-1">Corporate Phone / WhatsApp *</label>
                    <div className="flex rounded border border-brand-gray-300 overflow-hidden">
                      <select 
                        value={countryCode} 
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-brand-gray-100 border-r border-brand-gray-300 px-2 py-2 font-mono font-semibold text-brand-gray-900 focus:outline-none cursor-pointer"
                      >
                        <option value="+91">IN (+91)</option>
                        <option value="+1">US/CA (+1)</option>
                        <option value="+44">UK (+44)</option>
                        <option value="+971">UAE (+971)</option>
                        <option value="+63">PH (+63)</option>
                        <option value="+254">KE (+254)</option>
                        <option value="+51">PE (+51)</option>
                        <option value="+234">NG (+234)</option>
                      </select>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter mobile/trade phone"
                        className="flex-1 px-3 py-2 text-brand-gray-900 font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-brand-gray-700 font-bold mb-1">Company / Pharmacy Name *</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Globamed Distributors Ltd"
                      className="w-full border border-brand-gray-300 rounded px-3 py-2 text-brand-gray-900 font-medium focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-brand-gray-700 font-bold mb-1">Target Incoterm</label>
                      <select
                        value={incoterm}
                        onChange={(e) => setIncoterm(e.target.value)}
                        className="w-full border border-brand-gray-300 rounded px-3 py-2 bg-white text-brand-gray-900 font-medium focus:outline-none"
                      >
                        <option value="FOB">FOB (Nhava Sheva / BOM)</option>
                        <option value="CIF">CIF (Port of Destination)</option>
                        <option value="CFR">CFR (Cost & Freight)</option>
                        <option value="EXW">EXW (Ex Works Mumbai)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-brand-gray-700 font-bold mb-1">Destination Port/City</label>
                      <input
                        type="text"
                        value={destinationPort}
                        onChange={(e) => setDestinationPort(e.target.value)}
                        placeholder="e.g. Manila, Callao, Mombasa"
                        className="w-full border border-brand-gray-300 rounded px-3 py-2 text-brand-gray-900 font-medium focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-brand-green-600 hover:bg-brand-green-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer shadow-sm"
                  >
                    Submit Quotation Request
                  </button>
                  <p className="text-[10px] text-brand-gray-500 text-center mt-2">
                    Our sales desk will contact you via WhatsApp / Email with MOQ and CIF pricing.
                  </p>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto text-xl font-bold">
                  <FiCheckCircle />
                </div>
                <h4 className="text-sm font-bold text-brand-gray-900">Inquiry Received</h4>
                <p className="text-xs text-brand-gray-600 max-w-xs mx-auto leading-relaxed">
                  Thank you. Our international trade team will reach out at <span className="font-mono font-bold text-brand-gray-900">{countryCode} {phoneNumber}</span> with proforma pricing shortly.
                </p>
                <button
                  onClick={() => {
                    setShowInquiryModal(false);
                    setIsSubmitted(false);
                    setPhoneNumber('');
                    setBusinessName('');
                  }}
                  className="px-4 py-2 bg-brand-gray-900 hover:bg-brand-gray-800 text-white font-bold text-xs rounded transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
