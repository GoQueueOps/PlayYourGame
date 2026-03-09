import { createClient } from '@supabase/supabase-js'

// Your Vercel env vars are named REACT_APP_* so we read both prefixes.
// Vite exposes vars via import.meta.env — REACT_APP_ vars work fine here
// as long as they're set in Vercel (which they are).
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.REACT_APP_SUPABASE_URL

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Env vars not found.\n' +
    'Checked: VITE_SUPABASE_URL / REACT_APP_SUPABASE_URL → ' + (supabaseUrl ? '✓' : '✗') + '\n' +
    'Checked: VITE_SUPABASE_ANON_KEY / REACT_APP_SUPABASE_ANON_KEY → ' + (supabaseAnonKey ? '✓' : '✗')
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)