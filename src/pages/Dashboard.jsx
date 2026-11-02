import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { FiPackage, FiFileText, FiPhone, FiLogOut, FiExternalLink, FiCheckCircle, FiShield, FiArrowRight } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCompany } from '../context/CompanyContext';

export default function Dashboard() {
  const { user, isAdmin, signOut } = useAuth();
  const { company: companyData } = useCompany();

  const userEmail = user?.email || 'importer@client.com';
  const provider = user?.app_metadata?.provider || 'oauth';
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || userEmail.split('@')[0];

  return (
    <div className="bg-brand-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="bg-white border border-brand-gray-200 rounded-xl p-6 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-red-50 text-brand-red-600 rounded-full flex items-center justify-center font-bold text-xl border border-brand-red-100">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-brand-gray-900">
                  Welcome, {userName}
                </h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isAdmin 
                    ? 'bg-brand-red-50 text-brand-red-700 border border-brand-red-200' 
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {isAdmin ? 'Administrator' : 'Verified Importer'}
                </span>
              </div>
              <p className="text-xs text-brand-gray-500 mt-0.5">
                Authenticated via <span className="font-semibold capitalize">{provider}</span> OAuth &bull; Account: <span className="font-mono text-brand-gray-700">{userEmail}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2 bg-brand-gray-900 hover:bg-black text-white rounded text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-1.5"
              >
                <FiShield className="text-brand-red-500 text-xs" />
                <span>Trade Desk Admin Console</span>
              </Link>
            )}
            <Link
              to="/catalog"
              className="px-4 py-2 bg-brand-red-600 hover:bg-brand-red-700 text-white rounded text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <FiPackage className="text-xs" />
              <span>Browse Catalog & RFQ</span>
            </Link>
            <button
              onClick={() => signOut()}
              className="px-3 py-2 border border-brand-gray-300 hover:bg-brand-gray-50 text-brand-gray-700 rounded text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FiLogOut className="text-brand-gray-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Admin Access Callout for Admins visiting Client Portal */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-brand-gray-900 via-brand-gray-800 to-brand-gray-900 text-white rounded-xl p-5 mb-6 shadow-sm border border-brand-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-brand-red-600 rounded-lg flex items-center justify-center font-bold text-lg text-white shrink-0">
                <FiShield />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Trade Desk Admin Console Available</h3>
                <p className="text-xs text-brand-gray-300 mt-0.5">
                  You are authorized to manage product listings, therapeutic categories, wholesale inquiries, and company configurations.
                </p>
              </div>
            </div>
            <Link
              to="/admin"
              className="px-4 py-2 bg-brand-red-600 hover:bg-brand-red-700 text-white rounded text-xs font-bold transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-sm"
            >
              <span>Open Admin Console</span>
              <FiArrowRight />
            </Link>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quick Stats / Account Status */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Account Status Card */}
            <div className="bg-white border border-brand-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wider mb-4 border-b border-brand-gray-150 pb-2 flex items-center justify-between">
                <span>Importer Clearance Status</span>
                <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                  <FiCheckCircle /> Active
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-3.5">
                  <span className="text-brand-gray-500 block text-[11px]">Pricing Access</span>
                  <span className="font-bold text-brand-gray-900 text-sm mt-1 block">FOB Mumbai / CIF</span>
                  <span className="text-[10px] text-emerald-600 mt-1 block font-medium">&bull; Bulk Export Quotes</span>
                </div>

                <div className="bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-3.5">
                  <span className="text-brand-gray-500 block text-[11px]">Dossier & CoA Clearance</span>
                  <span className="font-bold text-brand-gray-900 text-sm mt-1 block">WHO-GMP & CDSCO</span>
                  <span className="text-[10px] text-emerald-600 mt-1 block font-medium">&bull; Instant Preview</span>
                </div>

                <div className="bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-3.5">
                  <span className="text-brand-gray-500 block text-[11px]">Dispatch Ports</span>
                  <span className="font-bold text-brand-gray-900 text-sm mt-1 block">JNPT Mumbai / Air</span>
                  <span className="text-[10px] text-emerald-600 mt-1 block font-medium">&bull; Cold-Chain Compliant</span>
                </div>
              </div>
            </div>

            {/* Inquiries & Requests */}
            <div className="bg-white border border-brand-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wider mb-4 border-b border-brand-gray-150 pb-2">
                Your Export Inquiries & Saved Requests
              </h2>

              <div className="text-center py-8 text-brand-gray-500">
                <div className="w-12 h-12 bg-brand-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-brand-gray-400">
                  <FiFileText className="text-xl" />
                </div>
                <h3 className="font-bold text-brand-gray-800 text-sm mb-1">No Active Orders Yet</h3>
                <p className="text-xs text-brand-gray-600 max-w-sm mx-auto mb-4">
                  Browse our pharmaceutical index to submit your first Request for Quotation (RFQ) or download Certificate of Analysis specifications.
                </p>
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-red-600 hover:bg-brand-red-700 text-white rounded text-xs font-bold transition-colors"
                >
                  <span>Explore 140+ Formulations</span>
                  <FiExternalLink className="text-xs" />
                </Link>
              </div>
            </div>

          </div>

          {/* Right Column: Dedicated Trade Officer Contacts */}
          <div className="space-y-6">
            <div className="bg-white border border-brand-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wider mb-3 border-b border-brand-gray-150 pb-2">
                Dedicated Trade Desk
              </h2>
              <p className="text-xs text-brand-gray-600 mb-4 leading-relaxed">
                Need urgent shipment dispatch schedules or customized custom packaging? Connect directly with our Mumbai trade desk.
              </p>

              <div className="space-y-2.5 text-xs">
                <a
                  href={`tel:${(companyData?.phone || '+91 93253 03018').replace(/\s+/g, '')}`}
                  className="flex items-center gap-2 p-2.5 border border-brand-gray-200 rounded-lg hover:bg-brand-gray-50 text-brand-gray-800 font-semibold transition-colors"
                >
                  <FiPhone className="text-brand-red-600 text-sm" />
                  <span>{companyData?.phone || '+91 93253 03018'}</span>
                </a>

                <a
                  href={`https://wa.me/${(companyData?.whatsapp || '+919325303018').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold transition-colors"
                >
                  <FaWhatsapp className="text-base" />
                  <span>WhatsApp Trade Desk</span>
                </a>
              </div>

              <div className="mt-4 pt-3 border-t border-brand-gray-150 text-[11px] text-brand-gray-500">
                <span>Business Hours: {companyData?.businessHours || 'Mon - Sat: 11:00 AM - 8:00 PM (IST)'}</span>
              </div>
            </div>

            <div className="bg-brand-gray-900 text-white rounded-xl p-6 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-brand-red-400 tracking-wider">
                Export Compliance Note
              </span>
              <h3 className="text-sm font-bold text-white mt-1 mb-2">
                Regulatory Dossier Support
              </h3>
              <p className="text-xs text-brand-gray-300 leading-relaxed mb-3">
                All commercial shipments include verified Batch Release Certificates, COA under IP/BP/USP standards, and COPP documentation upon request.
              </p>
              <Link
                to="/compliance"
                className="text-xs font-bold text-brand-red-400 hover:text-brand-red-300 inline-flex items-center gap-1"
              >
                <span>View Regulatory Credentials</span>
                <FiExternalLink className="text-xs" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
