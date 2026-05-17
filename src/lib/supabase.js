import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '[Triplan] Missing Supabase environment variables.\n' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env / Vercel project settings.'
  )
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// OpenFreeMap - completely free, no API key, beautiful OSM tiles
export const MAP_STYLE = 'https://tiles.openfreemap.org/styles/bright'
