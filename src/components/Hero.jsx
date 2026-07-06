import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShield, FiGlobe, FiCpu } from 'react-icons/fi';
import companyData from '../data/company.json';

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <section className="relative bg-white border-b border-brand-gray-100 overflow-hidden py-20 lg:py-28 medical-grid-bg">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-brand-red-500/5 rounded-full filter blur-[80px] pointer-events-none transform translate-x-1/3"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-brand-gray-800/5 rounded-full filter blur-[100px] pointer-events-none transform -translate-x-1/3"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <motion.div 
            className="lg:col-span-7 text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Live Indicator Badge */}
            <motion.div 
              variants={itemVariants} 
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-red-50 border border-brand-red-100 rounded-full text-xs font-bold text-brand-red-600 mb-6"
            >
              <span className="w-2.5 h-2.5 bg-brand-red-500 rounded-full pulse-dot block shrink-0"></span>
              <span>Trusted WHO-GMP Supply Lines</span>
            </motion.div>

            {/* Main Title */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-gray-900 leading-[1.1] mb-6"
            >
              Global Pharmaceutical <br />
              <span className="text-brand-red-500">Exporter & Supplier</span>
            </motion.h1>

            {/* Sub-heading */}
            <motion.p 
              variants={itemVariants}
              className="text-base sm:text-lg text-brand-gray-700 font-medium leading-relaxed mb-8 max-w-xl"
            >
              Reliable wholesale exporter of high-quality branded, generic, specialty, and veterinary pharmaceutical formulations across international markets.
            </motion.p>

            {/* Action Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 mb-10"
            >
              <Link
                to="/catalog"
                className="flex items-center justify-center gap-2 px-7 py-3.5 bg-brand-red-500 hover:bg-brand-red-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Browse Products</span>
                <FiArrowRight className="text-base" />
              </Link>
              <Link
                to="/contact"
                className="flex items-center justify-center gap-2 px-7 py-3.5 border border-brand-gray-200 bg-white hover:border-brand-red-500 hover:text-brand-red-500 text-brand-gray-800 font-bold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Contact Exporters</span>
              </Link>
            </motion.div>

            {/* Quick trust metrics */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-3 gap-6 pt-6 border-t border-brand-gray-150 max-w-lg"
            >
              <div className="flex items-center gap-2 text-xs">
                <FiGlobe className="text-lg text-brand-red-500 shrink-0" />
                <div>
                  <p className="font-bold text-brand-gray-900 leading-none">40+ Countries</p>
                  <p className="text-brand-gray-700 mt-0.5">Global Network</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <FiShield className="text-lg text-brand-red-500 shrink-0" />
                <div>
                  <p className="font-bold text-brand-gray-900 leading-none">WHO-GMP</p>
                  <p className="text-brand-gray-700 mt-0.5">Certified Sourcing</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <FiCpu className="text-lg text-brand-red-500 shrink-0" />
                <div>
                  <p className="font-bold text-brand-gray-900 leading-none">Cold Chain</p>
                  <p className="text-brand-gray-700 mt-0.5">Assured Logistics</p>
                </div>
              </div>
            </motion.div>

          </motion.div>

          {/* Hero Right Visual Column */}
          <div className="hidden lg:col-span-5 lg:flex justify-center relative">
            {/* Visual Glass Box */}
            <div className="w-80 h-96 bg-brand-gray-50 border border-brand-gray-200 rounded-2xl shadow-premium p-6 flex flex-col justify-between relative relative z-10 glass-card">
              <div className="flex justify-between items-start">
                <div className="bg-brand-red-50 border border-brand-red-100 p-2.5 rounded-xl">
                  <FiShield className="text-2xl text-brand-red-500 animate-pulse" />
                </div>
                <span className="text-[10px] uppercase font-bold text-brand-gray-700 tracking-widest bg-brand-gray-200 px-2.5 py-1 rounded-full">
                  Exim Certified
                </span>
              </div>
              
              <div className="space-y-4 my-6 text-xs text-brand-gray-800">
                <p className="font-bold text-brand-gray-900 text-sm">Regulatory Compliance Support</p>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-red-500"></span>
                  <span>Certificate of Analysis (CoA)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-red-500"></span>
                  <span>Stability Study Data Sheets</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-red-500"></span>
                  <span>Custom Export Packaging (DMF)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-gray-150 flex items-center justify-between text-xs font-bold">
                <span className="text-brand-gray-700">Backed by:</span>
                <span className="text-brand-red-500">{companyData.subtitle}</span>
              </div>
            </div>

            {/* Glowing accents around the card */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-red-500/10 rounded-full filter blur-[60px] pointer-events-none -z-10"></div>
          </div>

        </div>
      </div>
    </section>
  );
}
