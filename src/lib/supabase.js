import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(url && key && !url.includes('YOUR_PROJECT_ID') && !key.includes('YOUR_'))
export const demoMode = import.meta.env.VITE_DEMO_MODE === 'true'
export const supabase = supabaseConfigured
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null

export function requireSupabase() {
  if (!supabase) throw new Error('Supabase lama dejin. Ku dar VITE_SUPABASE_URL iyo VITE_SUPABASE_ANON_KEY faylka .env.local, kadib dib u bilow app-ka.')
  return supabase
}
