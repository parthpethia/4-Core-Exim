import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

function hasOAuthPayload(search, hash) {
  const q = search || '';
  const h = hash || '';
  return (
    /[?&]code=/.test(q) ||
    h.includes('access_token=') ||
    h.includes('refresh_token=') ||
    /[?&]error=/.test(q) ||
    h.includes('error=')
  );
}

/**
 * If Supabase redirects to Site URL (/) with ?code= or #access_token=,
 * bounce to /auth/callback before AuthProvider tries to use the session.
 * Uses a full navigation so the callback is the only place that runs PKCE exchange.
 */
export default function OAuthRedirectBridge() {
  const location = useLocation();

  useLayoutEffect(() => {
    if (location.pathname === '/auth/callback') return;
    if (!hasOAuthPayload(location.search, window.location.hash || '')) return;

    const search = location.search || '';
    const hash = window.location.hash || '';
    window.location.replace(
      `${window.location.origin}/auth/callback${search}${hash}`
    );
  }, [location.pathname, location.search]);

  return null;
}
