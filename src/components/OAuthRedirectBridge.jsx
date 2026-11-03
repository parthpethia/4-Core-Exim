import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Supabase sometimes returns OAuth tokens on the Site URL (/)
 * instead of /auth/callback when the callback isn't in the allow-list.
 * Bridge any auth hash/?code= payload into the real callback route.
 */
export default function OAuthRedirectBridge() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/auth/callback') return;

    const hash = window.location.hash || '';
    const search = location.search || '';
    const hasHashToken =
      hash.includes('access_token=') ||
      hash.includes('refresh_token=') ||
      hash.includes('error=');
    const hasCode = /[?&]code=/.test(search);

    if (!hasHashToken && !hasCode) return;

    navigate(
      {
        pathname: '/auth/callback',
        search: hasCode ? search : '',
        hash: hasHashToken ? hash.replace(/^#/, '') : ''
      },
      { replace: true }
    );
  }, [location.pathname, location.search, navigate]);

  return null;
}
