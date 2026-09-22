import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/** True when real Supabase credentials were provided at build time. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('⚠️ VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. Auth will fail.');
}

// createClient() throws if the URL/key are empty, which would blank the whole
// app before React mounts. Fall back to inert placeholders so the UI still
// renders (login will simply fail) when the env vars are absent, e.g. in CI.
export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'placeholder-anon-key'
);
