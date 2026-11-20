import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { FiShield, FiArrowRight, FiLogOut } from 'react-icons/fi';

/**
 * ProtectedRoute component to guard routes based on authentication and roles.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {boolean} [props.requireAdmin=false]
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, isAdmin, signOut, verifyAdminStatus } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-brand-gray-50 px-4">
        <div className="w-10 h-10 border-4 border-brand-green-200 border-t-brand-green-600 rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-brand-gray-600 tracking-wide uppercase">
          Verifying Trade Desk Clearance...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    const userEmail = user.email || 'your-email@example.com';

    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-brand-gray-50 px-4 py-12">
        <div className="max-w-lg w-full bg-white border border-brand-gray-200 rounded-xl p-8 shadow-sm">
          <div className="w-14 h-14 bg-brand-green-50 text-brand-green-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-green-200">
            <FiShield className="text-2xl" />
          </div>

          <div className="text-center mb-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-green-800 bg-brand-green-100 px-2.5 py-1 rounded-full inline-block mb-3 border border-brand-green-200">
              Admin Clearance Required
            </span>

            <h2 className="text-xl font-extrabold text-brand-gray-900 mb-2">
              Restricted Trade Desk Access
            </h2>

            <p className="text-xs text-brand-gray-600 leading-relaxed">
              Your authenticated account (<span className="font-mono font-semibold text-brand-gray-900 bg-brand-gray-100 px-1.5 py-0.5 rounded">{userEmail}</span>) is not yet registered as a Trade Desk Administrator.
            </p>
          </div>

          {/* Database Whitelist Notice */}
          <div className="bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-4 mb-5 text-left text-xs">
            <span className="font-bold text-brand-gray-800 block mb-1">
              Admin Access Authorization
            </span>
            <p className="text-[11px] text-brand-gray-600 mb-2">
              If your administrator just added this email to the database, click below to refresh your credentials:
            </p>
            <button
              onClick={() => verifyAdminStatus && verifyAdminStatus()}
              className="w-full py-2 px-3 bg-brand-green-600 hover:bg-brand-green-700 text-white rounded text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>🔄 Re-check Database Clearance</span>
            </button>
          </div>

          <div className="space-y-2">
            <Link
              to="/dashboard"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-gray-900 hover:bg-brand-gray-800 text-white rounded text-xs font-bold transition-colors shadow-sm"
            >
              <span>Continue to Client Portal</span>
              <FiArrowRight />
            </Link>

            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-brand-gray-200 hover:bg-brand-gray-50 text-brand-gray-700 rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              <FiLogOut className="text-brand-gray-500" />
              <span>Sign Out / Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
