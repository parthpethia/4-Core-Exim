import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { supabase } from '../services/supabaseClient';
import { FiAlertTriangle, FiArrowRight } from 'react-icons/fi';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, loading } = useAuth();
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    // Check if error parameters exist in query or hash
    const params = new URLSearchParams(location.search);
    const errorDesc = params.get('error_description') || params.get('error');

    if (errorDesc) {
      setErrorMessage(errorDesc);
      return;
    }

    // Process hash parameters if present
    const hash = window.location.hash;
    if (hash && hash.includes('error=')) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const hashError = hashParams.get('error_description') || hashParams.get('error');
      if (hashError) {
        setErrorMessage(hashError);
        return;
      }
    }

    // Await session resolution from Supabase
    async function checkSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data?.session?.user) {
          const intendedRole = localStorage.getItem('4core_intended_role');
          localStorage.removeItem('4core_intended_role');

          const userEmail = data.session.user.email;
          const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || 'admin@4coreexim.com,exports@4coreexim.com')
            .split(',')
            .map(e => e.trim().toLowerCase());

          const userIsAdmin = adminEmails.includes(userEmail?.toLowerCase()) || 
                             data.session.user.user_metadata?.role === 'admin' ||
                             localStorage.getItem('4core_dev_admin_override') === userEmail?.toLowerCase();

          if (userIsAdmin || intendedRole === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }
      } catch (err) {
        console.error('[4Core Exim Auth Callback] Error:', err);
        setErrorMessage(err.message || 'Failed to finalize OAuth authentication session.');
      }
    }

    checkSession();
  }, [location, navigate]);

  // If user state is already available from AuthContext
  useEffect(() => {
    if (!loading && user) {
      const intendedRole = localStorage.getItem('4core_intended_role');
      if (isAdmin || intendedRole === 'admin') {
        localStorage.removeItem('4core_intended_role');
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, isAdmin, loading, navigate]);

  if (errorMessage) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-brand-gray-50 px-4">
        <div className="max-w-md w-full bg-white border border-brand-gray-200 rounded-xl p-8 shadow-sm text-center">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertTriangle className="text-xl" />
          </div>
          <h2 className="text-lg font-bold text-brand-gray-900 mb-2">OAuth Authentication Notice</h2>
          <p className="text-xs text-brand-gray-600 mb-6 leading-relaxed">{errorMessage}</p>
          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-red-600 hover:bg-brand-red-700 text-white rounded text-xs font-bold transition-colors"
          >
            <span>Return to Login</span>
            <FiArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-brand-gray-50 px-4">
      <div className="w-12 h-12 border-4 border-brand-red-200 border-t-brand-red-600 rounded-full animate-spin mb-4" />
      <h2 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wide">
        Finalizing OAuth Authentication...
      </h2>
      <p className="text-xs text-brand-gray-500 mt-1">
        Synchronizing credentials with 4Core Exim Trade Desk
      </p>
    </div>
  );
}
