// Admin client for operations requiring elevated permissions
// This client bypasses Row Level Security (RLS) using the service role key
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Service role key should be in environment variables for security
const SUPABASE_URL = "https://paywaomkmjssbtkzwnwd.supabase.co";

// For production, use process.env.SUPABASE_SERVICE_ROLE_KEY
// For security, never commit this key to version control
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env?.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process?.env?.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not found. Admin operations may fail.');
}

// Admin client with full access (bypasses RLS)
// Use this for system operations, user management, and admin tasks
export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY || '', // Will fail operations if not set
  {
    auth: {
      // Admin client typically doesn't need persistent sessions
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

// Utility to check if admin client is properly configured
export const isAdminClientConfigured = () => {
  return Boolean(SUPABASE_SERVICE_ROLE_KEY);
};

// Export regular client as well for convenience
export { supabase } from './client';

// Re-export types for convenience
export type { Database } from './types';
