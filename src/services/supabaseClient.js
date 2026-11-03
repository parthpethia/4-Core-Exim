import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Check whether valid Supabase credentials have been configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-supabase-anon-key')
);

if (!isSupabaseConfigured) {
  console.warn(
    '[4Core Exim Supabase Auth] Supabase URL or Anon Key is missing or using placeholder values. ' +
    'Please add valid credentials to your .env file (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) to enable live OAuth.'
  );
}

/**
 * Singleton Supabase client instance.
 * When unconfigured, a safe fallback client is provided so the UI renders smoothly without crashing.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signInWithOAuth: async () => {
          throw new Error('Supabase is not configured yet. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
        },
        signOut: async () => ({ error: null }),
      },
    };
