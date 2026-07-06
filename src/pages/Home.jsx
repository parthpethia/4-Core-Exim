import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import CategoryGrid from '../components/CategoryGrid';
import { getCategories, getCompanyInfo } from '../services/productService';
import { FiCheckSquare, FiTruck, FiFileText, FiAward, FiArrowRight } from 'react-icons/fi';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    async function loadData() {
      const cats = await getCategories();
      const comp = await getCompanyInfo();
      setCategories(cats);
      setCompany(comp);
    }
    loadData();
  }, []);

  const featureList = [
    {
      icon: <FiAward className="text-3xl text-brand-red-500" />,
      title: "Quality Assurance",
      description: "We source formulation batches strictly from WHO-GMP, EU-GMP, and US-FDA compliant manufacturers."
    },
    {
      icon: <FiTruck className="text-3xl text-brand-red-500" />,
      title: "Cold-Chain Logistics",
      description: "Dedicated temp-controlled warehousing and refrigerated transit pipelines for biologics and vaccines."
    },
    {
      icon: <FiFileText className="text-3xl text-brand-red-500" />,
      title: "Dossier & DMF Support",
      description: "Provision of detailed regulatory documentation including CoA, stability test sheets, and export custom files."
    },
    {
      icon: <FiCheckSquare className="text-3xl text-brand-red-500" />,
      title: "100% Genuine Supplies",
      description: "Direct official distribution chains eliminate counterfeit risks, providing authentic pharmaceutical shipments."
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Banner */}
      <Hero />

      {/* Categories Section */}
      <section className="py-20 bg-brand-gray-50/50 border-b border-brand-gray-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-red-500">
              Browse Wholesale Formulations
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-gray-900 mt-2">
              Therapeutic Catalog Categories
            </h2>
            <p className="text-sm text-brand-gray-700 mt-4 font-medium leading-relaxed">
              Explore our wide array of specialized therapeutic segments. Select a segment to filter active medications in our wholesale inventory.
            </p>
          </div>

          <CategoryGrid categories={categories} />
        </div>
      </section>

      {/* B2B Trust Features Grid */}
      <section className="py-20 border-b border-brand-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-red-500">
              International B2B Standards
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-gray-900 mt-2">
              Why Partner With {company?.name || '4Core Exim'}?
            </h2>
            <p className="text-sm text-brand-gray-700 mt-4 font-medium">
              We leverage multi-decade wholesale pharmaceutical distribution experience to deliver secure export pathways.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureList.map((feature, idx) => (
              <div 
                key={idx}
                className="bg-white p-6 rounded-xl border border-brand-gray-200 shadow-premium hover:border-brand-red-100 transition-all duration-300"
              >
                <div className="mb-4 inline-block bg-brand-red-50/80 p-3 rounded-lg border border-brand-red-100/50">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-brand-gray-900 mb-2">{feature.title}</h3>
                <p className="text-xs text-brand-gray-700 leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Overview Section */}
      {company && (
        <section className="py-20 bg-brand-gray-50/70 border-b border-brand-gray-150">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Graphic Placeholder/Intro Column */}
              <div className="lg:col-span-5 relative">
                <div className="w-full h-80 rounded-2xl overflow-hidden shadow-premium border border-brand-gray-200 relative group">
                  <img
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80"
                    alt="Pharmaceutical Laboratory"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-gray-900/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-red-500 px-2.5 py-1 rounded">Established Integrity</span>
                    <h4 className="text-lg font-extrabold mt-2">Thakkar Medico Traders</h4>
                  </div>
                </div>
                {/* Visual back decoration */}
                <div className="absolute -bottom-6 -right-6 w-36 h-36 border-b-2 border-r-2 border-brand-red-500/20 rounded-br-2xl pointer-events-none -z-10"></div>
              </div>

              {/* Text Column */}
              <div className="lg:col-span-7">
                <span className="text-xs font-extrabold uppercase tracking-wider text-brand-red-500">Corporate Background</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-gray-900 mt-2 mb-6">
                  Backed by Decades of Pharmaceutical Integrity
                </h2>
                <p className="text-sm text-brand-gray-700 leading-relaxed font-medium mb-4">
                  {company.aboutFull.intro}
                </p>
                <p className="text-sm text-brand-gray-700 leading-relaxed font-medium mb-6">
                  {company.aboutFull.sourcing}
                </p>
                
                <div className="flex gap-4">
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-1.5 text-brand-red-500 font-bold hover:text-brand-red-600 transition-colors"
                  >
                    <span>Read Corporate Bio</span>
                    <FiArrowRight className="text-base" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Quick B2B Inquiry CTA */}
      <section className="py-16 bg-brand-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-red-500/5 rounded-full filter blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-extrabold mb-4">Ready to Discuss Wholesale Procurement?</h2>
          <p className="text-sm text-brand-gray-300 max-w-xl mx-auto leading-relaxed mb-8">
            Connect with our trade export desk to receive custom batch quotes, lead times, regulatory documents, and logistics options.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/catalog"
              className="px-6 py-3 bg-brand-red-500 hover:bg-brand-red-600 text-white font-bold rounded-lg transition-all shadow-md cursor-pointer"
            >
              Browse Catalog List
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 border border-brand-gray-700 hover:border-white text-white font-bold rounded-lg transition-all cursor-pointer bg-brand-gray-800"
            >
              Contact Trade Representative
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
