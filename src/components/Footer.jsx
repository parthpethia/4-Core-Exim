import React from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiClock, FiShield, FiFileText } from 'react-icons/fi';
import { useCompany } from '../context/CompanyContext';

export default function Footer() {
  const { company: companyData } = useCompany();
  const currentYear = new Date().getFullYear();

  if (!companyData) return null;

  return (
    <footer className="bg-brand-gray-900 text-brand-gray-300 pt-14 pb-8 border-t border-brand-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Footer Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Brand & Contact Info */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/95 p-1 rounded-md shadow-xs">
                <img
                  src="/logo.png"
                  alt="4Core Exim Logo"
                  className="h-9 w-auto object-contain"
                />
              </div>
              <div>
                <span className="text-base font-extrabold text-white tracking-tight block leading-tight">
                  4CORE EXIM
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-green-400">
                  Wholesale Pharmaceutical Exporter
                </span>
              </div>
            </div>
            <p className="text-xs text-brand-gray-400 mb-4 leading-relaxed">
              Wholesale Pharmaceutical Exporter & B2B Supply Desk. Based in Mumbai & Nagpur, India.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <FiMapPin className="text-brand-green-400 mt-0.5 shrink-0 text-sm" />
                <span className="text-brand-gray-300">{companyData.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="text-brand-green-400 shrink-0 text-sm" />
                <a href={`tel:${companyData.phone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                  {companyData.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <FiMail className="text-brand-green-400 shrink-0 text-sm" />
                <a href={`mailto:${companyData.email}`} className="hover:text-white transition-colors">
                  {companyData.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="text-brand-green-400 shrink-0 text-sm" />
                <span className="text-brand-gray-400">{companyData.businessHours}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Export Territories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              International Export Regions
            </h4>
            <ul className="space-y-2 text-xs text-brand-gray-400">
              <li className="flex items-center gap-1.5">
                <span className="text-brand-gray-600">■</span> Latin America & Caribbean (LATAM)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-brand-gray-600">■</span> Southeast Asia (ASEAN & Far East)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-brand-gray-600">■</span> CIS & Central Asian Republics
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-brand-gray-600">■</span> Middle East & GCC Nations
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-brand-gray-600">■</span> Africa (Anglophone & Francophone)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-brand-gray-600">■</span> Select European Union & Oceanic Markets
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs text-brand-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors block">
                  Home Portal
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-white transition-colors block">
                  Product Index & RFQ
                </Link>
              </li>
              <li>
                <Link to="/compliance" className="hover:text-white transition-colors block">
                  Quality & Regulatory Compliance
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors block">
                  About 4Core Exim
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors block">
                  Trade Desk & Office Coordinates
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Regulatory & Legal Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Regulatory & Legal
            </h4>
            <ul className="space-y-2 text-xs text-brand-gray-400 mb-4">
              <li>
                <Link to="/terms" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <FiFileText className="text-brand-green-400" />
                  <span>Terms of Export Service</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <FiShield className="text-brand-green-400" />
                  <span>B2B Privacy & Data Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/compliance" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <FiFileText className="text-brand-green-400" />
                  <span>WHO-GMP & Dossier Specifications</span>
                </Link>
              </li>
            </ul>
            
            <div className="border border-brand-gray-800 bg-brand-gray-950 p-3 rounded text-[11px] text-brand-gray-400 leading-relaxed font-mono">
              Port of Dispatch: Nhava Sheva (JNPT) / Mumbai Air Cargo (BOM). Indian CDSCO Export Registered.
            </div>
          </div>

        </div>

        {/* Footer Bottom (Disclaimers & Copyright) */}
        <div className="border-t border-brand-gray-800 pt-6 text-[11px] text-brand-gray-500 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          
          <div className="max-w-3xl leading-relaxed">
            <strong className="text-brand-gray-400">Statutory Pharmaceutical Notice:</strong> 4Core Exim operates exclusively as an international B2B wholesale pharmaceutical exporter. All product details and pricing indications are for registered wholesale distributors, hospital tenders, and licensed importers. We do not retail, dispense, or fulfill individual patient prescriptions.
          </div>

          <div className="shrink-0 text-xs text-brand-gray-400">
            <p>© {currentYear} 4Core Exim. All rights reserved.</p>
            <p className="text-[10px] text-brand-gray-500 mt-0.5">Pharmaceutical Exporter, India.</p>
          </div>

        </div>

      </div>
    </footer>
  );
}
