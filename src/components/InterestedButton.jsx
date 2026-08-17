import React from 'react';
import { FiMail } from 'react-icons/fi';

/**
 * InterestedButton component for initiating B2B inquiry emails.
 * @param {Object} props
 * @param {string} props.productName
 * @param {string} props.categoryName
 * @param {string} props.companyEmail
 */
export default function InterestedButton({ productName, categoryName, companyEmail, label = "I'm Interested", onClick }) {
  const handleInquiry = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick(e);
      return;
    }
    
    const subject = `Product Enquiry - ${productName}`;
    const body = `Hello,
 
 I am interested in the following product.
 
 Product: ${productName}
 Category: ${categoryName}
 
 Please share MOQ, pricing and export details.
 
 Regards`;
 
     const mailtoUrl = `mailto:${companyEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
     window.location.href = mailtoUrl;
   };
 
   return (
     <button
       onClick={handleInquiry}
       className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-brand-red-500 hover:bg-brand-red-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer text-center"
       aria-label={`Enquire about ${productName}`}
     >
       <FiMail className="text-lg animate-pulse" />
       <span>{label}</span>
     </button>
   );
 }
