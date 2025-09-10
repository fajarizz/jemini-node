// Supabase client configuration
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
// Service role key intentionally not instantiated until needed for security.

if (!url) throw new Error('Missing SUPABASE_URL env variable');
if (!anonKey) throw new Error('Missing SUPABASE_ANON_KEY env variable');

// Public client (RLS enforced)
export const supabase: SupabaseClient = createClient(url, anonKey, {
  auth: { persistSession: false }
});
