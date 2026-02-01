import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON || '').trim();
const supabaseServiceKey = (import.meta.env.VITE_SUPABASE_SERVICEROLEKEY || '').trim();

const isConfigValid = supabaseUrl && supabaseAnonKey;

export const isSupabaseConfigured = () => !!isConfigValid;

export const supabase: SupabaseClient = isConfigValid
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);

export const supabaseAdmin: SupabaseClient = (isConfigValid && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  : (null as any);