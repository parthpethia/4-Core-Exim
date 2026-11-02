import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { AuthContext } from './authContextDef';

const DEFAULT_ADMIN_EMAILS = ['admin@4coreexim.com', 'exports@4coreexim.com'];

/**
 * Determine if an email belongs to an administrator.
 * @param {string} email
 * @returns {boolean}
 */
function checkIsAdminEmail(email) {
  if (!email) return false;
  const configuredAdmins = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  const adminList = configuredAdmins.length > 0 ? configuredAdmins : DEFAULT_ADMIN_EMAILS;
  return adminList.includes(email.toLowerCase());
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDbAdmin, setIsDbAdmin] = useState(false);
  const [adminCheckLoading, setAdminCheckLoading] = useState(false);

  // Check database admin status (admin_users table or is_admin RPC)
  const verifyAdminStatus = useCallback(async (currentUser) => {
    if (!currentUser?.email) {
      setIsDbAdmin(false);
      return false;
    }

    const email = currentUser.email.toLowerCase().trim();

    // Check dev override
    if (localStorage.getItem('4core_dev_admin_override') === email) {
      setIsDbAdmin(true);
      return true;
    }

    // Fast check: static admin list or JWT metadata
    if (checkIsAdminEmail(email)) {
      setIsDbAdmin(true);
      return true;
    }

    if (currentUser.user_metadata?.role === 'admin' || currentUser.app_metadata?.role === 'admin') {
      setIsDbAdmin(true);
      return true;
    }

    setAdminCheckLoading(true);
    try {
      // Check admin_users table in Supabase
      const { data, error } = await supabase
        .from('admin_users')
        .select('email')
        .ilike('email', email)
        .maybeSingle();

      if (!error && data?.email) {
        setIsDbAdmin(true);
        setAdminCheckLoading(false);
        return true;
      }

      // Check via is_admin() RPC function if created
      const { data: rpcAdmin } = await supabase.rpc('is_admin');
      if (rpcAdmin === true) {
        setIsDbAdmin(true);
        setAdminCheckLoading(false);
        return true;
      }
    } catch (err) {
      console.warn('[4Core Exim Auth] Admin verification error:', err);
    } finally {
      setAdminCheckLoading(false);
    }

    setIsDbAdmin(false);
    return false;
  }, []);

  // Determine user role dynamically
  const role = useMemo(() => {
    if (!user) return null;
    const email = user.email?.toLowerCase().trim();
    const isEmailAdmin = checkIsAdminEmail(email);
    const isMetaAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin';
    const isOverride = localStorage.getItem('4core_dev_admin_override') === email;

    return (isEmailAdmin || isMetaAdmin || isDbAdmin || isOverride) ? 'admin' : 'user';
  }, [user, isDbAdmin]);

  const isAdmin = role === 'admin';

  // Initialize session and attach live listener
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[4Core Exim Auth] Error fetching session:', error.message);
        }
        if (isMounted) {
          const currentUser = data?.session?.user || null;
          if (currentUser) {
            setSession(data?.session || null);
            setUser(currentUser);
            await verifyAdminStatus(currentUser);
          } else {
            // Check for saved local dev admin session
            const savedDevUser = localStorage.getItem('4core_dev_admin_user');
            if (savedDevUser) {
              try {
                const parsed = JSON.parse(savedDevUser);
                setUser(parsed);
                setIsDbAdmin(true);
              } catch (e) {}
            }
          }
        }
      } catch (err) {
        console.warn('[4Core Exim Auth] Session initialisation failed:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initSession();

    // Listen for auth state changes (OAuth login, signout, token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (isMounted) {
        const currentUser = newSession?.user || null;
        setSession(newSession);
        setUser(currentUser);
        if (currentUser) {
          localStorage.removeItem('4core_dev_admin_user');
          await verifyAdminStatus(currentUser);
        } else {
          setIsDbAdmin(false);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [verifyAdminStatus]);

  /**
   * Fast dev sign-in as Trade Desk Admin (for local testing without OAuth redirect).
   */
  const loginAsDevAdmin = useCallback((email = 'admin@4coreexim.com') => {
    const devUser = {
      id: 'dev-admin-id',
      email: email.toLowerCase().trim(),
      user_metadata: { full_name: 'Trade Desk Officer', role: 'admin' },
      app_metadata: { provider: 'dev', role: 'admin' },
    };
    localStorage.setItem('4core_dev_admin_user', JSON.stringify(devUser));
    localStorage.setItem('4core_dev_admin_override', devUser.email);
    setUser(devUser);
    setIsDbAdmin(true);
    return devUser;
  }, []);

  /**
   * One-click Dev mode admin toggle (persists in localStorage for local testing).
   */
  const grantDevAdmin = useCallback((targetEmail) => {
    const email = (targetEmail || user?.email)?.toLowerCase().trim();
    if (email) {
      localStorage.setItem('4core_dev_admin_override', email);
      setIsDbAdmin(true);
    }
  }, [user]);

  const revokeDevAdmin = useCallback(() => {
    localStorage.removeItem('4core_dev_admin_user');
    localStorage.removeItem('4core_dev_admin_override');
    setIsDbAdmin(false);
    if (user) {
      verifyAdminStatus(user);
    }
  }, [user, verifyAdminStatus]);

  /**
   * Initiate OAuth sign-in with provider (e.g. google, github).
   * @param {Object} options
   * @param {string} [options.provider='google'] - OAuth provider
   * @param {string} [options.redirectTo] - Destination callback URL
   * @param {'admin'|'user'} [options.targetRole='user'] - Target role intention
   */
  const signInWithOAuth = useCallback(async ({ provider = 'google', redirectTo, targetRole = 'user' } = {}) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing in .env. Please configure them to enable OAuth.');
    }

    try {
      if (targetRole) {
        localStorage.setItem('4core_intended_role', targetRole);
      }

      const callbackUrl = redirectTo || `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[4Core Exim Auth] OAuth initiation error:', error);
      throw error;
    }
  }, []);

  /**
   * Sign out current active user.
   */
  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem('4core_intended_role');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      setIsDbAdmin(false);
    } catch (error) {
      console.error('[4Core Exim Auth] Sign out error:', error);
      throw error;
    }
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    loading: loading || adminCheckLoading,
    role,
    isAdmin,
    isSupabaseConfigured,
    verifyAdminStatus: () => verifyAdminStatus(user),
    grantDevAdmin,
    revokeDevAdmin,
    loginAsDevAdmin,
    signInWithOAuth,
    signOut,
  }), [user, session, loading, adminCheckLoading, role, isAdmin, verifyAdminStatus, grantDevAdmin, revokeDevAdmin, loginAsDevAdmin, signInWithOAuth, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
