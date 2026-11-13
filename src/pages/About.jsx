import React, { useState, useEffect } from 'react';
import { getCompanyInfo } from '../services/productService';
import { FiAward, FiFileText, FiGlobe, FiTruck } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import PageSEO from '../components/PageSEO';

export default function About() {
  const [company, setCompany] = useState(null);

  useEffect(() => {
    async function loadConfig() {
      const comp = await getCompanyInfo();
      setCompany(comp);
    }
    loadConfig();
  }, []);

  if (!company) {
    return (
      <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center p-8">
        <div className="w-full max-w-xl space-y-4">
          <div className="w-48 h-6 shimmer rounded"></div>
          <div className="w-full h-24 shimmer rounded-lg"></div>
          <div className="w-full h-48 shimmer rounded-lg"></div>
        </div>
      </div>
    );
  }

  const corePillars = [
    {
      icon: <FiAward className="text-xl text-brand-red-600" />,
      title: "WHO-GMP Sourcing Governance",
      desc: "Batches are procured directly from validated manufacturing plants carrying active WHO-GMP, EU-GMP, or US-FDA certifications."
    },
    {
      icon: <FiTruck className="text-xl text-brand-red-600" />,
      title: "Calibrated Cold-Chain Transit",
      desc: "Refrigerated biologicals, injectables, and vaccines are shipped in qualified thermal containers monitored by USB/NFC dataloggers (2°C - 8°C)."
    },
    {
      icon: <FiFileText className="text-xl text-brand-red-600" />,
      title: "CTD Dossier & CoA Support",
      desc: "We supply batch-specific Certificates of Analysis (CoA), Stability Study data (Zone IVb), and Common Technical Document (CTD) registration modules."
    },
    {
      icon: <FiGlobe className="text-xl text-brand-red-600" />,
      title: "Port Clearance & Customs Routing",
      desc: "Our trade logistics desk oversees export clearance at Indian ports (Nhava Sheva JNPT / Mumbai Air Cargo) for seamless global delivery."
    }
  ];

  return (
    <div className="bg-brand-gray-50 min-h-screen py-12">
      <PageSEO
        title="About 4Core Exim — India's Trusted B2B Pharmaceutical Exporter"
        description="B2B pharmaceutical exporter backed by Thakkar Medico Traders. Exporting WHO-GMP certified generic and branded medicines from Mumbai & Nagpur to Africa, MENA, LATAM, Southeast Asia."
        path="/about"
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header Banner */}
        <div className="bg-white border border-brand-gray-200 rounded-lg p-8 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-red-600 block mb-2">
            Corporate Profile
          </span>
          <h1 className="text-3xl font-bold text-brand-gray-900 tracking-tight">About 4Core Exim</h1>
          <p className="text-xs font-semibold text-brand-gray-500 uppercase tracking-wider mt-1">
            Backed by the legacy of Thakkar Medico Traders
          </p>
          <p className="text-xs text-brand-gray-700 mt-4 leading-relaxed font-normal max-w-3xl">
            Supplying premium brand-name, generic, specialty, oncology, and veterinary pharmaceutical formulations from India's WHO-GMP audited manufacturing lines to wholesale distributors globally.
          </p>
        </div>

        {/* Corporate History & Sourcing Roots */}
        <div className="bg-white border border-brand-gray-200 rounded-lg p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4 text-xs text-brand-gray-700 leading-relaxed">
              <h2 className="text-xl font-bold text-brand-gray-900 tracking-tight">
                Established B2B Pharmaceutical Exporter
              </h2>
              <p>
                {company.aboutFull.intro}
              </p>
              <p>
                {company.aboutFull.sourcing}
              </p>
              <p>
                Through our parent organization, <strong className="text-brand-gray-900">Thakkar Medico Traders</strong>, we command a deep, trusted footprint established in Princess Street, Mumbai, the historic center of India's wholesale chemical and pharmaceutical trade.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-5 space-y-4 text-xs">
                <div className="border-b border-brand-gray-200 pb-3">
                  <span className="text-2xl font-mono font-bold text-brand-red-700 block">40+</span>
                  <span className="font-bold text-brand-gray-900 uppercase text-[11px] block mt-0.5">Destination Countries</span>
                  <p className="text-[11px] text-brand-gray-500 mt-1">Active supply pipelines across LATAM, Southeast Asia, CIS, Middle East, and Africa.</p>
                </div>
                <div className="border-b border-brand-gray-200 pb-3">
                  <span className="text-2xl font-mono font-bold text-brand-red-700 block">100%</span>
                  <span className="font-bold text-brand-gray-900 uppercase text-[11px] block mt-0.5">Batch Traceability</span>
                  <p className="text-[11px] text-brand-gray-500 mt-1">Direct procurement with verifiable lot-specific Certificates of Analysis (CoA).</p>
                </div>
                <div>
                  <span className="font-bold text-brand-gray-900 uppercase text-[11px] block">Regulatory Compliance</span>
                  <p className="text-[11px] text-brand-gray-500 mt-1">Incoterms 2020 export handling, CoPP documentation, and multilingual export packaging.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Operational Pillars */}
        <div className="bg-white border border-brand-gray-200 rounded-lg p-8 shadow-sm">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-red-600 block">Operating Model</span>
            <h2 className="text-xl font-bold text-brand-gray-900 mt-1">B2B Distribution & Quality Architecture</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {corePillars.map((pillar, idx) => (
              <div 
                key={idx}
                className="bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-5 flex gap-4"
              >
                <div className="shrink-0 bg-white p-2.5 rounded border border-brand-gray-200 h-fit">
                  {pillar.icon}
                </div>
                <div className="text-xs">
                  <h3 className="font-bold text-brand-gray-900 text-sm mb-1">{pillar.title}</h3>
                  <p className="text-brand-gray-600 leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warehousing & Cold Chain Operations */}
        <div className="bg-white border border-brand-gray-200 rounded-lg p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4 text-xs text-brand-gray-700 leading-relaxed">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-red-600 block">Logistics Integrity</span>
              <h2 className="text-xl font-bold text-brand-gray-900">Cold Chain Storage & Air Freight Handling</h2>
              <p>
                {company.aboutFull.supplyChain}
              </p>
              <p>
                From sensitive insulin vials and oncology monoclonal antibodies to high-volume veterinary tablets, our thermal shipping crates feature calibrated temperature dataloggers. This ensures thermal accountability from the point of dispatch in Mumbai to destination port arrival.
              </p>
              <div className="bg-brand-gray-50 border border-brand-gray-200 p-3.5 rounded text-brand-gray-800 font-medium">
                <strong>Standard Thermal Range:</strong> Biologicals (2°C - 8°C) | Controlled Ambient (&lt;25°C) | Climatic Zone IVb Tested
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="border border-brand-gray-200 rounded-lg overflow-hidden bg-brand-gray-50">
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80"
                  alt="Cold chain pharmaceutical warehousing and dispatch"
                  className="w-full h-56 object-cover"
                />
                <div className="p-3 text-[11px] text-brand-gray-600 border-t border-brand-gray-200">
                  <span className="font-semibold text-brand-gray-900">Cold-Chain Dispatch Desk:</span> Insulated shipper boxes with calibrated data loggers.
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Quick CTA */}
        <div className="bg-brand-gray-900 text-white rounded-lg p-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-lg font-bold">Partner With 4Core Exim for Global Wholesale Supplies</h3>
            <p className="text-xs text-brand-gray-400 mt-1 max-w-xl">
              Connect with our international sales desk to receive current batch availability, MOQ details, and proforma quotations.
            </p>
          </div>
          <Link
            to="/contact"
            className="px-6 py-2.5 bg-brand-red-600 hover:bg-brand-red-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors shrink-0"
          >
            Contact Exporter Desk
          </Link>
        </div>

      </div>
    </div>
  );
}
