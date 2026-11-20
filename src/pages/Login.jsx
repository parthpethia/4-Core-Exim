import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { FiShield, FiUser, FiBriefcase, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { FaGoogle, FaGithub } from 'react-icons/fa';

export default function Login() {
  const { user, isAdmin, signInWithOAuth, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Active portal tab: 'user' for clients/buyers, 'admin' for trade desk exporters
  const [activeTab, setActiveTab] = useState('user');
  const [authError, setAuthError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to respective dashboard
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, isAdmin, navigate, location.state]);

  const handleOAuthLogin = async (provider) => {
    setAuthError(null);
    setIsSubmitting(true);

    try {
      if (!isSupabaseConfigured) {
        throw new Error(
          'Supabase credentials are not detected in your .env file. Please populate VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to initiate OAuth authentication.'
        );
      }

      await signInWithOAuth({
        provider,
        targetRole: activeTab,
        redirectTo: `${window.location.origin}/auth/callback`,
      });
    } catch (err) {
      setAuthError(err.message || 'OAuth initialization failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand identity badge */}
        <div className="flex justify-center mb-4">
          <Link to="/" className="flex items-center gap-2 select-none group">
            <div className="bg-white p-2 rounded-lg border border-brand-gray-200 shadow-xs">
              <img
                src="/logo.png"
                alt="4Core Exim"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </div>
          </Link>
        </div>

        <h1 className="text-center text-2xl sm:text-3xl font-extrabold text-brand-gray-900 tracking-tight">
          Secure Portal Authentication
        </h1>
        <p className="mt-1.5 text-center text-xs text-brand-gray-600 max-w-xs mx-auto">
          Single Sign-On (OAuth) for Verified Importers & 4Core Exim Trade Officers
        </p>

        {/* Configuration Notice if .env is missing live credentials */}
        {!isSupabaseConfigured && (
          <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start gap-2.5 shadow-sm">
            <FiAlertCircle className="text-base text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold block">Supabase OAuth Setup Required</span>
              <span>
                To connect live Google/GitHub OAuth, add your <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env</code> and enable your OAuth provider in your Supabase dashboard.
              </span>
            </div>
          </div>
        )}

        {/* Auth Error Banner */}
        {authError && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-900 text-xs flex items-start gap-2.5">
            <FiAlertCircle className="text-base text-red-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold block">Authentication Notice</span>
              <span>{authError}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-brand-gray-200 rounded-xl sm:px-10">
          
          {/* User vs Admin Role Tabs */}
          <div className="flex border-b border-brand-gray-200 mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('user'); setAuthError(null); }}
              className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'user'
                  ? 'border-brand-green-600 text-brand-green-700'
                  : 'border-transparent text-brand-gray-500 hover:text-brand-gray-800'
              }`}
            >
              <FiUser className="text-sm" />
              <span>Client / Importer</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('admin'); setAuthError(null); }}
              className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'border-brand-green-600 text-brand-green-700'
                  : 'border-transparent text-brand-gray-500 hover:text-brand-gray-800'
              }`}
            >
              <FiShield className="text-sm" />
              <span>Trade Desk Admin</span>
            </button>
          </div>

          {/* Role Description Card */}
          <div className="mb-6 p-3 rounded-lg bg-brand-gray-50 border border-brand-gray-200 text-xs">
            {activeTab === 'user' ? (
              <div>
                <span className="font-bold text-brand-gray-900 flex items-center gap-1">
                  <FiBriefcase className="text-brand-green-600" /> Importer & Procurement Account
                </span>
                <p className="text-[11px] text-brand-gray-600 mt-1">
                  Access live FOB/CIF quotation tracking, save pharmacopeial formulations (IP/BP/USP), and inspect CoA dossiers.
                </p>
              </div>
            ) : (
              <div>
                <span className="font-bold text-brand-gray-900 flex items-center gap-1">
                  <FiShield className="text-brand-green-600" /> 4Core Exim Officer Clearance
                </span>
                <p className="text-[11px] text-brand-gray-600 mt-1">
                  Authorized access for 4Core Exim trade desk operators. Requires an email whitelisted under administrator clearance.
                </p>
              </div>
            )}
          </div>

          {/* OAuth Authentication Providers */}
          <div className="space-y-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleOAuthLogin('google')}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-brand-gray-300 rounded-lg text-xs font-bold text-brand-gray-700 bg-white hover:bg-brand-gray-50 hover:border-brand-gray-400 transition-colors shadow-subtle cursor-pointer disabled:opacity-50"
            >
              <FaGoogle className="text-red-500 text-sm" />
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleOAuthLogin('github')}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-brand-gray-300 rounded-lg text-xs font-bold text-brand-gray-700 bg-white hover:bg-brand-gray-50 hover:border-brand-gray-400 transition-colors shadow-subtle cursor-pointer disabled:opacity-50"
            >
              <FaGithub className="text-brand-gray-900 text-sm" />
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-brand-gray-200">
            <div className="flex items-center justify-between text-[11px] text-brand-gray-500">
              <span className="flex items-center gap-1">
                <FiShield className="text-emerald-600 text-xs" /> Supabase OAuth 2.0
              </span>
              <span>256-bit Encrypted</span>
            </div>
          </div>

        </div>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs font-semibold text-brand-gray-600 hover:text-brand-green-600 transition-colors inline-flex items-center gap-1"
          >
            <span>Return to Public Export Catalog</span>
            <FiArrowRight className="text-xs" />
          </Link>
        </div>

      </div>
    </div>
  );
}
