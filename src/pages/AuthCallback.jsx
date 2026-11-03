import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { FiAlertTriangle, FiArrowRight } from 'react-icons/fi';

function parseAuthParams() {
  const query = new URLSearchParams(window.location.search);
  const hashRaw = window.location.hash?.startsWith('#')
    ? window.location.hash.slice(1)
    : (window.location.hash || '');
  const hash = new URLSearchParams(hashRaw);

  return {
    code: query.get('code'),
    access_token: hash.get('access_token') || query.get('access_token'),
    refresh_token: hash.get('refresh_token') || query.get('refresh_token'),
    error: hash.get('error_description') || hash.get('error')
      || query.get('error_description') || query.get('error')
  };
}

function resolvePostLoginPath(sessionUser) {
  const intendedRole = localStorage.getItem('4core_intended_role');
  localStorage.removeItem('4core_intended_role');

  const userEmail = sessionUser?.email?.toLowerCase()?.trim();
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || 'admin@4coreexim.com,exports@4coreexim.com')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const userIsAdmin =
    (userEmail && adminEmails.includes(userEmail)) ||
    sessionUser?.user_metadata?.role === 'admin' ||
    sessionUser?.app_metadata?.role === 'admin' ||
    (userEmail && localStorage.getItem('4core_dev_admin_override') === userEmail);

  if (userIsAdmin || intendedRole === 'admin') return '/admin';
  return '/dashboard';
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, loading } = useAuth();
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setErrorMessage('Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }

    let cancelled = false;

    async function finalizeOAuth() {
      try {
        const params = parseAuthParams();

        if (params.error) {
          if (!cancelled) setErrorMessage(params.error);
          return;
        }

        // 1) PKCE code exchange
        if (params.code) {
          const { error } = await supabase.auth.exchangeCodeForSession(params.code);
          if (error) throw error;
        }
        // 2) Implicit / hash tokens (what you landed with on localhost:3000/#access_token=...)
        else if (params.access_token && params.refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token
          });
          if (error) throw error;
        }

        // Strip secrets from the address bar
        if (window.location.hash || window.location.search.includes('code=')) {
          window.history.replaceState(null, '', '/auth/callback');
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!data?.session?.user) {
          // Brief wait — AuthProvider / detectSessionInUrl may still be settling
          await new Promise((r) => setTimeout(r, 400));
          const retry = await supabase.auth.getSession();
          if (!retry.data?.session?.user) {
            throw new Error(
              'No session found after OAuth redirect. Add http://localhost:3000/auth/callback to Supabase Auth → URL Configuration → Redirect URLs, then sign in again.'
            );
          }
          if (!cancelled) {
            navigate(resolvePostLoginPath(retry.data.session.user), { replace: true });
          }
          return;
        }

        if (!cancelled) {
          navigate(resolvePostLoginPath(data.session.user), { replace: true });
        }
      } catch (err) {
        console.error('[4Core Exim Auth Callback] Error:', err);
        if (!cancelled) {
          setErrorMessage(err.message || 'Failed to finalize OAuth authentication session.');
        }
      }
    }

    finalizeOAuth();
    return () => {
      cancelled = true;
    };
  }, [location.key, navigate]);

  // Fallback if AuthContext already has the user
  useEffect(() => {
    if (errorMessage || loading || !user) return;
    navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
  }, [user, isAdmin, loading, navigate, errorMessage]);

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
