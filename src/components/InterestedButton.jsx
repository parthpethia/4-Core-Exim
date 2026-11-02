import React from 'react';
import { FiMail } from 'react-icons/fi';

/**
 * InterestedButton component for initiating B2B inquiry emails.
 * @param {Object} props
 * @param {string} props.productName
 * @param {string} props.categoryName
 * @param {string} props.companyEmail
 * @param {string} [props.label]
 * @param {Function} [props.onClick]
 */
export default function InterestedButton({ productName, categoryName, companyEmail, label = "Submit Inquiry", onClick }) {
  const handleInquiry = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick(e);
      return;
    }
    
    const subject = `B2B Wholesale Inquiry - ${productName}`;
    const body = `Hello 4Core Exim Sales Desk,

I would like to submit a B2B wholesale inquiry for:

Product: ${productName}
Category: ${categoryName}

Please provide FOB Mumbai / CIF pricing, MOQ, and batch regulatory documentation (CoA/Dossier availability).

Regards`;

    const mailtoUrl = `mailto:${companyEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <button
      onClick={handleInquiry}
      className="flex items-center justify-center gap-2 w-full px-5 py-2.5 bg-brand-red-600 hover:bg-brand-red-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer text-center"
      aria-label={`Enquire about ${productName}`}
    >
      <FiMail className="text-sm" />
      <span>{label}</span>
    </button>
  );
}
