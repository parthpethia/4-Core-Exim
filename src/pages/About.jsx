import React, { useState, useEffect } from 'react';
import { getCompanyInfo } from '../services/productService';
import { FiAward, FiFileText, FiShield, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
      <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center">
        <p className="text-sm font-semibold text-brand-gray-700">Loading exporter profile...</p>
      </div>
    );
  }

  const corePillars = [
    {
      icon: <FiAward className="text-2xl text-brand-red-500" />,
      title: "WHO-GMP Sourcing",
      desc: "All products undergo rigorous inspection. We only partner with state-of-the-art facilities carrying WHO-GMP, US-FDA, and EU-GMP certifications."
    },
    {
      icon: <FiShield className="text-2xl text-brand-red-500" />,
      title: "Strict Temperature Control",
      desc: "Sensitive biologicals, injectables, and vaccines are stored and shipped under validation-monitored cold-chain (2°C to 8°C) conditions."
    },
    {
      icon: <FiFileText className="text-2xl text-brand-red-500" />,
      title: "Documentation Support",
      desc: "We supply Certificate of Analysis (CoA), Stability Studies, Product Dossiers (CTD/eCTD format), and customized labels for local imports."
    },
    {
      icon: <FiTrendingUp className="text-2xl text-brand-red-500" />,
      title: "Global Custom Clearance",
      desc: "Our trade compliance desks supervise clearance processes at Indian ports and manage export routing to over 40+ destinations."
    }
  ];

  return (
    <div className="bg-white">
      
      {/* Page Header Banner */}
      <section className="bg-brand-gray-900 text-white py-16 lg:py-20 relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-10 medical-grid-bg"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-brand-red-500/10 rounded-full filter blur-[80px] pointer-events-none -translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center lg:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-red-500">WHO WE ARE</span>
          <h1 className="text-4xl font-extrabold tracking-tight mt-2 text-white">About 4Core Exim</h1>
          <p className="text-sm text-brand-gray-300 mt-4 max-w-xl leading-relaxed">
            Supplying premium brand name, generic, specialty, and veterinary pharmaceutical formulations from India to the world.
          </p>
        </div>
      </section>

      {/* Main Corporate Introduction */}
      <section className="py-20 border-b border-brand-gray-150 bg-brand-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand-red-500 block mb-2">Corporate Bio</span>
              <h2 className="text-3xl font-extrabold text-brand-gray-900 mb-6">
                Experienced B2B Pharmaceutical Exporter
              </h2>
              <p className="text-sm text-brand-gray-700 leading-relaxed font-medium mb-4">
                {company.aboutFull.intro}
              </p>
              <p className="text-sm text-brand-gray-700 leading-relaxed font-medium mb-4">
                {company.aboutFull.sourcing}
              </p>
              <p className="text-sm text-brand-gray-700 leading-relaxed font-medium mb-6">
                Through our parent entity, <strong className="text-brand-gray-900">Thakkar Medico Traders</strong>, we command a deep, trusted footprint in Princess Street, Mumbai—the historic heart of India's wholesale chemical and medicine markets.
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-brand-gray-200 shadow-premium">
                  <span className="text-3xl font-extrabold text-brand-red-500 block">40+</span>
                  <span className="text-xs font-bold text-brand-gray-900 block mt-1 uppercase tracking-wider">Countries Served</span>
                  <p className="text-[10px] text-brand-gray-750 leading-relaxed mt-2">Active supply networks extending across LATAM, Southeast Asia, CIS, Middle East, and Africa.</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-brand-gray-200 shadow-premium">
                  <span className="text-3xl font-extrabold text-brand-red-500 block">100%</span>
                  <span className="text-xs font-bold text-brand-gray-900 block mt-1 uppercase tracking-wider">Traceability</span>
                  <p className="text-[10px] text-brand-gray-750 leading-relaxed mt-2">Batches procured directly from primary factories, carrying verifiable Certificate of Analysis (CoA).</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-brand-gray-200 shadow-premium col-span-2">
                  <span className="text-xl font-bold text-brand-gray-900 block">Regulatory Compliance Suite</span>
                  <p className="text-[10px] text-brand-gray-750 leading-relaxed mt-2">
                    We manage custom shipping layouts, Certificates of Pharmaceutical Product (CoPP), local FDA registrations, and customized multilingual sticker packaging.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Operational Pillars Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-red-500">How We Operate</span>
            <h2 className="text-3xl font-extrabold text-brand-gray-900 mt-2">Our B2B Distribution Model</h2>
            <p className="text-sm text-brand-gray-700 mt-4 leading-relaxed font-medium">
              We orchestrate end-to-end supply chains to guarantee that life-saving therapeutic formulations reach our global partners securely and efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {corePillars.map((pillar, idx) => (
              <div 
                key={idx}
                className="flex gap-4 bg-brand-gray-50 border border-brand-gray-200 rounded-xl p-6 shadow-sm hover:shadow-premium hover:border-brand-red-100 transition-all duration-300"
              >
                <div className="shrink-0 bg-white p-3 rounded-lg border border-brand-gray-200 h-fit">
                  {pillar.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-gray-900 mb-2">{pillar.title}</h3>
                  <p className="text-xs text-brand-gray-750 leading-relaxed font-medium">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Warehousing & Cold Chain Details */}
      <section className="py-20 bg-brand-gray-900 text-white relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-5 medical-grid-bg"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-red-500">Facility Operations</span>
              <h2 className="text-3xl font-extrabold text-white mt-2 mb-6">Cold Chain Integrity & Logistics</h2>
              <p className="text-sm text-brand-gray-300 leading-relaxed mb-4">
                {company.aboutFull.supplyChain}
              </p>
              <p className="text-sm text-brand-gray-300 leading-relaxed mb-6">
                From sensitive insulin vials and oncology monoclonal antibodies to high-volume veterinary tablets, our shipping crates feature calibrated temperature-logging sensors. This ensures complete thermal data transparency from the moment of dispatch in Mumbai to port arrival globally.
              </p>
              <div className="border-l-4 border-brand-red-500 bg-brand-gray-800 p-4 rounded-r-lg text-xs leading-relaxed text-brand-gray-300 font-medium">
                "Product efficacy relies on stable storage. We assure that no thermal break goes unnoticed."
              </div>
            </div>

            <div className="relative">
              <div className="w-full h-80 rounded-2xl overflow-hidden border border-brand-gray-800 shadow-2xl relative">
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80"
                  alt="Modern cold storage warehouse container"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-gray-900 to-transparent opacity-60"></div>
              </div>
              {/* Floating trust badge */}
              <div className="absolute -bottom-6 -left-6 bg-brand-red-500 text-white px-5 py-4 rounded-xl shadow-lg border border-brand-red-600 text-center">
                <span className="block text-2xl font-black">2-8°C</span>
                <span className="block text-[8px] font-bold uppercase tracking-wider">Monitored Biologicals Cargo</span>
              </div>
            </div>

          </div>
        </div>
      </section>
      
    </div>
  );
}
