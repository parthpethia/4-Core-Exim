import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiCheckCircle } from 'react-icons/fi';

export default function Hero() {
  return (
    <section className="bg-white border-b border-brand-gray-200 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* Live Indicator Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-gray-100 border border-brand-gray-200 rounded text-xs font-bold text-brand-gray-800">
              <span className="w-2 h-2 bg-brand-red-600 rounded-full inline-block"></span>
              <span>WHO-GMP Batch Sourcing & Global Port Logistics</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-gray-900 leading-tight tracking-tight">
              International Pharmaceutical <br />
              <span className="text-brand-red-600">Exporter & Wholesale Supplier</span>
            </h1>

            {/* Sub-heading */}
            <p className="text-sm sm:text-base text-brand-gray-600 font-normal leading-relaxed max-w-2xl">
              Reliable B2B trade desk supplying authentic branded, generic, oncology, and veterinary pharmaceutical formulations from India's leading WHO-GMP manufacturers to over 40+ countries.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-red-600 hover:bg-brand-red-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors shadow-sm"
              >
                <span>Browse Products & RFQ</span>
                <FiArrowRight className="text-sm" />
              </Link>
              <Link
                to="/compliance"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-brand-gray-300 bg-white hover:bg-brand-gray-50 text-brand-gray-800 font-bold text-xs uppercase tracking-wider rounded transition-colors"
              >
                <FiShield className="text-sm text-brand-red-600" />
                <span>Quality & Compliance</span>
              </Link>
            </div>

            {/* Industrial Logistics Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-brand-gray-200 max-w-xl text-xs">
              <div>
                <p className="font-mono font-bold text-brand-gray-900 text-base">40+ Markets</p>
                <p className="text-brand-gray-500 mt-0.5">LATAM, CIS, SEA, Africa</p>
              </div>
              <div>
                <p className="font-mono font-bold text-brand-gray-900 text-base">Incoterms 2020</p>
                <p className="text-brand-gray-500 mt-0.5">FOB / CIF / CFR Ready</p>
              </div>
              <div>
                <p className="font-mono font-bold text-brand-gray-900 text-base">Cold-Chain</p>
                <p className="text-brand-gray-500 mt-0.5">2°C - 8°C Monitored</p>
              </div>
            </div>

          </div>

          {/* Hero Right Visual: Technical Specification & Dispatch Summary */}
          <div className="lg:col-span-5">
            <div className="bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-6 space-y-4">
              
              <div className="flex items-center justify-between border-b border-brand-gray-200 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-gray-900">
                  Export Protocol Specifications
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  CDSCO Verified
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <FiCheckCircle className="text-emerald-600 shrink-0 text-sm mt-0.5" />
                  <div>
                    <strong className="text-brand-gray-900">Pharmacopeial Monographs:</strong>
                    <p className="text-brand-gray-600">IP, BP, USP, and EP certified formulation batches.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <FiCheckCircle className="text-emerald-600 shrink-0 text-sm mt-0.5" />
                  <div>
                    <strong className="text-brand-gray-900">Regulatory Dossier Modules:</strong>
                    <p className="text-brand-gray-600">CTD/eCTD formats, Certificate of Pharmaceutical Product (CoPP), and CoA.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <FiCheckCircle className="text-emerald-600 shrink-0 text-sm mt-0.5" />
                  <div>
                    <strong className="text-brand-gray-900">Dispatch Hubs:</strong>
                    <p className="text-brand-gray-600">Nhava Sheva Port (JNPT) & Chhatrapati Shivaji Maharaj Air Cargo (BOM).</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <FiCheckCircle className="text-emerald-600 shrink-0 text-sm mt-0.5" />
                  <div>
                    <strong className="text-brand-gray-900">Temperature Loggers:</strong>
                    <p className="text-brand-gray-600">Calibrated USB/NFC dataloggers for sensitive cold-chain cargo.</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-brand-gray-200 flex items-center justify-between text-xs text-brand-gray-500 font-mono">
                <span>Origin: Mumbai, India</span>
                <Link to="/contact" className="text-brand-red-600 font-bold hover:underline">
                  Contact Trade Desk &rarr;
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
