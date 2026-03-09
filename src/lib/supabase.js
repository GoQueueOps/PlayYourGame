import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ── Guard: catch missing env vars before they cause a blank page ──
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `[Supabase] Missing environment variables.\n` +
    `VITE_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗ MISSING'}\n` +
    `VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓' : '✗ MISSING'}\n\n` +
    `Make sure your .env file at the project root contains:\n` +
    `VITE_SUPABASE_URL=https://xxxx.supabase.co\n` +
    `VITE_SUPABASE_ANON_KEY=eyJ...`
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage so users stay logged in on refresh
    persistSession: true,
    // Automatically refresh the JWT before it expires
    autoRefreshToken: true,
    // Detect session from URL (needed for OAuth + magic link redirects)
    detectSessionInUrl: true,
  },
})