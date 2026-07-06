import React from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiClock, FiActivity } from 'react-icons/fi';
import { FaWhatsapp, FaLinkedinIn } from 'react-icons/fa';
import companyData from '../data/company.json';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-gray-900 text-brand-gray-300 pt-16 pb-8 border-t-2 border-brand-red-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Footer Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Brand & Contact Info */}
          <div>
            <div className="flex items-center gap-1.5 mb-4">
              <span className="w-2.5 h-6 bg-brand-red-500 rounded-full inline-block"></span>
              <span className="text-xl font-bold text-white tracking-tight">
                4Core <span className="text-brand-red-500">Exim</span>
              </span>
            </div>
            <p className="text-xs text-brand-gray-300/80 mb-5 leading-relaxed">
              {companyData.subtitle}<br />
              {companyData.aboutShort}
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <FiMapPin className="text-brand-red-500 mt-0.5 shrink-0 text-sm" />
                <span className="text-brand-gray-300/90">{companyData.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <FiPhone className="text-brand-red-500 shrink-0 text-sm" />
                <a href={`tel:${companyData.phone.replace(/\s+/g, '')}`} className="hover:text-brand-red-500 transition-colors">
                  {companyData.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <FiMail className="text-brand-red-500 shrink-0 text-sm" />
                <a href={`mailto:${companyData.email}`} className="hover:text-brand-red-500 transition-colors">
                  {companyData.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <FiClock className="text-brand-red-500 shrink-0 text-sm" />
                <span className="text-brand-gray-300/80">{companyData.businessHours}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Export Regions */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 border-l-2 border-brand-red-500 pl-2">
              Export Territories
            </h4>
            <ul className="space-y-2 text-xs text-brand-gray-300/90">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-red-500 rounded-full"></span> Latin America & Caribbean
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-red-500 rounded-full"></span> Southeast Asia & Far East
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-red-500 rounded-full"></span> CIS (Central Asia)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-red-500 rounded-full"></span> Middle East Nations
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-red-500 rounded-full"></span> Africa (Francophone & Anglophone)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-red-500 rounded-full"></span> Select European Markets
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 border-l-2 border-brand-red-500 pl-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-brand-red-500 transition-colors block py-0.5">
                  Home Page
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-brand-red-500 transition-colors block py-0.5">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-red-500 transition-colors block py-0.5">
                  About Exporters
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-red-500 transition-colors block py-0.5">
                  Contact Office
                </Link>
              </li>
              <li className="pt-2 border-t border-brand-gray-800">
                <div className="flex items-center gap-1.5 text-brand-red-500 font-semibold text-[10px] uppercase tracking-wider">
                  <FiActivity className="animate-pulse" /> WHO-GMP Sourced
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Certifications & Verification */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 border-l-2 border-brand-red-500 pl-2">
              B2B Trust Elements
            </h4>
            <p className="text-xs text-brand-gray-300/80 leading-relaxed mb-4">
              All items supplied originate from certified manufacturing sites complying with WHO-GMP guidelines and international health standards.
            </p>
            <div className="flex gap-2">
              <a
                href={`https://wa.me/${companyData.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-brand-gray-800 hover:bg-green-600 hover:text-white flex items-center justify-center transition-all shadow text-brand-gray-300"
                title="Connect via WhatsApp"
              >
                <FaWhatsapp className="text-lg" />
              </a>
              <a
                href={`mailto:${companyData.email}`}
                className="w-9 h-9 rounded-lg bg-brand-gray-800 hover:bg-brand-red-500 hover:text-white flex items-center justify-center transition-all shadow text-brand-gray-300"
                title="Send Corporate Email"
              >
                <FiMail className="text-lg" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-brand-gray-800 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow text-brand-gray-300"
                title="Connect on LinkedIn"
              >
                <FaLinkedinIn className="text-lg" />
              </a>
            </div>
            
            <div className="mt-4 border border-brand-gray-800 bg-brand-gray-950 p-2.5 rounded-lg text-[10px] leading-relaxed text-brand-gray-300/60">
              Licensed Exporter Registry. Active Drug Master File (DMF) compliance support.
            </div>
          </div>

        </div>

        {/* Footer Bottom (Disclaimers & Copyright) */}
        <div className="border-t border-brand-gray-800 pt-8 mt-4 text-[10px] text-brand-gray-300/50 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          
          <div className="max-w-2xl leading-relaxed">
            <p className="font-semibold text-brand-gray-300/70 mb-1 uppercase tracking-wider">Regulatory Disclaimer:</p>
            The products shown are indicative wholesale export items. Indicative pricing is for reference only and subject to MOQ, regulatory compliance, country approvals, and current market conditions. We do not retail, sell online, or fulfill individual prescriptions.
          </div>

          <div className="shrink-0">
            <p>© {currentYear} 4Core Exim. All Rights Reserved.</p>
            <p className="mt-1 text-[9px]">Sourced and Marketed by Thakkar Medico Traders.</p>
          </div>

        </div>

      </div>
    </footer>
  );
}
